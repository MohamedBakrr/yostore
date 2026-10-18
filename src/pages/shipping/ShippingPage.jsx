import { Link } from "react-router";
import { ArrowRight, CircleCheck, Radio, Truck } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatCurrency } from "../../utils/formatting";
import { SHIPPING_METHODS } from "../../utils/pricing";
import DemoNotice from "../../components/checkout/DemoNotice";

const SIMULATED_LIMITS = [
    "No real carrier services are connected — every method, cost, and window comes from YoStore’s local shipping config.",
    "Tracking is simulated: the timeline you see is stored demo data, not live carrier scans.",
    "The pickup point is a fictional demo location; nothing is prepared for collection.",
    "Delivery windows are business-day estimates for the demo, not guarantees.",
];

/**
 * `/shipping` — editorial policy page generated from `SHIPPING_METHODS`, so
 * the copy can never drift from the pricing module the checkout uses.
 */
export default function ShippingPage() {
    useDocumentTitle("Shipping & delivery", {
        description:
            "The three YoStore demo shipping methods with their costs, delivery windows, and free-shipping threshold — plus what’s simulated in this frontend-only demo.",
    });

    const freeOver =
        SHIPPING_METHODS.find((method) => method.freeOver != null) ?? null;

    return (
        <div className="page-frame py-10 md:py-14">
            {/* Header: asymmetric — big title left, lead right */}
            <header className="grid items-end gap-6 border-b border-hair pb-8 md:grid-cols-[1.2fr_1fr]">
                <div>
                    <p className="eyebrow">Delivery</p>
                    <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-6xl">
                        How your order travels
                    </h1>
                </div>
                <p className="text-sm leading-relaxed text-muted md:pb-2">
                    Three ways to get a YoStore order to you, priced and timed
                    by the same module that calculates your cart total — so
                    what you read here is exactly what checkout charges.
                </p>
            </header>

            <div className="mt-6 max-w-3xl">
                <DemoNotice label="Demo delivery.">
                    YoStore is a frontend-only demo: these methods are
                    real in the app, but nothing is shipped in the physical
                    world.
                </DemoNotice>
            </div>

            {/* Methods: full-width numbered rows */}
            <section aria-labelledby="methods-title" className="mt-14">
                <h2 id="methods-title" className="font-display text-2xl md:text-3xl">
                    The methods
                </h2>
                <ol className="mt-6 border-t border-hair">
                    {SHIPPING_METHODS.map((method, index) => (
                        <li
                            key={method.id}
                            className="grid gap-x-8 gap-y-3 border-b border-hair py-7 md:grid-cols-[4rem_minmax(0,1fr)_auto]"
                        >
                            <span
                                className="font-display text-2xl text-accent tabular-nums"
                                aria-hidden="true"
                            >
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <div>
                                <h3 className="font-display text-xl text-ink">
                                    {method.name}
                                </h3>
                                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                                    {method.description}. Arrives within{" "}
                                    <strong className="font-semibold text-ink-soft">
                                        {method.etaMin}–{method.etaMax} business
                                        days
                                    </strong>{" "}
                                    of placing your demo order.
                                </p>
                                {method.freeOver != null ? (
                                    <p className="mt-2 text-xs font-semibold text-success">
                                        Free once your merchandise total reaches{" "}
                                        {formatCurrency(method.freeOver)} after
                                        discounts.
                                    </p>
                                ) : null}
                            </div>
                            <p className="self-start text-right">
                                <span className="block font-display text-2xl font-semibold text-ink tabular-nums">
                                    {method.cost === 0
                                        ? "Free"
                                        : formatCurrency(method.cost)}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted">
                                    {method.etaMin}–{method.etaMax} business days
                                </span>
                            </p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Threshold + limitations: varied two-column band */}
            <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
                {freeOver ? (
                    <section
                        aria-labelledby="free-shipping-title"
                        className="border border-hair bg-sunken px-6 py-7"
                    >
                        <p className="eyebrow flex items-center gap-1.5">
                            <CircleCheck className="size-3.5" aria-hidden="true" />
                            Threshold
                        </p>
                        <h2
                            id="free-shipping-title"
                            className="mt-3 font-display text-2xl text-balance-tight"
                        >
                            Standard shipping is free over{" "}
                            {formatCurrency(freeOver.freeOver)}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted">
                            Reach{" "}
                            <strong className="font-semibold text-ink-soft">
                                {formatCurrency(freeOver.freeOver)}
                            </strong>{" "}
                            in merchandise total — after item discounts and any
                            promo code — and the{" "}
                            {freeOver.name.toLowerCase()} cost drops to{" "}
                            {formatCurrency(0)} automatically. Your cart shows
                            the remaining amount live, and the demo code{" "}
                            <span className="font-semibold text-ink">
                                FREESHIP
                            </span>{" "}
                            frees standard shipping on qualifying carts too.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link to="/cart" className="btn btn-primary btn-sm">
                                Check your cart
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                            <Link to="/shop" className="btn btn-secondary btn-sm">
                                Keep shopping
                            </Link>
                        </div>
                    </section>
                ) : null}

                <section aria-labelledby="limits-title">
                    <p className="eyebrow flex items-center gap-1.5">
                        <Radio className="size-3.5" aria-hidden="true" />
                        Fine print
                    </p>
                    <h2
                        id="limits-title"
                        className="mt-3 font-display text-2xl text-balance-tight"
                    >
                        What’s simulated here
                    </h2>
                    <ul className="mt-4 space-y-3">
                        {SIMULATED_LIMITS.map((limit) => (
                            <li
                                key={limit}
                                className="flex items-start gap-3 border-b border-hair pb-3 text-sm leading-relaxed text-muted last:border-b-0 last:pb-0"
                            >
                                <Truck
                                    className="mt-0.5 size-4 shrink-0 text-accent"
                                    aria-hidden="true"
                                />
                                {limit}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Recovery links */}
            <section aria-labelledby="shipping-help-title" className="mt-14 border-t border-hair pt-10">
                <h2 id="shipping-help-title" className="font-display text-2xl md:text-3xl">
                    Already have an order ID?
                </h2>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Link to="/tracking" className="btn btn-primary">
                        Track a demo order
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <Link to="/faq" className="btn btn-secondary">
                        Read the FAQ
                    </Link>
                </div>
            </section>
        </div>
    );
}
