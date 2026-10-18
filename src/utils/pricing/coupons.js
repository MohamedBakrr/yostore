/**
 * Demo coupon registry. All promotional logic here is demonstration behavior.
 *
 * Rules (documented in SPEC.md §11):
 *  - One coupon per cart; coupons never stack.
 *  - Coupon discount applies to the post-item-discount subtotal.
 *  - `shipping` coupons zero out the shipping cost instead.
 */

export const COUPONS = [
    {
        code: "WELCOME10",
        label: "10% off your order",
        type: "percent",
        value: 10,
        minSubtotal: 50,
        enabled: true,
        expiresAt: null,
    },
    {
        code: "EDITORIAL20",
        label: "$20 off orders over $100",
        type: "fixed",
        value: 20,
        minSubtotal: 100,
        enabled: true,
        expiresAt: null,
    },
    {
        code: "FREESHIP",
        label: "Free standard shipping over $75",
        type: "shipping",
        value: 0,
        minSubtotal: 75,
        enabled: true,
        expiresAt: null,
    },
    {
        code: "EXPIRED5",
        label: "5% off (expired)",
        type: "percent",
        value: 5,
        minSubtotal: 0,
        enabled: true,
        expiresAt: "2020-01-01T00:00:00.000Z", // deliberately expired demo case
    },
    {
        code: "SINGLEUSE25",
        label: "25% off (currently disabled)",
        type: "percent",
        value: 25,
        minSubtotal: 200,
        enabled: false,
        expiresAt: null,
    },
];

export const COUPON_NOT_FOUND = "coupon-not-found";
export const COUPON_DISABLED = "coupon-disabled";
export const COUPON_EXPIRED = "coupon-expired";
export const COUPON_MINIMUM = "coupon-minimum";

/**
 * Validate a coupon code against a subtotal.
 * @returns {{ ok: true, coupon: object } | { ok: false, reason: string, minSubtotal?: number }}
 */
export function validateCoupon(code, subtotal) {
    const normalized = String(code ?? "")
        .trim()
        .toUpperCase();
    if (!normalized) return { ok: false, reason: COUPON_NOT_FOUND };

    const coupon = COUPONS.find((c) => c.code === normalized);
    if (!coupon) return { ok: false, reason: COUPON_NOT_FOUND };
    if (!coupon.enabled) return { ok: false, reason: COUPON_DISABLED };
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
        return { ok: false, reason: COUPON_EXPIRED };
    }
    if (subtotal < (coupon.minSubtotal ?? 0)) {
        return {
            ok: false,
            reason: COUPON_MINIMUM,
            minSubtotal: coupon.minSubtotal,
        };
    }
    return { ok: true, coupon };
}

export function couponErrorMessage(result) {
    switch (result?.reason) {
        case COUPON_DISABLED:
            return "This code is not currently active.";
        case COUPON_EXPIRED:
            return "This code has expired.";
        case COUPON_MINIMUM:
            return `This code requires a subtotal of at least $${result.minSubtotal.toFixed(2)}.`;
        default:
            return "We could not find that code. Try WELCOME10.";
    }
}
