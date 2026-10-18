import { Link } from "react-router";
import { ArrowRight, Store, Truck, Zap } from "lucide-react";
import { SHIPPING_METHODS } from "../../../utils/pricing";
import { formatCurrency } from "../../../utils/formatting";
import Reveal from "../Reveal";

const METHOD_ICONS = {
    standard: Truck,
    express: Zap,
    pickup: Store,
};

function priceLine(method) {
    if (method.cost === 0) return "Free";
    const freeOver =
        method.freeOver != null
            ? `, free over ${formatCurrency(method.freeOver)}`
            : "";
    return `${formatCurrency(method.cost)}${freeOver}`;
}

/**
 * Benefits & shipping strip: every cost, ETA window, and free-shipping
 * threshold is read from `SHIPPING_METHODS` — nothing is invented here.
 * Compact, hairline-divided, with real links to policy and tracking.
 */
export default function BenefitsSection() {
    return (
        <section
            aria-labelledby="benefits-heading"
            className="rule-t rule-b"
        >
            <div className="page-frame py-12 md:py-16">
                <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <div>
                        <p className="eyebrow">Delivery & demo guarantees</p>
                        <h2
                            id="benefits-heading"
                            className="mt-3 font-display text-2xl leading-tight text-balance-tight md:text-4xl"
                        >
                            Three ways to get it to you.
                        </h2>
                    </div>
                    <Link
                        to="/shipping"
                        className="link-underline text-sm font-semibold"
                    >
                        Full shipping policy
                        <ArrowRight
                            className="ml-1 inline size-4"
                            aria-hidden="true"
                        />
                    </Link>
                </Reveal>

                <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-0">
                    {SHIPPING_METHODS.map((method) => {
                        const Icon = METHOD_ICONS[method.id] ?? Truck;
                        return (
                            <li
                                key={method.id}
                                className="border-t border-hair pt-5 md:border-t-0 md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0"
                            >
                                <Icon
                                    className="size-5 text-accent"
                                    aria-hidden="true"
                                />
                                <h3 className="mt-3 font-display text-lg">
                                    {method.name}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                                    {method.description}
                                </p>
                                <p className="mt-3 text-sm">
                                    <span className="font-semibold">
                                        {priceLine(method)}
                                    </span>
                                    <span className="text-muted">
                                        {" "}
                                        · {method.etaMin}–{method.etaMax} day
                                        window
                                    </span>
                                </p>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hair pt-5 text-xs text-muted">
                    <span>Cash on delivery available at checkout.</span>
                    <Link to="/tracking" className="link-underline">
                        Track a demo order
                        <ArrowRight
                            className="ml-1 inline size-3.5"
                            aria-hidden="true"
                        />
                    </Link>
                    <Link to="/faq" className="link-underline">
                        Common questions
                        <ArrowRight
                            className="ml-1 inline size-3.5"
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}
