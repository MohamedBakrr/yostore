import {
    CircleCheck,
    CircleX,
    Clock,
    PackageCheck,
    Timer,
    Truck,
} from "lucide-react";
import {
    ORDER_STATUSES,
    getOrderStatus,
} from "../../repositories/ordersRepository";
import { formatDate, formatDateTime } from "../../utils/formatting";

const STATUS_ICONS = {
    pending: Clock,
    processing: Timer,
    shipped: Truck,
    delivered: PackageCheck,
    cancelled: CircleX,
};

/**
 * Build the visible timeline for an order.
 *
 * Completed nodes come from stored `order.timeline` events (every one carries
 * `simulated: true`); remaining statuses of `ORDER_STATUSES` render as
 * estimated/upcoming so no event or timestamp is ever invented. A cancelled
 * order stops the flow at its cancel event.
 */
function buildNodes(order) {
    const flow = ORDER_STATUSES.filter((status) => status.step >= 0);
    const events = Array.isArray(order.timeline) ? order.timeline : [];
    const cancelled = order.status === "cancelled";
    const current = getOrderStatus(order.status);

    const findEvent = (status) =>
        events.find(
            (event) =>
                event.key === status.id ||
                (status.id === "pending" &&
                    (event.key === "placed" || event.key === "pending")),
        );

    const nodes = [];

    if (!cancelled) {
        for (const status of flow) {
            const event = findEvent(status);
            if (event) {
                nodes.push({
                    id: status.id,
                    label: status.label,
                    state: status.step === current.step ? "current" : "done",
                    at: event.at ?? null,
                });
            } else if (status.step < current.step) {
                nodes.push({
                    id: status.id,
                    label: status.label,
                    state: "done",
                    at: null,
                });
            } else if (status.step === current.step) {
                nodes.push({
                    id: status.id,
                    label: status.label,
                    state: "current",
                    at: null,
                });
            } else {
                nodes.push({
                    id: status.id,
                    label: status.label,
                    state: "upcoming",
                    at: null,
                });
            }
        }
    } else {
        for (const status of flow) {
            const event = findEvent(status);
            if (event) {
                nodes.push({
                    id: status.id,
                    label: status.label,
                    state: "done",
                    at: event.at ?? null,
                });
            }
        }
        const cancelEvent = events.find((event) => event.key === "cancelled");
        nodes.push({
            id: "cancelled",
            label: "Cancelled",
            state: "cancelled",
            at: cancelEvent?.at ?? null,
        });
    }

    return nodes;
}

const CIRCLE_CLASSES = {
    done: "border-success bg-success-tint text-success",
    current: "border-accent bg-accent-tint text-accent",
    upcoming: "border-dashed border-hair-strong bg-surface text-muted",
    cancelled: "border-danger bg-danger-tint text-danger",
};

function nodeMeta(node) {
    if (node.at) return formatDateTime(node.at);
    if (node.state === "upcoming")
        return "Estimated — this step hasn’t happened yet.";
    if (node.state === "current")
        return "In progress — no simulated timestamp recorded yet.";
    if (node.state === "cancelled")
        return "No simulated timestamp recorded.";
    return "Simulated status — no timestamp recorded.";
}

/**
 * Vertical order timeline shared by order details and tracking.
 * The whole timeline is labeled simulated demo data; completed events are
 * marked as such and remaining steps are shown as estimates (dashed).
 */
export default function OrderTimeline({ order, className = "" }) {
    const nodes = buildNodes(order);

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center gap-3">
                <span className="chip border-accent bg-accent-tint text-accent">
                    Simulated demo timeline
                </span>
                <p className="text-xs leading-relaxed text-muted">
                    Stored timestamps are local demo data — not carrier scan
                    events.
                </p>
            </div>

            <ol className="mt-6">
                {nodes.map((node, index) => {
                    const Icon = STATUS_ICONS[node.id] ?? CircleCheck;
                    const last = index === nodes.length - 1;
                    const done =
                        node.state === "done" || node.state === "cancelled";

                    return (
                        <li key={node.id} className="flex gap-4 pb-6 last:pb-0">
                            <span className="flex flex-col items-center gap-1">
                                <span
                                    className={`grid size-8 shrink-0 place-items-center border ${CIRCLE_CLASSES[node.state]}`}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                </span>
                                {!last ? (
                                    done ? (
                                        <span
                                            className="w-px flex-1 bg-hair-strong"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <span
                                            className="w-0 flex-1 border-l border-dashed border-hair-strong"
                                            aria-hidden="true"
                                        />
                                    )
                                ) : null}
                            </span>

                            <div className="min-w-0 flex-1 pb-1">
                                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                                    {node.label}
                                    {node.state === "current" ? (
                                        <span className="chip border-accent bg-accent-tint text-accent">
                                            Current
                                        </span>
                                    ) : null}
                                    {node.state === "upcoming" ? (
                                        <span className="chip">Estimated</span>
                                    ) : null}
                                    {node.state === "done" || node.state === "cancelled" ? (
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                                            Simulated
                                        </span>
                                    ) : null}
                                </p>
                                <p className="mt-0.5 text-xs text-muted">
                                    {nodeMeta(node)}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <p className="mt-5 border-t border-hair pt-4 text-xs leading-relaxed text-muted">
                Estimated delivery:{" "}
                <strong className="font-semibold text-ink-soft">
                    {formatDate(order.estimatedDelivery)}
                </strong>{" "}
                — an estimate from the demo shipping config, not a confirmed
                carrier date. Statuses here are updated from the admin demo.
            </p>
        </div>
    );
}
