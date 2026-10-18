import { ORDER_STATUSES } from "../../repositories/ordersRepository";

const KNOWN_STATUS_IDS = new Set(ORDER_STATUSES.map((status) => status.id));

/**
 * Per-row status control for the demo orders table. Choosing a value calls
 * back with the full order — updates append *simulated* timeline events to
 * this browser's order repository, never to a real fulfillment system.
 */
export default function OrderStatusSelect({
    order,
    onChange,
    disabled = false,
    className = "",
}) {
    const value = KNOWN_STATUS_IDS.has(order?.status)
        ? order.status
        : "pending";

    return (
        <select
            className={`field w-auto ${className}`}
            value={value}
            disabled={disabled}
            aria-label={`Status for order ${order?.orderId ?? ""}`.trim()}
            title="Updates append a simulated demo event"
            onChange={(event) => onChange(order, event.target.value)}
        >
            {ORDER_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                    {status.label}
                </option>
            ))}
        </select>
    );
}
