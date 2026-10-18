import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "../../../utils/formatting";
import { unitPriceFor } from "../../../utils/pricing";
import ProductPrice from "../../../components/products/ProductPrice";
import { SkeletonBlock } from "../../../components/feedback/Skeletons";
import { pickProducts, useTopRatedProducts } from "../hooks/useHomeData";
import Reveal from "../Reveal";
import ParallaxImage from "../ParallaxImage";

const CAMPAIGN_CATEGORIES = [
    "womens-dresses",
    "tops",
    "mens-shirts",
    "womens-shoes",
    "mobile-accessories",
];

function ListSkeleton() {
    return (
        <div
            className="mt-7 border-t border-hair"
            role="status"
            aria-label="Loading the weekend list"
        >
            {[0, 1].map((row) => (
                <div
                    key={row}
                    className="flex items-center gap-4 border-b border-hair py-4"
                    aria-hidden="true"
                >
                    <SkeletonBlock className="h-3 w-6" />
                    <SkeletonBlock className="h-4 flex-1" />
                    <SkeletonBlock className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

/**
 * Campaign 02 — "Weekend edit": the mirror image of the material study —
 * paper band, photograph left with a small overlapping product card, copy
 * and a numbered two-piece list right. Same real data, deliberately
 * different rhythm.
 */
export default function CampaignWeekendEdit() {
    const { data, isPending } = useTopRatedProducts();
    const picks = pickProducts(data?.products, CAMPAIGN_CATEGORIES, 4);
    const lead = picks[0];
    const inset = picks[1];
    const list = picks.slice(2, 4);
    const shopHref = lead ? `/shop/${lead.category}` : "/shop";

    return (
        <section
            aria-labelledby="campaign-weekend-heading"
            className="bg-paper"
        >
            <div className="page-frame grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14">
                <Reveal className="relative lg:col-span-7">
                    {lead ? (
                        <ParallaxImage
                            src={lead.thumbnail || lead.images?.[0] || ""}
                            alt={`${lead.title}, photographed for the weekend edit`}
                            aspect="aspect-[4/3]"
                        />
                    ) : (
                        <div
                            className="skeleton aspect-[4/3]"
                            aria-hidden="true"
                        />
                    )}

                    {inset ? (
                        <Link
                            to={`/product/${inset.id}`}
                            aria-label={`View ${inset.title}`}
                            className="absolute -bottom-6 right-3 w-[42%] max-w-[15rem] border border-hair bg-surface p-2 transition-transform duration-500 hover:-translate-y-1 sm:right-5 md:-bottom-8"
                        >
                            <span className="relative block aspect-square overflow-hidden bg-sunken">
                                <img
                                    src={
                                        inset.thumbnail ||
                                        inset.images?.[0] ||
                                        ""
                                    }
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="size-full object-cover"
                                />
                            </span>
                            <span className="mt-2 block truncate px-0.5 text-xs font-semibold">
                                {inset.title}
                            </span>
                            <span className="mb-0.5 mt-1 block px-0.5 text-xs text-muted">
                                {formatCurrency(
                                    unitPriceFor(
                                        inset.price,
                                        inset.discountPercentage,
                                    ),
                                )}
                            </span>
                        </Link>
                    ) : null}
                </Reveal>

                <Reveal delay={0.08} className="lg:col-span-5">
                    <p className="eyebrow">Campaign 02 — Weekend edit</p>
                    <h2
                        id="campaign-weekend-heading"
                        className="mt-3 font-display text-4xl leading-[1.06] text-balance-tight md:text-5xl"
                    >
                        Two days out, packed lightly.
                    </h2>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
                        A brighter, smaller edit for the part of the week that
                        isn&apos;t work — easy layers, room to move, and nothing
                        that arrives with an instruction manual.
                    </p>

                    {isPending ? (
                        <ListSkeleton />
                    ) : list.length > 0 ? (
                        <ul className="mt-7 border-t border-hair">
                            {list.map((product, index) => (
                                <li
                                    key={product.id}
                                    className="border-b border-hair"
                                >
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="group flex items-center gap-4 py-4"
                                    >
                                        <span className="eyebrow w-6 shrink-0 tabular-nums">
                                            {`0${index + 2}`}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-accent">
                                                {product.title}
                                            </span>
                                        </span>
                                        <ProductPrice
                                            price={product.price}
                                            discountPercentage={
                                                product.discountPercentage
                                            }
                                            size="sm"
                                            className="shrink-0"
                                        />
                                        <ArrowRight
                                            className="size-4 shrink-0 text-muted transition-colors group-hover:translate-x-1 group-hover:text-accent"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <Link to={shopHref} className="btn btn-primary mt-8">
                        Shop the weekend edit
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}
