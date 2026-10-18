import { Link } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SHIPPING_METHODS } from "../../../utils/pricing";
import { formatCurrency } from "../../../utils/formatting";

const [standard, express, pickup] = SHIPPING_METHODS;

/** Answers assembled from real config so this teaser can never drift. */
const SHIPPING_ANSWER = [
    `Three options: ${standard.name.toLowerCase()} — ${formatCurrency(standard.cost)}${
        standard.freeOver != null
            ? ` (free over ${formatCurrency(standard.freeOver)})`
            : ""
    }, ${standard.description.toLowerCase()};`,
    `${express.name.toLowerCase()} — ${formatCurrency(express.cost)}, ${express.description.toLowerCase()};`,
    `and ${pickup.name.toLowerCase()} — ${
        pickup.cost === 0 ? "free" : formatCurrency(pickup.cost)
    }, ${pickup.description.toLowerCase()}.`,
].join(" ");

const FAQS = [
    {
        question: "Is YoStore a real shop?",
        answer:
            "No — YoStore is a frontend demo. The catalog is served by DummyJSON, your cart, wishlist and orders live only in your browser, and nothing is charged, emailed or shipped anywhere.",
    },
    {
        question: "How long does delivery take?",
        answer: (
            <>
                {SHIPPING_ANSWER} The{" "}
                <Link to="/shipping" className="link-underline">
                    shipping page
                </Link>{" "}
                carries the same values checkout uses — every number comes
                from one shared config.
            </>
        ),
    },
    {
        question: "Can I track an order?",
        answer: (
            <>
                Yes. Every demo order gets a simulated timeline on the{" "}
                <Link to="/tracking" className="link-underline">
                    tracking page
                </Link>{" "}
                — statuses are generated locally so you can watch the whole
                flow without a warehouse.
            </>
        ),
    },
    {
        question: "Which payment methods can I use?",
        answer:
            "Checkout offers cash on delivery or a simulated online payment. No real charge happens: payment states are demo labels, just like the order timeline.",
    },
];

/**
 * FAQ teaser: four disclosure items (native `<details>` for keyboard and
 * screen-reader support) whose answers match the app's real behavior, plus
 * routes out to the full FAQ, shipping, and tracking pages.
 */
export default function FaqTeaserSection() {
    return (
        <section
            aria-labelledby="faq-teaser-heading"
            className="rule-t"
        >
            <div className="page-frame grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-4">
                    <p className="eyebrow">FAQ</p>
                    <h2
                        id="faq-teaser-heading"
                        className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-4xl"
                    >
                        Before you ask.
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
                        The honest answers, in short form. The long versions
                        live on the FAQ page, with routes out to shipping,
                        tracking and contact.
                    </p>
                    <Link to="/faq" className="btn btn-secondary mt-6">
                        Read all FAQs
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                <div className="lg:col-span-8">
                    <ul className="border-t border-hair">
                        {FAQS.map((faq, index) => (
                            <li
                                key={faq.question}
                                className="grid grid-cols-[2rem_1fr] gap-4 border-b border-hair py-2 md:grid-cols-[2.5rem_1fr]"
                            >
                                <span
                                    className="eyebrow pt-4 tabular-nums"
                                    aria-hidden="true"
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <details className="group">
                                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                                        <h3 className="font-display text-lg leading-snug md:text-xl">
                                            {faq.question}
                                        </h3>
                                        <ChevronDown
                                            className="mt-1 size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180"
                                            aria-hidden="true"
                                        />
                                    </summary>
                                    <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-ink-soft">
                                        {faq.answer}
                                    </p>
                                </details>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
