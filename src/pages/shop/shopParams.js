import { formatCurrency } from "../../utils/formatting";

/**
 * Pure parsing/sanitizing of the shop's shareable URL state (SPEC §6, §10).
 * Every value read from the URL passes through here first — malformed input
 * (page=abc, min>max, unknown sort, absurd queries) recovers to a safe default
 * instead of throwing or producing a broken request.
 */

export const DEFAULT_SORT = "featured";
export const MAX_QUERY_LENGTH = 100;

/** Sort choices mapped to the DummyJSON `sortBy`/`order` parameters. */
export const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "title-asc", label: "Title A–Z", sortBy: "title", order: "asc" },
    { value: "title-desc", label: "Title Z–A", sortBy: "title", order: "desc" },
    {
        value: "price-asc",
        label: "Price: low to high",
        sortBy: "price",
        order: "asc",
    },
    {
        value: "price-desc",
        label: "Price: high to low",
        sortBy: "price",
        order: "desc",
    },
    {
        value: "rating-desc",
        label: "Rating: high to low",
        sortBy: "rating",
        order: "desc",
    },
];

/** Unknown or tampered sort values fall back to the default ordering. */
export function parseSort(raw) {
    return SORT_OPTIONS.some((option) => option.value === raw)
        ? raw
        : DEFAULT_SORT;
}

/** `{ sortBy, order }` for the API; defaults omit the params entirely. */
export function sortToApi(value) {
    const option =
        SORT_OPTIONS.find((entry) => entry.value === value) ??
        SORT_OPTIONS[0];
    return { sortBy: option.sortBy, order: option.order };
}

/** Query text: preserved verbatim (so typing spaces works), length-capped. */
export function parseQuery(raw) {
    return String(raw ?? "").slice(0, MAX_QUERY_LENGTH);
}

/** `page=abc`, `page=0`, `page=-3` → 1. */
export function parsePage(raw) {
    const parsed = Number.parseInt(String(raw ?? ""), 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

/** One price bound: empty/invalid/negative → null (filter inactive). */
function parseBound(raw) {
    if (raw === null || raw === undefined || raw === "") return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return null;
    return value;
}

/**
 * Price bounds with an inverted range (`min > max`) swapped rather than
 * rejected — a shared link should still render sensible results.
 */
export function normalizePriceRange(minRaw, maxRaw) {
    let min = parseBound(minRaw);
    let max = parseBound(maxRaw);
    if (min !== null && max !== null && min > max) {
        [min, max] = [max, min];
    }
    return { min, max };
}

/** Human label for the active price range (null when inactive). */
export function priceRangeLabel(range) {
    const { min, max } = range ?? {};
    if (min === null && max === null) return null;
    if (min !== null && max !== null) {
        return `Price: ${formatCurrency(min)} – ${formatCurrency(max)}`;
    }
    if (min !== null) return `Price: ${formatCurrency(min)}+`;
    return `Price: up to ${formatCurrency(max)}`;
}
