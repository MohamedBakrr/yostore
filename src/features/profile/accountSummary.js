/**
 * Pure helpers for the account summary panel (SPEC §14). Kept separate from
 * the page so the display rules for sparse demo records stay in one place.
 */

/** Address line for the saved address book, or a helpful empty string. */
export function formatSavedAddress(user) {
    if (!user?.address) return "";
    return [user.address, user.city, user.postalCode, user.country]
        .filter(Boolean)
        .join(", ");
}

/** "3 items" / "1 item" / "No saved items yet" — for the summary panel. */
export function formatSavedCount(count) {
    if (!count) return "No saved items yet";
    return `${count} ${count === 1 ? "item" : "items"}`;
}
