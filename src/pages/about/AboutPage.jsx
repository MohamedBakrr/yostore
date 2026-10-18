import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Compass, Eye, Scale } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { SkeletonBlock } from "../../components/feedback/Skeletons";
import { SHIPPING_METHODS } from "../../utils/pricing";
import { COUPONS } from "../../utils/pricing/coupons";
import DemoNotice from "../../components/checkout/DemoNotice";

const FIGURES = [
    { label: "Products in the catalog", value: (total) => total ?? "—" },
    { label: "Shipping options", value: () => SHIPPING_METHODS.length },
    { label: "Demo coupon codes", value: () => COUPONS.length },
    { label: "Servers contacted", value: () => 1 },
];

const VALUES = [
    {
        icon: Eye,
        title: "Say what is real",
        body: "Whenever a behavior is simulated — payments, tracking, accounts, contact forms — the page says so in plain words. A demo that pretends teaches nothing.",
    },
    {
        icon: Compass,
        title: "Curate, don't inflate",
        body: "The catalog is a public dataset; the taste is the interface. We would rather present a few objects well than drown a grid in noise.",
    },
    {
        icon: Scale,
        title: "Accessible or it doesn't ship",
        body: "Keyboard paths, visible focus, real labels, and honest states are requirements, not polish. If a flow cannot be completed without a mouse, it is unfinished.",
    },
];

const PROCESS = [
    {
        step: "01",
        title: "Curate",
        body: "A small set of collections stands in for a real merchandising calendar. Every product shown comes from the live DummyJSON catalog — nothing is hard-coded for the demo.",
    },
    {
        step: "02",
        title: "Compose",
        body: "Layouts alternate deliberately: full-bleed imagery, asymmetric spreads, and typographic pauses. The store should read like a magazine that happens to sell things.",
    },
    {
        step: "03",
        title: "Label",
        body: "Totals come from one pricing module, orders and tracking are marked simulated, and demo data is disclosed on every surface that fakes it — including this one.",
    },
];

