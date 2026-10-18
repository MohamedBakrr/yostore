import { ORDER_STATUSES } from "../../repositories/ordersRepository";
import { formatCurrency } from "../../utils/formatting";
import { SkeletonBlock } from "../feedback/Skeletons";

/** One metric cell. Local to this module — nothing else renders metrics. */
function MetricCard({ label, children }) {
    return (
        <li className="card-flat flex flex-col gap-3 p-5">
            <p className="eyebrow">{label}</p>
            {children}
        </li>
    );
}

function BigValue({ children }) {
    return (
        <p className="font-display text-3xl leading-none text-balance-tight">
            {children}
        </p>
    );
}

/**
 * Summary cards for the demo dashboard. Every figure is derived from either
 * the public DummyJSON catalog or from demo data stored in this browser —
 * never from sales, payments, or a backend.
 *
 * @param {{ total?: number, isLoading: boolean, error: unknown, onRetry: () => void }} catalog
 * @param {{ created: number, edited: number, deleted: number }} stats
 * @param {{ count: number, guest: number, revenue: number, byStatus: Record<string, number> }} summary
 */
export default function AdminMetrics({ catalog, stats, summary }) {
    const localChanges = stats.created + stats.edited + stats.deleted;
    const activeStatuses = ORDER_STATUSES.filter(
        (status) => summary.byStatus[status.id],
    );

    return (
        <section aria-labelledby="admin-metrics-heading" className="mt-10">
            <h2 id="admin-metrics-heading" className="font-display text-2xl">
                Overview
            </h2>
            <p className="mt-1 text-sm text-muted">
                Demo-derived figures — see the notice above for what is and
                isn&apos;t real.
            </p>

            <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Catalog size">
                    {catalog.isLoading ? (
                        <SkeletonBlock className="h-9 w-24" />
                    ) : catalog.error ? (
                        <div role="alert">
                            <p className="text-sm font-semibold text-danger">
                                Couldn&apos;t load the catalog size.
                            </p>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm mt-1"
                                onClick={catalog.onRetry}
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <BigValue>
                            {Number(catalog.total ?? 0).toLocaleString("en-US")}
                        </BigValue>
                    )}
                    <p className="mt-auto text-xs leading-relaxed text-muted">
                        Products on DummyJSON — read-only source data.
                    </p>
                </MetricCard>

                <MetricCard label="Local demo products">
                    <BigValue>{localChanges}</BigValue>
                    <p className="text-xs leading-relaxed text-muted">
                        {localChanges === 0
                            ? "No local product changes yet."
                            : "Local changes stored in this browser only."}
                    </p>
                    <ul className="space-y-1 text-xs text-muted">
                        <li>
                            <span className="font-semibold text-ink-soft">
                                {stats.created}
                            </span>{" "}
                            created
                        </li>
                        <li>
                            <span className="font-semibold text-ink-soft">
                                {stats.edited}
                            </span>{" "}
                            edited on the overlay
                        </li>
                        <li>
                            <span className="font-semibold text-ink-soft">
                                {stats.deleted}
                            </span>{" "}
                            hidden from the listing
                        </li>
                    </ul>
                    <p className="mt-auto text-xs leading-relaxed text-muted">
                        Never written to DummyJSON.
                    </p>
                </MetricCard>

                <MetricCard label="Demo orders">
                    <BigValue>{summary.count}</BigValue>
                    {summary.count === 0 ? (
                        <p className="text-xs leading-relaxed text-muted">
                            No demo orders yet — complete a checkout to create
                            one.
                        </p>
                    ) : (
                        <>
                            <ul className="space-y-1 text-xs text-muted">
                                {activeStatuses.map((status) => (
                                    <li key={status.id}>
                                        {status.label}:{" "}
                                        <span className="font-semibold text-ink-soft">
                                            {summary.byStatus[status.id]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-muted">
                                guest:{" "}
                                <span className="font-semibold text-ink-soft">
                                    {summary.guest}
                                </span>{" "}
                                order{summary.guest === 1 ? "" : "s"} without an
                                account
                            </p>
                        </>
                    )}
                    <p className="mt-auto text-xs leading-relaxed text-muted">
                        Stored across every account in this browser.
                    </p>
                </MetricCard>

                <MetricCard label="Gross demo revenue">
                    <BigValue>{formatCurrency(summary.revenue)}</BigValue>
                    <p className="mt-auto text-xs leading-relaxed text-muted">
                        Sum of demo order totals in this browser —{" "}
                        <strong className="font-semibold text-ink-soft">
                            demo totals
                        </strong>
                        , not real sales.
                    </p>
                </MetricCard>
            </ul>
        </section>
    );
}
