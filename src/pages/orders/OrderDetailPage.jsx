import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CreditCard, MapPin, Truck } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";
import { ordersRepository } from "../../repositories/ordersRepository";
import {
    formatCurrency,
    formatDate,
    formatDateTime,
} from "../../utils/formatting";
import {
    computeMerchandiseTotal,
    getShippingMethod,
    unitPriceFor,
} from "../../utils/pricing";
import OrderStatusChip from "../../components/orders/OrderStatusChip";
import OrderTimeline from "../../components/orders/OrderTimeline";
import TotalsBreakdown from "../../components/cart/TotalsBreakdown";
import DemoNotice from "../../components/checkout/DemoNotice";
import EmptyState from "../../components/feedback/EmptyState";

/**
 * `/orders/:orderId` (protected) — full local snapshot for one of the signed
 * account's orders: items, totals, address, payment, and the simulated
 * timeline. Lookup is account-scoped (`getByOrder(user.id, id)`), so another
 * account's order renders as a friendly not-found.
 */
export default function OrderDetailPage() {
    const params = useParams();
    const user = useAppSelector(selectUser);
    const orderId = String(params.orderId ?? "")
        .trim()
        .toUpperCase();

    const order = useMemo(
        () => (user ? ordersRepository.getByOrder(user.id, orderId) : null),
        [user, orderId],
    );

    useDocumentTitle(
        order ? `Order ${order.orderId}` : "Order details",
        {
            description:
                "Items, totals, address snapshot, payment status, and the simulated delivery timeline for a YoStore demo order.",
        },
    );

    if (!order) {
        return (
            <div className="page-frame py-14">
                <p className="eyebrow">Order details</p>
                <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                    We couldn’t find that order
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                    Nothing stored for this account matches{" "}
                    <code className="font-semibold text-ink">{orderId}</code>.
                    It may have been placed with a different demo account, or
                    the ID could be mistyped.
                </p>
                <div className="mt-8 max-w-xl">
                    <EmptyState
                        icon={MapPin}
                        title="No matching order"
                        description="Order history only lists orders saved under your mock account. The public lookup can find any demo order in this browser if you have the ID."
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link to="/orders" className="btn btn-primary btn-sm">
                                    Back to order history
                                </Link>
                                <Link
                                    to={`/tracking?orderId=${encodeURIComponent(orderId)}`}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Try the tracking lookup
                                </Link>
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }

    const method = getShippingMethod(order.shippingMethodId);
    const isOnline = order.paymentMethodId === "online";

    return (
        <div className="page-frame py-10 md:py-14">
            <header className="border-b border-hair pb-6">
                <Link
                    to="/orders"
                    className="link-underline inline-flex items-center gap-1.5 text-xs font-semibold text-accent"
                >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Order history
                </Link>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                    <div>
                        <p className="eyebrow">Order</p>
                        <h1 className="mt-2 font-display text-4xl tabular-nums text-balance-tight">
                            {order.orderId}
                        </h1>
                        <p className="mt-2 text-sm text-muted">
                            Placed {formatDateTime(order.createdAt)} ·{" "}
                            {order.shippingMethodName} ·{" "}
                            {formatCurrency(order.totals.total)}
                        </p>
                    </div>
                    <OrderStatusChip status={order.status} />
                </div>
            </header>

            <div className="mt-6 max-w-3xl">
                <DemoNotice label="Demo order.">
                    The full record below is a local snapshot taken when the
                    order was placed — statuses are updated from the admin
                    demo, not from any carrier.
                </DemoNotice>
            </div>

            <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="space-y-10">
                    {/* Items snapshot */}
                    <section aria-labelledby="detail-items-title">
                        <h2
                            id="detail-items-title"
                            className="font-display text-2xl"
                        >
                            Items
                        </h2>
                        <ul className="mt-4 border-t border-hair">
                            {order.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-4 border-b border-hair py-3.5"
                                >
                                    <span className="size-14 shrink-0 overflow-hidden bg-sunken">
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt=""
                                                className="size-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="grid size-full place-items-center font-display text-sm text-muted">
                                                Yo
                                            </span>
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <Link
                                            to={`/product/${item.id}`}
                                            className="line-clamp-1 text-sm font-medium text-ink transition-colors hover:text-accent"
                                        >
                                            {item.title}
                                        </Link>
                                        <span className="mt-0.5 block text-xs text-muted tabular-nums">
                                            Qty {item.quantity} ×{" "}
                                            {formatCurrency(
                                                unitPriceFor(
                                                    item.price,
                                                    item.discountPercentage,
                                                ),
                                            )}
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold tabular-nums text-ink">
                                        {formatCurrency(
                                            computeMerchandiseTotal([item]),
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Address + method + payment snapshots */}
                    <section aria-labelledby="detail-ship-title">
                        <h2
                            id="detail-ship-title"
                            className="font-display text-2xl"
                        >
                            Shipping &amp; contact
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="card-flat px-4 py-4">
                                <p className="eyebrow flex items-center gap-1.5">
                                    <MapPin className="size-3.5" aria-hidden="true" />
                                    Deliver to
                                </p>
                                <address className="mt-2 text-sm not-italic leading-relaxed text-ink-soft">
                                    <span className="block font-semibold text-ink">
                                        {order.contact.fullName}
                                    </span>
                                    <span className="block">
                                        {order.contact.address}
                                    </span>
                                    <span className="block">
                                        {[
                                            order.contact.city,
                                            order.contact.postalCode,
                                            order.contact.country,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </span>
                                    <span className="block text-muted">
                                        {order.contact.phone} ·{" "}
                                        {order.contact.email}
                                    </span>
                                </address>
                            </div>

                            <div className="card-flat px-4 py-4">
                                <p className="eyebrow flex items-center gap-1.5">
                                    <Truck className="size-3.5" aria-hidden="true" />
                                    Method
                                </p>
                                <p className="mt-2 text-sm">
                                    <span className="font-semibold text-ink">
                                        {method.name}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted">
                                        {order.shippingEta} ·{" "}
                                        {Number(order.totals.shipping) === 0
                                            ? "free"
                                            : formatCurrency(
                                                  order.totals.shipping,
                                              )}
                                    </span>
                                    <span className="mt-1 block text-xs text-muted">
                                        {method.description}
                                    </span>
                                </p>
                                <p className="mt-3 border-t border-hair pt-3 text-xs text-muted">
                                    Estimated delivery:{" "}
                                    <strong className="font-semibold text-ink-soft">
                                        {formatDate(order.estimatedDelivery)}
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <div className="card-flat mt-4 px-4 py-4">
                            <p className="eyebrow flex items-center gap-1.5">
                                <CreditCard className="size-3.5" aria-hidden="true" />
                                Payment
                            </p>
                            <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                                <span
                                    className={`chip ${
                                        isOnline
                                            ? "border-success bg-success-tint text-success"
                                            : "border-warning bg-warning-tint text-warning"
                                    }`}
                                >
                                    {isOnline
                                        ? "Paid — simulated"
                                        : "Payment due"}
                                </span>
                                <span className="text-muted">
                                    {isOnline
                                        ? "Simulated online payment — no real charge was made."
                                        : "Cash on delivery (demo) — pay when it arrives."}
                                </span>
                            </p>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section aria-labelledby="detail-timeline-title">
                        <h2
                            id="detail-timeline-title"
                            className="font-display text-2xl"
                        >
                            Timeline
                        </h2>
                        <div className="mt-4">
                            <OrderTimeline order={order} />
                        </div>
                    </section>
                </div>

                {/* Totals rail */}
                <aside aria-labelledby="detail-totals-title" className="card-flat lg:sticky lg:top-24">
                    <div className="border-b border-hair px-5 py-4">
                        <h2
                            id="detail-totals-title"
                            className="font-display text-lg"
                        >
                            Totals
                        </h2>
                        <p className="mt-1 text-xs text-muted">
                            Snapshot from {formatDateTime(order.createdAt)}.
                        </p>
                    </div>
                    <div className="px-5 py-4">
                        <TotalsBreakdown totals={order.totals} />
                        <dl className="mt-5 space-y-2 border-t border-hair pt-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">Promo code</dt>
                                <dd className="font-medium text-ink">
                                    {order.totals.coupon ?? "None"}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">Status</dt>
                                <dd>
                                    <OrderStatusChip
                                        status={order.status}
                                        className="scale-90 origin-right"
                                    />
                                </dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
        </div>
    );
}