function FigureStrip({ total }) {
    return (
        <dl className="rule-t grid grid-cols-2 gap-x-6 gap-y-8 pt-8 md:grid-cols-4">
            {FIGURES.map((figure) => (
                <div key={figure.label} className="flex flex-col-reverse">
                    <dt className="eyebrow mt-3">{figure.label}</dt>
                    <dd className="font-display text-3xl leading-none text-ink md:text-4xl">
                        {figure.value(total)}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * About page (SPEC §18): editorial brand story for a storefront that is honest
 * about being a demonstration. Catalog imagery is fetched live through TanStack
 * Query; if it fails, the page degrades to a type-only composition.
 */
export default function AboutPage() {
    useDocumentTitle("About", {
        description:
            "The story behind YoStore — an editorial demo storefront built to be honest about simulated behavior, accessible by default, and curated over endless.",
    });

    const { data, isPending } = useQuery({
        queryKey: queryKeys.products({
            context: "about",
            limit: 4,
            sortBy: "rating",
            order: "desc",
        }),
        queryFn: ({ signal }) =>
            productsApi.getProducts({
                limit: 4,
                sortBy: "rating",
                order: "desc",
                signal,
            }),
        staleTime: 10 * 60 * 1000,
    });

    const shots = (data?.products ?? []).slice(0, 3);
    const lead = shots[0];
    const supports = shots.slice(1);

    const image = (product, priority = false) =>
        product ? (
            <img
                src={product.images?.[0] ?? product.thumbnail}
                alt={product.title}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : undefined}
                className="size-full object-cover"
            />
        ) : null;

    return (
        <div className="page-frame py-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                    <p className="eyebrow">About YoStore</p>
                    <h1 className="mt-4 font-display text-5xl leading-[1.02] text-balance-tight md:text-6xl lg:text-7xl">
                        A store that tells you exactly how much of it is real.
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
                        YoStore began as a question: how editorial can a
                        storefront feel before it stops feeling honest? The
                        answer became this — a shop with real products, real
                        pricing logic, and real interaction design, sitting on
                        top of a catalog it does not own and a backend it does
                        not have.
                    </p>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                        Everything you add to a cart, save to a wishlist, or
                        order lives in your browser. Nothing is charged,
                        shipped, or emailed. We think a demonstration is only
                        useful while everyone involved remembers it is one.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/shop" className="btn btn-primary">
                            Browse the catalog
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                        <Link to="/contact" className="btn btn-secondary">
                            Contact
                        </Link>
                    </div>
                </div>

                <figure className="lg:col-span-5">
                    <div className="aspect-4/5 overflow-hidden bg-sunken">
                        {isPending ? (
                            <SkeletonBlock className="size-full" />
                        ) : lead ? (
                            image(lead, true)
                        ) : (
                            <div className="flex size-full items-center justify-center px-8 text-center">
                                <p className="font-display text-xl leading-snug text-muted">
                                    Catalog imagery is unavailable right now —
                                    the story stands on its own.
                                </p>
                            </div>
                        )}
                    </div>
                    <figcaption className="mt-3 text-xs leading-relaxed text-muted">
                        {lead
                            ? `From the live catalog: “${lead.title}” — one of ${data.total} products this demo can pull from DummyJSON.`
                            : "Catalog imagery loads live from DummyJSON, so this page changes as the public dataset does."}
                    </figcaption>
                </figure>
            </div>

            <section aria-labelledby="about-figures-heading" className="mt-16">
                <h2 id="about-figures-heading" className="sr-only">
                    YoStore in numbers
                </h2>
                <FigureStrip total={data?.total} />
                <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted">
                    These figures are honest, not aspirational: the catalog
                    count is the live total returned by DummyJSON, the shipping
                    options and coupon codes are the exact entries in this
                    app&apos;s configuration, and the single server is the
                    public dataset that serves products and images.
                </p>
            </section>

            <section aria-labelledby="about-values-heading" className="mt-16">
                <div className="max-w-2xl">
                    <p className="eyebrow">What we hold to</p>
                    <h2
                        id="about-values-heading"
                        className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-4xl"
                    >
                        Three rules the interface is not allowed to break.
                    </h2>
                </div>
                <ul className="mt-8 grid gap-6 md:grid-cols-3">
                    {VALUES.map(({ icon: Icon, title, body }) => (
                        <li key={title} className="card-flat px-6 py-7">
                            <Icon
                                className="size-6 text-accent"
                                aria-hidden="true"
                            />
                            <h3 className="mt-4 font-display text-xl leading-snug">
                                {title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted">
                                {body}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            <section
                aria-labelledby="about-process-heading"
                className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12"
            >
                <div className="lg:col-span-4">
                    <p className="eyebrow">How we work</p>
                    <h2
                        id="about-process-heading"
                        className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-4xl"
                    >
                        Curation, composition, disclosure.
                    </h2>
                    {supports.length > 0 ? (
                        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-1">
                            {supports.map((product) => (
                                <figure key={product.id}>
                                    <div className="aspect-3/2 overflow-hidden bg-sunken">
                                        {image(product)}
                                    </div>
                                    <figcaption className="mt-2 text-xs leading-relaxed text-muted">
                                        {product.title}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    ) : null}
                </div>

                <ol className="lg:col-span-8">
                    {PROCESS.map((item) => (
                        <li
                            key={item.step}
                            className="grid gap-4 border-t border-hair py-8 last:border-b md:grid-cols-[6rem_1fr] md:gap-8"
                        >
                            <span
                                className="font-display text-3xl leading-none text-accent"
                                aria-hidden="true"
                            >
                                {item.step}
                            </span>
                            <div>
                                <h3 className="font-display text-2xl leading-tight">
                                    {item.title}
                                </h3>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                                    {item.body}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <DemoNotice label="About this demo." className="mt-16">
                YoStore is a frontend exercise. The catalog and its images come
                from DummyJSON, a public demo dataset; carts, wishlists, orders,
                accounts, and the admin dashboard all live in this browser
                only. No purchase, payment, or message can reach anyone.
            </DemoNotice>
        </div>
    );
}
