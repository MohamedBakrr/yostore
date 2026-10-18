import { MAX_QUANTITY } from "../../utils/pricing";

/** Clamp a requested quantity to policy and known stock. */
export function clampQuantity(quantity, stock) {
    const max = Math.max(
        1,
        Math.min(
            MAX_QUANTITY,
            Number.isFinite(Number(stock)) ? Number(stock) : MAX_QUANTITY,
        ),
    );
    const q = Math.floor(Number(quantity) || 1);
    return Math.min(Math.max(q, 1), max);
}

/**
 * Merge guest items into account items.
 * Duplicate products combine quantities, clamped to policy and stock.
 * Guest-first ordering is preserved, then account-only items follow.
 */
export function mergeCartItems(accountItems = [], guestItems = []) {
    const byId = new Map();
    for (const item of [...accountItems, ...guestItems]) {
        if (!item) continue;
        const id = Number(item.id);
        const existing = byId.get(id);
        if (existing) {
            existing.quantity = clampQuantity(
                existing.quantity + (Number(item.quantity) || 0),
                item.stock ?? existing.stock,
            );
        } else {
            byId.set(id, {
                ...item,
                id,
                quantity: clampQuantity(item.quantity, item.stock),
            });
        }
    }
    return Array.from(byId.values());
}

/** Union of wishlist ids, guest entries appended to account entries. */
export function mergeWishlistIds(accountIds = [], guestIds = []) {
    return Array.from(
        new Set(
            [...accountIds, ...guestIds].map(Number).filter(Number.isFinite),
        ),
    );
}
