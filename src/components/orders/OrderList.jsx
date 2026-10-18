import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDateTime } from "../../utils/formatting";
import OrderStatusChip from "./OrderStatusChip";

/**
 * Account order list. Rows are full-card links (44px+ targets) showing id,
 * created date, status chip with icon + text, and total.
 */
export default function OrderList({ orders }) {
    return (
        <ul className="card-flat">
            {orders.map((order) => {
                const count = order.items.reduce(
                    (n, item) => n + (Number(item.quantity) || 0),
                    0,
                );
                return (
                    <li
                        key={order.orderId}
                        className="border-b border-hair last:border-b-0"
                    >
                        <Link
                            to={`/orders/${order.orderId}`}
                            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5 transition-colors hover:bg-sunken"
                        >
                            <span className="min-w-0 flex-1">
                                <span className="font-display text-lg tabular-nums text-ink">
                                    {order.orderId}
                                </span>
                                <span className="mt-1 block text-xs text-muted">
                                    Placed {formatDateTime(order.createdAt)} ·{" "}
                                    {count} {count === 1 ? "item" : "items"} ·{" "}
                                    {order.shippingMethodName}
                                </span>
                            </span>
                            <OrderStatusChip status={order.status} />
                            <span className="flex items-center gap-3">
                                <span className="text-right">
                                    <span className="block font-semibold tabular-nums text-ink">
                                        {formatCurrency(order.totals.total)}
                                    </span>
                                    <span className="block text-xs font-semibold text-accent">
                                        View details
                                    </span>
                                </span>
                                <ArrowRight
                                    className="size-4 shrink-0 text-accent"
                                    aria-hidden="true"
                                />
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
