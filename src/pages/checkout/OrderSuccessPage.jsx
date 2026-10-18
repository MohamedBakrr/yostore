import { useMemo } from "react";
import { Link, useParams } from "react-router";
import {
    ArrowRight,
    CalendarDays,
    CreditCard,
    PackageSearch,
    Truck,
} from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "../../store/authSlice";
import { ordersRepository } from "../../repositories/ordersRepository";
import { formatDate } from "../../utils/formatting";
import TotalsBreakdown from "../../components/cart/TotalsBreakdown";
import DemoNotice from "../../components/checkout/DemoNotice";
import EmptyState from "../../components/feedback/EmptyState";

/**
 * Post-checkout confirmation for `/checkout/success/:orderId`.
 * Loads via `findByOrderId` so it works for guests and signed-in accounts
 * alike; unknown IDs get a recovery state instead of a blank page.
 */
export default function OrderSuccessPage() {
    const { orderId } = useParams();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const order = useMemo(
        () => ordersRepository.findByOrderId(orderId ?? ""),
        [orderId],
    );

    useDocumentTitle(
        order ? `Order ${order.orderId} confirmed` : "Order confirmation",
        {
            description:
                "Your YoStore demo order was saved locally — review the totals, delivery estimate, payment status, and next steps.",
        },
    );

    if (!order) {
        return (
            <div className="page-frame py-14">
                <p className="eyebrow">Order confirmation</p>
                <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                    We couldn’t find that order
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                    No demo order with ID{" "}
                    <code className="font-semibold text-ink">{orderId}</code>{" "}
                    exists in this browser. Order IDs look like{" "}
                    <span className="font-semibold text-ink">YS-AB12CD99</span>.
                </p>
                <div className="mt-8 max-w-xl">
                    <EmptyState
                        icon={PackageSearch}
                        title="Nothing to confirm"
                        description="If you just placed an order, its ID was shown on the confirmation step. Demo orders only live in the browser they were created in."
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link to="/shop" className="btn btn-primary btn-sm">
                                    Continue shopping
                                </Link>
                                <Link
                                    to="/tracking"
                                    className="btn btn-secondary btn-sm"
                                >
                                    Look up an order
                                </Link>
                                {isAuthenticated ? (
                                    <Link
                                        to="/orders"
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Order history
                                    </Link>
                                ) : null}
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }

    const isOnline = order.paymentMethodId === "online";

    return (
        <div className="page-frame py-10 md:py-14">
            <header className="max-w-3xl">
                <p className="eyebrow">Order confirmed</p>
                <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                    Thank you — your order is in.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                    Placed {formatDate(order.createdAt)} ·{" "}
                    {order.shippingMethodName} ·{" "}
                    {order.items.reduce(
                        (n, item) => n + (Number(item.quantity) || 0),
                        0,
                    )}{" "}
                    items
                </p>
            </header>

            <div className="mt-6 max-w-3xl">
                <DemoNotice label="Demo order.">
                    This order is stored only in this browser — no payment was
                    processed, no email was sent, and no package will ship.
                </DemoNotice>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
                {/* Order number */}
                <div className="card-flat px-5 py-5 md:col-span-1">
                    <p className="eyebrow">Order number</p>
                    <p className="mt-2 font-display text-2xl tabular-nums text-ink">
                        {order.orderId}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                        Keep it handy — you can re-open this order from{" "}
                        {isAuthenticated ? "your history" : "the tracking lookup"}{" "}
                        any time.
                    </p>
                </div>

                {/* Estimated delivery */}
                <div className="card-flat px-5 py-5">
                    <p className="eyebrow flex items-center gap-1.5">
                        <Truck className="size-3.5" aria-hidden="true" />
                        Estimated delivery
                    </p>
                    <p className="mt-2 font-display text-xl text-ink">
                        {formatDate(order.estimatedDelivery)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                        {order.shippingEta} via {order.shippingMethodName} — an
                        estimate from the demo shipping config, not a carrier
                        confirmation.
                    </p>
                </div>

                {/* Payment status */}
                <div className="card-flat px-5 py-5">
                    <p className="eyebrow flex items-center gap-1.5">
                        <CreditCard className="size-3.5" aria-hidden="true" />
                        Payment
                    </p>
                    <p className="mt-2">
                        <span
                            className={`chip ${
                                isOnline
                                    ? "border-success bg-success-tint text-success"
                                    : "border-warning bg-warning-tint text-warning"
                            }`}
                        >
                            {isOnline ? "Paid — simulated" : "Payment due"}
                        </span>
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                        {isOnline
                            ? "Approved by the local payment simulation — no real charge was ever made."
                            : "Cash on delivery (demo) — nothing is collected in this simulation."}
                    </p>
                </div>
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
                {/* Items snapshot */}
                <section aria-labelledby="success-items-title">
                    <h2
                        id="success-items-title"
                        className="font-display text-2xl"
                    >
                        What you ordered
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
                                    <span className="line-clamp-1 text-sm font-medium text-ink">
                                        {item.title}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted tabular-nums">
                                        Qty {item.quantity}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Next steps */}
                    <section aria-labelledby="success-next-title" className="mt-8">
                        <h2
                            id="success-next-title"
                            className="font-display text-2xl"
                        >
                            Next steps
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {isAuthenticated ? (
                                <Link
                                    to={`/orders/${order.orderId}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    View order details
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            ) : (
                                <Link
                                    to={`/tracking?orderId=${encodeURIComponent(order.orderId)}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    Track this order
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            )}
                            <Link to="/shop" className="btn btn-secondary btn-sm">
                                Continue shopping
                            </Link>
                        </div>
                        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
                            <CalendarDays
                                className="mt-px size-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            {isAuthenticated
                                ? "Your order history also lists every demo order placed with this account."
                                : "Guest demo orders aren’t tied to an account — the tracking lookup finds them by ID in this browser."}
                        </p>
                    </section>
                </section>

                {/* Totals */}
                <section aria-labelledby="success-totals-title">
                    <h2
                        id="success-totals-title"
                        className="font-display text-2xl"
                    >
                        Summary
                    </h2>
                    <div className="card-flat mt-4 px-5 py-5">
                        <TotalsBreakdown totals={order.totals} />
                        <dl className="mt-5 space-y-2 border-t border-hair pt-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">Promo code</dt>
                                <dd className="font-medium text-ink">
                                    {order.totals.coupon ?? "None"}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">Shipping</dt>
                                <dd className="text-right font-medium text-ink">
                                    {order.shippingMethodName} ·{" "}
                                    {order.shippingEta}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">Deliver to</dt>
                                <dd className="text-right font-medium text-ink">
                                    {order.contact.fullName}
                                    <span className="block text-xs font-normal text-muted">
                                        {order.contact.city},{" "}
                                        {order.contact.country}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>
            </div>
        </div>
    );
}
