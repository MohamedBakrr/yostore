import { Link } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { COUPONS } from "../../utils/pricing/coupons";
import { SHIPPING_METHODS } from "../../utils/pricing";
import { formatCurrency } from "../../utils/formatting";

const [STANDARD, EXPRESS, PICKUP] = SHIPPING_METHODS;

/** Coupon copy comes from the registry itself so this page can never drift. */
const DEMO_COUPONS = COUPONS.filter(
    (coupon) => coupon.enabled && !coupon.expiresAt,
).map((coupon) => ({
    code: coupon.code,
    label: coupon.label,
    minimum:
        coupon.minSubtotal > 0
            ? `Applies to carts over ${formatCurrency(coupon.minSubtotal)}.`
            : "No minimum spend.",
}));

const SHIPPING_SUMMARY = [
    `${STANDARD.name.toLowerCase()} — ${formatCurrency(STANDARD.cost)}${
        STANDARD.freeOver != null
            ? ` (free over ${formatCurrency(STANDARD.freeOver)})`
            : ""
    }, ${STANDARD.description.toLowerCase()}`,
    `${EXPRESS.name.toLowerCase()} — ${formatCurrency(EXPRESS.cost)}, ${EXPRESS.description.toLowerCase()}`,
    `${PICKUP.name.toLowerCase()} — ${
        PICKUP.cost === 0 ? "free" : formatCurrency(PICKUP.cost)
    }, ${PICKUP.description.toLowerCase()}`,
].join("; ");

