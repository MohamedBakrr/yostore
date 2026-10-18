/**
 * Versioned, validating localStorage wrapper.
 *
 * All browser storage is treated as untrusted:
 *  - Every value is stored inside an envelope `{ v, data }`.
 *  - Every read validates the envelope and runs a caller-supplied validator.
 *  - Corrupted JSON or invalid records are discarded instead of crashing.
 *  - Writes are guarded against quota errors and privacy modes.
 */

const PREFIX = "yostore";
export const STORAGE_VERSION = 1;

/** Build a namespaced storage key, e.g. key('cart', 'guest'). */
export function key(...parts) {
    return [PREFIX, ...parts].join(":");
}

function storage() {
    try {
        const s = window.localStorage;
        const probe = `${PREFIX}:__probe`;
        s.setItem(probe, "1");
        s.removeItem(probe);
        return s;
    } catch {
        return null;
    }
}

/**
 * Read and validate a value.
 * @returns {*} the validated data, or `fallback` when missing/invalid.
 */
export function read(storageKey, validate, fallback = null) {
    const s = storage();
    if (!s) return fallback;
    let raw;
    try {
        raw = s.getItem(storageKey);
    } catch {
        return fallback;
    }
    if (raw == null) return fallback;

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        discard(storageKey); // malformed JSON
        return fallback;
    }

    if (!parsed || typeof parsed !== "object" || parsed.v !== STORAGE_VERSION) {
        discard(storageKey); // wrong or missing version envelope
        return fallback;
    }

    if (typeof validate === "function") {
        const result = validate(parsed.data);
        if (result === false) {
            discard(storageKey);
            return fallback;
        }
        // Validators return either `true` (valid as-is) or a sanitized value.
        return result === true || result == null ? parsed.data : result;
    }
    return parsed.data;
}

/** Write a value inside a versioned envelope. Returns success flag. */
export function write(storageKey, data) {
    const s = storage();
    if (!s) return false;
    try {
        s.setItem(storageKey, JSON.stringify({ v: STORAGE_VERSION, data }));
        return true;
    } catch {
        return false; // quota exceeded / private mode
    }
}

export function discard(storageKey) {
    const s = storage();
    if (!s) return;
    try {
        s.removeItem(storageKey);
    } catch {
        /* ignore */
    }
}

export const storageKeys = {
    guestCart: key("cart", "guest"),
    accountCart: (accountId) => key("cart", "account", accountId),
    guestWishlist: key("wishlist", "guest"),
    accountWishlist: (accountId) => key("wishlist", "account", accountId),
    orders: (accountId) => key("orders", "account", accountId),
    accounts: key("accounts"),
    session: key("session"),
    theme: key("theme"),
    recent: key("recent"),
    announcementDismissed: key("ui", "announcement-dismissed"),
    adminProducts: key("admin", "products"),
    checkoutDraft: (scope) => key("checkout", scope),
};
