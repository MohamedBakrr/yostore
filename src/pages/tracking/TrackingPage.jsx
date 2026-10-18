import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, CircleHelp, SearchX, Truck } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "../../store/authSlice";
import { ordersRepository } from "../../repositories/ordersRepository";
import { useToast } from "../../providers/ToastProvider";
import { formatDate, formatDateTime } from "../../utils/formatting";
import OrderStatusChip from "../../components/orders/OrderStatusChip";
import OrderTimeline from "../../components/orders/OrderTimeline";
import TotalsBreakdown from "../../components/cart/TotalsBreakdown";
import DemoNotice from "../../components/checkout/DemoNotice";
import EmptyState from "../../components/feedback/EmptyState";
import InlineValidationError from "../../components/feedback/InlineValidationError";

/** YoStore demo order IDs are generated as `YS-` + 6–12 alphanumerics. */
const ORDER_ID_PATTERN = /^YS-[A-Z0-9]{6,12}$/;

const normalizeOrderId = (value) => String(value ?? "").trim().toUpperCase();

/**
 * `/tracking` (public) — local order-ID lookup. Reads demo orders stored in
 * this browser via `findByOrderId` and renders their simulated timeline.
 * Never claims live carrier data.
 */
export default function TrackingPage() {
    useDocumentTitle("Track your order", {
        description:
            "Look up a locally stored YoStore demo order by its ID and follow its simulated timeline — no live carrier data involved.",
    });

    const { notify } = useToast();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [params] = useSearchParams();

    // Arriving with ?orderId=… prefills the field and pre-runs the lookup.
    // The lookups live in state initializers so no effect ever sets state.
    const [input, setInput] = useState(() =>
        normalizeOrderId(params.get("orderId")),
    );
    const [error, setError] = useState(() => {
        const id = normalizeOrderId(params.get("orderId"));
        return id && !ORDER_ID_PATTERN.test(id)
            ? "That doesn’t look like a YoStore order ID — it should look like YS-AB12CD99."
            : null;
    });
    const [result, setResult] = useState(() => {
        const id = normalizeOrderId(params.get("orderId"));
        if (!id || !ORDER_ID_PATTERN.test(id)) return null;
        return { id, order: ordersRepository.findByOrderId(id) };
    });

    const runLookup = useCallback(
        (rawId) => {
            const id = normalizeOrderId(rawId);
            if (!id) {
                setResult(null);
                setError("Enter an order ID to look it up.");
                return;
            }
            if (!ORDER_ID_PATTERN.test(id)) {
                setResult(null);
                setError(
                    "That doesn’t look like a YoStore order ID — it should look like YS-AB12CD99.",
                );
                return;
            }
            setError(null);
            const order = ordersRepository.findByOrderId(id);
            setResult({ id, order });
            if (order) {
                notify(`Order ${id} found.`, "success");
            } else {
                notify(`No order found with ID ${id}.`, "error");
            }
        },
        [notify],
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        runLookup(input);
    };

    const order = result?.order ?? null;

    return (
        <div className="page-frame py-10 md:py-14">
            <header className="max-w-3xl">
                <p className="eyebrow">Tracking</p>
                <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                    Track your order
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                    Enter the order ID from your confirmation screen — IDs look
                    like{" "}
                    <span className="font-semibold text-ink">YS-AB12CD99</span>
                    .
                </p>
            </header>

            <div className="mt-6 max-w-3xl">
                <DemoNotice label="Demo lookup.">
                    This searches orders stored locally in this browser — no
                    live carrier data, no emails, and nothing is sent anywhere.
                </DemoNotice>
            </div>

            {/* Lookup form */}
            <form
                onSubmit={handleSubmit}
                noValidate
                className="card-flat mt-8 max-w-xl px-5 py-5"
            >
                <label htmlFor="order-id" className="field-label">
                    Order ID
                </label>
                <div className="flex flex-wrap gap-3">
                    <input
                        id="order-id"
                        className="field uppercase min-w-0 flex-1"
                        type="text"
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value.toUpperCase());
                            if (error) setError(null);
                        }}
                        placeholder="YS-AB12CD99"
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={error ? "true" : undefined}
                        aria-describedby={`order-id-help${
                            error ? " order-id-error" : ""
                        }`}
                    />
                    <button type="submit" className="btn btn-primary">
                        Look up order
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
                <InlineValidationError id="order-id-error">
                    {error}
                </InlineValidationError>
                <p
                    id="order-id-help"
                    className="mt-3 text-xs leading-relaxed text-muted"
                >
                    The lookup is a demo: it matches against every demo order
                    saved in this browser.{" "}
                    {isAuthenticated ? (
                        <Link
                            to="/orders"
                            className="link-underline font-semibold text-accent"
                        >
                            Your order history
                        </Link>
                    ) : (
                        <Link
                            to="/faq"
                            className="link-underline font-semibold text-accent"
                        >
                            See the FAQ
                        </Link>
                    )}{" "}
                    lists orders tied to your account.
                </p>
            </form>

            {/* Unknown order */}
            {result && !order ? (
                <div className="mt-10 max-w-2xl">
                    <EmptyState
                        icon={SearchX}
                        title={`No order found for ${result.id}`}
                        description="Double-check the ID, or note that demo orders only exist in the browser they were placed in — clearing site data removes them."
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link to="/shop" className="btn btn-primary btn-sm">
                                    Continue shopping
                                </Link>
                                <Link
                                    to="/shipping"
                                    className="btn btn-secondary btn-sm"
                                >
                                    Shipping &amp; delivery
                                </Link>
                                <Link to="/faq" className="btn btn-secondary btn-sm">
                                    Read the FAQ
                                </Link>
                            </div>
                        }
                    />
                </div>
            ) : null}

            {/* Result */}
            {order ? (
                <section
                    aria-labelledby="tracking-result-title"
                    className="mt-12"
                >
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-hair pb-6">
                        <div>
                            <p className="eyebrow">Order found</p>
                            <h2
                                id="tracking-result-title"
                                className="mt-2 font-display text-3xl tabular-nums text-balance-tight"
                            >
                                {order.orderId}
                            </h2>
                            <p className="mt-2 text-sm text-muted">
                                Placed {formatDateTime(order.createdAt)} ·{" "}
                                {order.shippingMethodName} ·{" "}
                                {order.shippingEta}
                            </p>
                        </div>
                        <OrderStatusChip status={order.status} />
                    </div>

                    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_20rem]">
                        <div>
                            <OrderTimeline order={order} />
                        </div>

                        <aside
                            aria-labelledby="tracking-summary-title"
                            className="card-flat"
                        >
                            <div className="border-b border-hair px-5 py-4">
                                <h3
                                    id="tracking-summary-title"
                                    className="font-display text-lg"
                                >
                                    Order summary
                                </h3>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                                    <Truck
                                        className="size-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    Estimated delivery{" "}
                                    {formatDate(order.estimatedDelivery)}
                                </p>
                            </div>
                            <div className="px-5 py-4">
                                <ul className="mb-4 space-y-2 border-b border-hair pb-4 text-sm">
                                    {order.items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-baseline justify-between gap-3"
                                        >
                                            <span className="min-w-0 flex-1 truncate text-ink">
                                                {item.title}
                                            </span>
                                            <span className="shrink-0 text-xs text-muted tabular-nums">
                                                × {item.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <TotalsBreakdown totals={order.totals} />
                                <dl className="mt-4 space-y-2 border-t border-hair pt-4 text-xs">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-muted">Payment</dt>
                                        <dd className="font-medium text-ink">
                                            {order.paymentMethodId === "online"
                                                ? "Paid (simulated)"
                                                : "Due on delivery"}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-muted">Promo</dt>
                                        <dd className="font-medium text-ink">
                                            {order.totals.coupon ?? "None"}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </aside>
                    </div>

                    <p className="mt-10 flex items-start gap-2 border-t border-hair pt-6 text-xs leading-relaxed text-muted">
                        <CircleHelp
                            className="mt-px size-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        Looking for a different order? Search another ID above,{" "}
                        {isAuthenticated ? (
                            <>
                                browse{" "}
                                <Link
                                    to="/orders"
                                    className="link-underline font-semibold text-accent"
                                >
                                    your history
                                </Link>
                                , or{" "}
                            </>
                        ) : null}
                        <Link
                            to="/shipping"
                            className="link-underline font-semibold text-accent"
                        >
                            read how shipping works
                        </Link>
                        .
                    </p>
                </section>
            ) : null}
        </div>
    );
}
