/**
 * Mock account repository — demonstration only.
 *
 * Passwords are NEVER stored in plaintext: each account gets a random salt and
 * a salted SHA-256 digest (Web Crypto). This is a convenience check, not
 * security: browser storage is fully user-editable and provides no identity
 * guarantees. This limitation is stated in the UI and the README.
 */

import { read, write, storageKeys } from "../utils/storage";

function isValidAccount(a) {
    return (
        a &&
        typeof a === "object" &&
        typeof a.id === "string" &&
        typeof a.email === "string" &&
        typeof a.name === "string" &&
        typeof a.salt === "string" &&
        typeof a.passwordHash === "string"
    );
}

function loadAccounts() {
    const accounts = read(storageKeys.accounts, (data) =>
        Array.isArray(data) && data.every(isValidAccount) ? data : false,
    );
    return Array.isArray(accounts) ? accounts : [];
}

function saveAccounts(accounts) {
    write(storageKeys.accounts, accounts);
}

function toHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/** Salted SHA-256 digest of the password (async, Web Crypto). */
export async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(`${salt}::${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
}

function randomSalt() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
}

function randomId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Public shape — never leaks the hash to app state. */
function publicAccount(account) {
    return {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: account.phone ?? "",
        address: account.address ?? "",
        city: account.city ?? "",
        postalCode: account.postalCode ?? "",
        country: account.country ?? "",
        createdAt: account.createdAt,
    };
}

export const accountRepository = {
    listAccounts: loadAccounts,

    findByEmail(email) {
        const normalized = String(email ?? "")
            .trim()
            .toLowerCase();
        return loadAccounts().find((a) => a.email === normalized) ?? null;
    },

    findById(id) {
        return loadAccounts().find((a) => a.id === id) ?? null;
    },

    /** Returns { ok, account? , error? } — duplicate detection included. */
    async createAccount({ name, email, password }) {
        const normalized = String(email ?? "")
            .trim()
            .toLowerCase();
        if (this.findByEmail(normalized)) {
            return { ok: false, error: "duplicate" };
        }
        const salt = randomSalt();
        const passwordHash = await hashPassword(password, salt);
        const account = {
            id: randomId(),
            name: String(name ?? "").trim(),
            email: normalized,
            salt,
            passwordHash,
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            country: "",
            createdAt: new Date().toISOString(),
        };
        const accounts = loadAccounts();
        accounts.push(account);
        saveAccounts(accounts);
        return { ok: true, account: publicAccount(account) };
    },

    async verifyCredentials(email, password) {
        const account = this.findByEmail(email);
        if (!account) return { ok: false, error: "invalid" };
        const hash = await hashPassword(password, account.salt);
        if (hash !== account.passwordHash)
            return { ok: false, error: "invalid" };
        return { ok: true, account: publicAccount(account) };
    },

    updateProfile(accountId, patch) {
        const accounts = loadAccounts();
        const idx = accounts.findIndex((a) => a.id === accountId);
        if (idx < 0) return null;
        const safePatch = {};
        for (const field of [
            "name",
            "phone",
            "address",
            "city",
            "postalCode",
            "country",
        ]) {
            if (typeof patch[field] === "string")
                safePatch[field] = patch[field];
        }
        accounts[idx] = { ...accounts[idx], ...safePatch };
        saveAccounts(accounts);
        return publicAccount(accounts[idx]);
    },
};
