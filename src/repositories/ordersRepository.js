/**
 * Local demo order repository — frontend-only, no backend.
 *
 * Orders are persisted per mock account (`yostore:orders:account:<id>`), so the
 * order history of one account never appears under another. Cross-account reads
 * exist only for clearly-labeled demo surfaces: the admin dashboard and the
 * tracking lookup (documented as demonstration behavior, not authorization).
 *
 * Every timeline entry carries `simulated: true` — YoStore never invents real
 * carrier events and never claims live tracking.
 */

import { addDays } from "../utils/formatting";
import { getShippingMethod } from "../utils/pricing";
import { read, storageKeys, write } from "../utils/storage";
import { isValidOrderList } from "../utils/storage/validators";

/** Ordered status flow. `cancelled` branches off `pending`/`processing`. */
export const ORDER_STATUSES = [
    { id: "pending", label: "Order placed", step: 0 },
    { id: "processing", label: "Processing", step: 1 },
    { id: "shipped", label: "Shipped", step: 2 },
    { id: "delivered", label: "Delivered", step: 3 },
    { id: "cancelled", label: "Cancelled", step: -1 },
];

export function getOrderStatus(statusId) {
    return ORDER_STATUSES.find((s) => s.id === statusId) ?? ORDER_STATUSES[0];
}

const STATUS_EVENT_LABEL = {
    processing: "Processing started",
    shipped: "Handed to demo carrier",
    delivered: "Marked as delivered",
    cancelled: "Order cancelled",
};

function accountKey(accountId) {
    return storageKeys.orders(accountId);
}

function loadFor(accountId) {
    // `null` (guest demo orders) maps to the same key shape via storageKeys.
    const list = read(accountKey(accountId), isValidOrderList, []);
    return Array.isArray(list) ? list : [];
}

function saveFor(accountId, list) {
    return write(accountKey(accountId), list);
}

function byNewest(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
}

/** Compact, unpredictable-looking demo order id, e.g. `YS-9F3K2B`. */
export function generateOrderId() {
    const stamp = Date.now().toString(36).toUpperCase().slice(-4);
    const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
    return `YS-${stamp}${rand}`;
}

/**
 * Build a complete order record from validated checkout state.
 * Item/price/address snapshots are copied so later catalog changes cannot
 * rewrite history.
 */
export function buildOrder({
    accountId,
    items,
    totals,
    contact,
    shippingMethodId,
    paymentMethodId,
    couponCode = null,
}) {
    const now = new Date().toISOString();
    const method = getShippingMethod(shippingMethodId);

    return {
        orderId: generateOrderId(),
        accountId: accountId ?? null, // null => guest demo order
        demo: true,
        createdAt: now,
        items: items.map((item) => ({
            id: Number(item.id),
            title: item.title,
            price: Number(item.price) || 0,
            discountPercentage: Number(item.discountPercentage) || 0,
            thumbnail: item.thumbnail ?? null,
            quantity: Number(item.quantity) || 1,
        })),
        totals: {
            subtotal: totals.subtotal,
            itemDiscounts: totals.itemDiscounts,
            merchandiseTotal: totals.merchandiseTotal,
            coupon: totals.coupon ?? null,
            couponDiscount: totals.couponDiscount,
            shipping: totals.shipping,
            shippingMethodId: method.id,
            total: totals.total,
        },
        contact: {
            fullName: contact.fullName,
            email: contact.email,
            phone: contact.phone,
            address: contact.address,
            city: contact.city,
            postalCode: contact.postalCode,
            country: contact.country,
        },
        shippingMethodId: method.id,
        shippingMethodName: method.name,
        shippingEta: `${method.etaMin}–${method.etaMax} business days`,
        paymentMethodId: paymentMethodId === "online" ? "online" : "cod",
        paymentStatus: paymentMethodId === "online" ? "paid" : "due",
        paymentSimulated: paymentMethodId === "online",
        couponCode,
        status: "pending",
        estimatedDelivery: addDays(now, method.etaMax),
        timeline: [
            {
                key: "placed",
                label: "Order placed",
                at: now,
                simulated: true,
            },
        ],
    };
}

export const ordersRepository = {
    listByAccount(accountId) {
        return loadFor(accountId).slice().sort(byNewest);
    },

    getByOrder(accountId, orderId) {
        return (
            loadFor(accountId).find((o) => o.orderId === orderId) ?? null
        );
    },

    /** Create (or replace) an order. Returns the stored record. */
    save(order) {
        const list = loadFor(order.accountId);
        const idx = list.findIndex((o) => o.orderId === order.orderId);
        if (idx >= 0) list[idx] = order;
        else list.unshift(order);
        saveFor(order.accountId, list);
        return order;
    },

    /** Demo lookup across every account stored in this browser. */
    findByOrderId(orderId) {
        const id = String(orderId ?? "").trim().toUpperCase();
        if (!id) return null;
        for (const order of ordersRepository.listAll()) {
            if (String(order.orderId).toUpperCase() === id) return order;
        }
        return null;
    },

    /**
     * Every order stored on this browser (admin metrics + tracking demo).
     * Deliberately labeled as local demonstration data.
     */
    listAll() {
        const all = [];
        const prefix = "yostore:orders:account:";
        try {
            const keys = [];
            for (let i = 0; i < window.localStorage.length; i += 1) {
                keys.push(window.localStorage.key(i));
            }
            for (const key of keys) {
                if (typeof key !== "string") continue;
                if (!key.startsWith(prefix)) continue;
                const accountId = key.slice(prefix.length);
                all.push(...loadFor(accountId));
            }
        } catch {
            /* storage unavailable — return what we have */
        }
        return all.sort(byNewest);
    },

    /** Append a simulated status event (admin status updates). */
    updateStatus(accountId, orderId, statusId) {
        const status = getOrderStatus(statusId);
        const list = loadFor(accountId);
        const idx = list.findIndex((o) => o.orderId === orderId);
        if (idx < 0) return null;

        const order = { ...list[idx], status: status.id };
        const already = order.timeline?.some((e) => e.key === status.id);
        if (status.id !== "pending" && !already) {
            order.timeline = [
                ...(order.timeline ?? []),
                {
                    key: status.id,
                    label: STATUS_EVENT_LABEL[status.id] ?? status.label,
                    at: new Date().toISOString(),
                    simulated: true,
                },
            ];
        }
        list[idx] = order;
        saveFor(accountId, list);
        return order;
    },
};
