/**
 * Human-readable label for a DummyJSON category slug.
 * The category list supplies proper names where available; this is the
 * fallback used before (or without) that list — e.g. "mens-shirts" → "Mens shirts".
 */
export function categoryLabel(slug) {
    const text = String(slug ?? "")
        .trim()
        .replaceAll("-", " ");
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default categoryLabel;
