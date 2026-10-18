/** Validators for untrusted persisted records. Return boolean; false discards. */

export function isValidCartItem(item) {
    return (
        item &&
        typeof item === "object" &&
        Number.isFinite(Number(item.id)) &&
        typeof item.title === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number.isFinite(Number(item.quantity)) &&
        item.quantity > 0
    );
}

export function isValidCart(data) {
    return (
        data &&
        typeof data === "object" &&
        Array.isArray(data.items) &&
        data.items.every(isValidCartItem) &&
        (data.couponCode == null || typeof data.couponCode === "string") &&
        (typeof data.shippingMethodId === "string" ||
            data.shippingMethodId == null)
    );
}

export function isValidWishlist(data) {
    return (
        data &&
        typeof data === "object" &&
        Array.isArray(data.ids) &&
        data.ids.every((id) => Number.isFinite(Number(id)))
    );
}

export function isValidSession(data) {
    return (
        data &&
        typeof data === "object" &&
        typeof data.accountId === "string" &&
        typeof data.email === "string"
    );
}

export function isValidTheme(data) {
    return data === "light" || data === "dark";
}

export function isValidCheckoutDraft(data) {
    return data && typeof data === "object" && typeof data.step === "number";
}

export function isValidRecent(data) {
    return (
        data &&
        typeof data === "object" &&
        Array.isArray(data.entries) &&
        data.entries.every(
            (e) =>
                e && Number.isFinite(Number(e.id)) && typeof e.at === "string",
        )
    );
}

export function isValidOrderList(data) {
    return (
        Array.isArray(data) &&
        data.every((o) => o && typeof o.orderId === "string")
    );
}