const TOPICS = [
    {
        id: "shopping",
        title: "Shopping & cart",
        items: [
            {
                question: "Is YoStore a real shop?",
                answer: (
                    <>
                        No — YoStore is a frontend demonstration. The catalog
                        is served by the public DummyJSON dataset, your cart,
                        wishlist, and orders live only in this browser, and
                        nothing is charged, emailed, or shipped anywhere.
                    </>
                ),
            },
            {
                question: "Do I need an account to order?",
                answer: (
                    <>
                        Not at all — guest checkout works end to end. A{" "}
                        <Link to="/auth/register" className="link-underline">
                            demo account
                        </Link>{" "}
                        simply keeps your cart, wishlist, and order history
                        attached to you after you close the tab.
                    </>
                ),
            },
            {
                question: "What happens to my cart when I sign in?",
                answer: (
                    <>
                        Guest and account data merge: duplicate products have
                        their quantities added together, the wishlist becomes
                        the union of both lists, and only then is the guest
                        scope cleared. Your guest cart never disappears before
                        that merge is safely stored.
                    </>
                ),
            },
            {
                question: "Where is my cart actually stored?",
                answer: (
                    <>
                        In this browser&apos;s local storage — under a guest
                        key while browsing anonymously, and under your account
                        key once signed in. Clearing site data resets the demo
                        completely. See the{" "}
                        <Link to="/cart" className="link-underline">
                            cart
                        </Link>{" "}
                        to watch it happen.
                    </>
                ),
            },
        ],
    },
    {
        id: "coupons",
        title: "Coupon codes",
        items: [
            {
                question: "Which demo codes can I try?",
                answer: (
                    <>
                        <ul className="mt-3 space-y-2">
                            {DEMO_COUPONS.map((coupon) => (
                                <li
                                    key={coupon.code}
                                    className="border border-hair bg-sunken px-3 py-2.5"
                                >
                                    <span className="font-mono text-sm font-semibold tracking-wide text-ink">
                                        {coupon.code}
                                    </span>{" "}
                                    — {coupon.label}.{" "}
                                    <span className="text-muted">
                                        {coupon.minimum}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <span className="mt-3 block text-muted">
                            Enter a code in the{" "}
                            <Link to="/cart" className="link-underline">
                                cart
                            </Link>{" "}
                            to apply it. These are demo codes: no campaign, no
                            budget, no limits beyond the rules below.
                        </span>
                    </>
                ),
            },
            {
                question: "Why is my code being rejected?",
                answer: (
                    <>
                        Each cart takes exactly one coupon, and coupons never
                        stack. A code is refused when the cart is under its
                        minimum spend, when it has expired, or when it has been
                        disabled. The registry deliberately contains an expired
                        code and a disabled code so these error paths are real
                        behaviors you can see, not mockups.
                    </>
                ),
            },
            {
                question: "Do discounts combine with sale prices?",
                answer: (
                    <>
                        The catalog discount on each item applies first; a
                        coupon then discounts the already-reduced subtotal.
                        Totals are always computed by one shared pricing module,
                        so the cart, checkout, and order pages agree on every
                        number.
                    </>
                ),
            },
        ],
    },
    {
        id: "accounts",
        title: "Demo accounts",
        items: [
            {
                question: "What exactly is a YoStore account?",
                answer: (
                    <>
                        A small record — name, email, and address details —
                        stored in this browser, plus a session marker that keeps
                        you signed in across refreshes. Signing out clears the
                        guest scope and hands the next visitor a clean cart, so
                        demo sessions never leak into each other.
                    </>
                ),
            },
            {
                question: "How are passwords handled?",
                answer: (
                    <>
                        Each account gets a random salt and a salted SHA-256
                        digest of the password, computed with the browser&apos;s
                        Web Crypto API. Plaintext passwords are never stored and
                        nothing is transmitted. That said, local storage is
                        fully readable and editable by anyone with this
                        browser — treat this as a demo convenience, never as
                        security.
                    </>
                ),
            },
            {
                question: "I forgot my demo password — can it be reset?",
                answer: (
                    <>
                        No, and that is deliberate: there is no server to send a
                        reset link, and the digest cannot be reversed. Create a
                        new demo account, or clear this site&apos;s data to
                        start over from scratch.
                    </>
                ),
            },
            {
                question: "Are the account pages private?",
                answer: (
                    <>
                        Only in the sense that nothing leaves this device. The{" "}
                        <Link to="/profile" className="link-underline">
                            profile
                        </Link>{" "}
                        and{" "}
                        <Link to="/orders" className="link-underline">
                            orders
                        </Link>{" "}
                        pages are protected by a React route guard — a
                        navigation convenience, not authorization. Anyone with
                        access to this browser can read the same storage.
                    </>
                ),
            },
        ],
    },
    {
        id: "payments",
        title: "Payment (simulated)",
        items: [
            {
                question: "Which payment methods does checkout offer?",
                answer: (
                    <>
                        Two: cash on delivery, and a simulated online payment.
                        Both produce a normal-looking confirmation and order
                        record so the whole flow can be explored.
                    </>
                ),
            },
            {
                question: "Will I be charged for anything?",
                answer: (
                    <>
                        Never. No payment form in this demo transmits data
                        anywhere, no charge can occur, and the payment states in
                        checkout are labels — exactly like the simulated events
                        on an order timeline.
                    </>
                ),
            },
        ],
    },
    {
        id: "shipping",
        title: "Shipping & tracking",
        items: [
            {
                question: "How much does shipping cost?",
                answer: (
                    <>
                        {SHIPPING_SUMMARY}. These are the same values checkout
                        uses — one shared configuration, so the{" "}
                        <Link to="/shipping" className="link-underline">
                            shipping page
                        </Link>{" "}
                        can never disagree with your order total.
                    </>
                ),
            },
            {
                question: "Can I track an order?",
                answer: (
                    <>
                        Yes. Every demo order gets a locally generated timeline
                        on the{" "}
                        <Link to="/tracking" className="link-underline">
                            tracking page
                        </Link>
                        , from placed to delivered. The events are simulated:
                        there is no carrier, no warehouse, and no live location
                        behind them.
                    </>
                ),
            },
        ],
    },
    {
        id: "data",
        title: "Data & storage",
        items: [
            {
                question: "What does YoStore store, and where?",
                answer: (
                    <>
                        Everything you create — session, cart, wishlist,
                        checkout draft, orders, and the admin demo overlay —
                        lives in this browser&apos;s local storage. The only
                        network requests go to the DummyJSON catalog API for
                        products, categories, and images.
                    </>
                ),
            },
            {
                question: "Do you track me?",
                answer: (
                    <>
                        No analytics, no advertising, no cookies beyond what the
                        app itself writes to local storage. Open your
                        browser&apos;s network tab: the demo&apos;s only
                        outbound traffic is the catalog fetch.
                    </>
                ),
            },
            {
                question: "How do I reset the whole demo?",
                answer: (
                    <>
                        Clear this site&apos;s data from your browser settings.
                        On the next visit YoStore starts exactly as a first-time
                        visitor would see it: empty cart, empty wishlist, no
                        account, no orders.
                    </>
                ),
            },
        ],
    },
];

const TOPIC_LINKS = TOPICS.map((topic) => ({
    id: topic.id,
    title: topic.title,
    count: topic.items.length,
}));

/**
 * FAQ (SPEC §18): grouped, native `<details>` expandables (keyboard and
 * screen-reader support without custom ARIA), answers assembled from the real
 * pricing and shipping configuration wherever numbers are involved.
 */
export default function FaqPage() {
    useDocumentTitle("FAQ", {
        description:
            "Honest answers about the YoStore demo: shopping and cart behavior, coupon codes, mock accounts, simulated payments, shipping, tracking, and local data storage.",
    });

    return (
        <div className="page-frame py-12 md:py-16">
            <header className="max-w-2xl">
                <p className="eyebrow">FAQ</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-balance-tight md:text-5xl">
                    Questions, answered honestly.
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                    Every answer describes what this demo actually does — where
                    a behavior is faked, it says so. If something is still
                    unclear, the{" "}
                    <Link to="/contact" className="link-underline">
                        contact page
                    </Link>{" "}
                    lists the few real ways out.
                </p>
            </header>

            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <nav
                    aria-label="FAQ topics"
                    className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
                >
                    <p className="eyebrow">Topics</p>
                    <ul className="mt-4 space-y-2">
                        {TOPIC_LINKS.map((topic) => (
                            <li key={topic.id}>
                                <Link
                                    to={`#${topic.id}`}
                                    className="flex items-baseline justify-between gap-3 border-b border-hair py-2 text-sm font-medium text-ink transition-colors hover:text-accent"
                                >
                                    {topic.title}
                                    <span className="text-xs text-muted tabular-nums">
                                        {topic.count}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="lg:col-span-9">
                    {TOPICS.map((topic) => (
                        <section
                            key={topic.id}
                            id={topic.id}
                            aria-labelledby={`${topic.id}-heading`}
                            className="mb-12 scroll-mt-28 last:mb-0"
                        >
                            <h2
                                id={`${topic.id}-heading`}
                                className="font-display text-2xl leading-tight md:text-3xl"
                            >
                                {topic.title}
                            </h2>
                            <ul className="mt-5 border-t border-hair">
                                {topic.items.map((item, index) => (
                                    <li
                                        key={item.question}
                                        className="grid grid-cols-[2rem_1fr] gap-4 border-b border-hair md:grid-cols-[2.5rem_1fr]"
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
                                                    {item.question}
                                                </h3>
                                                <ChevronDown
                                                    className="mt-1 size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180"
                                                    aria-hidden="true"
                                                />
                                            </summary>
                                            <div className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-ink-soft">
                                                {item.answer}
                                            </div>
                                        </details>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}

                    <div className="rule-t flex flex-wrap items-center justify-between gap-4 pt-8">
                        <p className="max-w-md text-sm leading-relaxed text-muted">
                            Still curious about something specific? The contact
                            page shows what is and is not reachable — or head
                            back to the catalog and keep browsing.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/contact" className="btn btn-secondary">
                                Ask a question
                            </Link>
                            <Link to="/shop" className="btn btn-primary">
                                Browse the shop
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
