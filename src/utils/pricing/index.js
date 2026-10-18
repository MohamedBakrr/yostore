/**
 * Pure pricing functions. Every number the UI shows comes from here —
 * cart drawer, cart page, checkout steps, and order review all share it.
 *
 * Display currency is USD (DummyJSON prices are USD). Totals never go negative.
 */

import { validateCoupon } from "./coupons";

export const MAX_QUANTITY = 99;

export const SHIPPING_METHODS = [
    {
        id: "standard",
        name: "Standard",
        description: "Arrives in 5–8 business days",
        cost: 5.95,
        etaMin: 5,
        etaMax: 8,
        freeOver: 100,
    },
    {
        id: "express",
        name: "Express",
        description: "Arrives in 2–3 business days",
        cost: 14.95,
        etaMin: 2,
        etaMax: 3,
        freeOver: null,
    },
    {
        id: "pickup",
        name: "Demo pickup",
        description: "Collect in 3–5 days (simulated location)",
        cost: 0,
        etaMin: 3,
        etaMax: 5,
        freeOver: null,
    },
];

export function getShippingMethod(id) {
    return SHIPPING_METHODS.find((m) => m.id === id) ?? SHIPPING_METHODS[0];
}

function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Discounted unit price for a (price, discountPercentage) pair.
 * DummyJSON `price` is treated as the list price everywhere in YoStore;
 * the customer pays `price × (1 − discount%)`.
 */
export function unitPriceFor(price, discountPercentage) {
    const discount = Math.min(
        Math.max(Number(discountPercentage) || 0, 0),
        100,
    );
    return round2((Number(price) || 0) * (1 - discount / 100));
}

function lineUnitPrice(item) {
    return unitPriceFor(item.price, item.discountPercentage);
}

/** Gross sum before any discounts. */
export function computeSubtotal(items) {
    return round2(
        items.reduce(
            (sum, item) =>
                sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
            0,
        ),
    );
}

/** Per-line item discounts (DummyJSON discountPercentage). */
export function computeItemDiscounts(items) {
    return round2(
        items.reduce((sum, item) => {
            const qty = Number(item.quantity) || 0;
            const gross = (Number(item.price) || 0) * qty;
            return sum + gross - lineUnitPrice(item) * qty;
        }, 0),
    );
}

/** Subtotal after item discounts — the base coupons are measured against. */
export function computeMerchandiseTotal(items) {
    return round2(computeSubtotal(items) - computeItemDiscounts(items));
}

export function computeCouponDiscount(merchandiseTotal, coupon) {
    if (!coupon) return 0;
    if (coupon.type === "percent") {
        return round2(
            merchandiseTotal * (Math.min(Math.max(coupon.value, 0), 100) / 100),
        );
    }
    if (coupon.type === "fixed") {
        return round2(Math.min(Math.max(coupon.value, 0), merchandiseTotal));
    }
    return 0; // shipping-type coupons discount shipping, not merchandise
}

export function computeShippingCost(methodId, merchandiseTotal, coupon) {
    const method = getShippingMethod(methodId);
    if (method.freeOver != null && merchandiseTotal >= method.freeOver)
        return 0;
    if (coupon?.type === "shipping") return 0;
    return round2(method.cost);
}

/**
 * The single totals calculator used across the app.
 *
 * @param {object} options
 * @param {Array} options.items cart items
 * @param {string|null} options.couponCode applied coupon code
 * @param {string} options.shippingMethodId selected shipping method id
 * @returns {object} full totals breakdown; `couponError` set when invalid.
 */
export function computeTotals({
    items = [],
    couponCode = null,
    shippingMethodId = "standard",
} = {}) {
    const safeItems = Array.isArray(items) ? items : [];
    const subtotal = computeSubtotal(safeItems);
    const itemDiscounts = computeItemDiscounts(safeItems);
    const merchandiseTotal = computeMerchandiseTotal(safeItems);

    let coupon = null;
    let couponError = null;
    if (couponCode) {
        const result = validateCoupon(couponCode, merchandiseTotal);
        if (result.ok) coupon = result.coupon;
        else couponError = result;
    }

    const couponDiscount = computeCouponDiscount(merchandiseTotal, coupon);
    const discountedMerchandise = round2(
        Math.max(merchandiseTotal - couponDiscount, 0),
    );
    const shipping = computeShippingCost(
        shippingMethodId,
        discountedMerchandise,
        coupon,
    );
    const total = round2(Math.max(discountedMerchandise + shipping, 0));

    return {
        itemCount: safeItems.reduce((n, i) => n + (Number(i.quantity) || 0), 0),
        subtotal,
        itemDiscounts,
        merchandiseTotal,
        coupon: coupon ? coupon.code : null,
        couponDiscount,
        shipping,
        shippingMethod: getShippingMethod(shippingMethodId).id,
        total,
        couponError,
    };
}
