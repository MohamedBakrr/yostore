import { CircleCheck, CircleX, Clock, Timer, Truck } from "lucide-react";
import { getOrderStatus } from "../../repositories/ordersRepository";

const STATUS_STYLES = {
    pending: {
        className: "border-warning bg-warning-tint text-warning",
        icon: Clock,
    },
    processing: {
        className: "border-accent bg-accent-tint text-accent",
        icon: Timer,
    },
    shipped: {
        className: "border-ink bg-ink text-paper",
        icon: Truck,
    },
    delivered: {
        className: "border-success bg-success-tint text-success",
        icon: CircleCheck,
    },
    cancelled: {
        className: "border-danger bg-danger-tint text-danger",
        icon: CircleX,
    },
};

/**
 * Order status chip — token colors paired with an icon and a text label, so
 * status is never communicated by color alone.
 */
export default function OrderStatusChip({ status, className = "" }) {
    const meta = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
    const info = getOrderStatus(status);
    const Icon = meta.icon;

    return (
        <span className={`chip ${meta.className} ${className}`}>
            <Icon className="size-3.5" aria-hidden="true" />
            {info.label}
        </span>
    );
}
