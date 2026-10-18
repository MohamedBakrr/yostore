/** Currency and date formatting — single source of truth for display rules. */

// DummyJSON prices are USD; YoStore displays a single currency and never mixes.
const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function formatCurrency(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return usd.format(0);
    return usd.format(Math.max(0, n));
}

export function formatPrice(amount) {
    return formatCurrency(amount);
}

export function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

/** Add whole days to an ISO timestamp; returns ISO string. */
export function addDays(iso, days) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString();
}
