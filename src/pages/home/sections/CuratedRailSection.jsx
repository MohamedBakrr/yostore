import { useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import ProductPrice from "../../../components/products/ProductPrice";
import ErrorState from "../../../components/feedback/ErrorState";
import EmptyState from "../../../components/feedback/EmptyState";
import { SkeletonBlock } from "../../../components/feedback/Skeletons";
import { rankByDiscount, useSalePool } from "../hooks/useHomeData";

const RAIL_COUNT = 8;
const FIRST_WIDTH = "w-[80%] sm:w-[52%] lg:w-[26rem]";
const ITEM_WIDTH = "w-[72%] sm:w-[40%] lg:w-[19rem]";

function RailSkeleton() {
    return (
        <div
            className="mt-10 flex gap-5 overflow-hidden"
            role="status"
            aria-label="Loading curated products"
        >
            {[0, 1, 2, 3].map((index) => (
                <div
                    key={index}
                    className={`${index === 0 ? FIRST_WIDTH : ITEM_WIDTH} shrink-0`}
                    aria-hidden="true"
                >
                    <SkeletonBlock className="aspect-4/5 w-full" />
                    <SkeletonBlock className="mt-4 h-3 w-1/3" />
                    <SkeletonBlock className="mt-2.5 h-4 w-3/4" />
                </div>
            ))}
        </div>
    );
}

/**
 * Curated discovery: a native horizontal snap rail of the biggest live
 * discounts (ranked client-side from one fetched page — never a catalog
 * sweep). Oversized first card, numbered captions, keyboard-scrollable
 * region plus prev/next controls; smooth scrolling is disabled under
 * reduced motion.
 */
export default function CuratedRailSection() {
    const { data, isPending, isError, error, refetch } = useSalePool();
    const reduced = useReducedMotion();
    const railRef = useRef(null);

    const discounted = (
        Array.isArray(data?.products) ? data.products : []
    ).filter((product) => Number(product.discountPercentage) > 0);
    const picks = rankByDiscount(discounted, RAIL_COUNT);

    const scrollRail = (direction) => {
        const rail = railRef.current;
        if (!rail) return;
        rail.scrollBy({
            left: direction * rail.clientWidth * 0.8,
            behavior: reduced ? "auto" : "smooth",
        });
    };

    return (
        <section
            aria-labelledby="curated-heading"
            className="bg-sunken"
        >
            <div className="page-frame py-16 md:py-24">
                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
                    <div className="max-w-xl">
                        <p className="eyebrow">Curated — price watch</p>
                        <h2
                            id="curated-heading"
                            className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-5xl"
                        >
                            Marked down, not marked aside.
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                            The biggest current discounts on one fetched page
                            of the catalog, biggest cut first — pulled sideways
                            so you can browse them without leaving the story.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="icon-btn border border-hair bg-surface"
                            onClick={() => scrollRail(-1)}
                            disabled={picks.length === 0}
                            aria-label="Scroll the curation left"
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="icon-btn border border-hair bg-surface"
                            onClick={() => scrollRail(1)}
                            disabled={picks.length === 0}
                            aria-label="Scroll the curation right"
                        >
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                        <Link
                            to="/shop"
                            className="link-underline ml-3 text-sm font-semibold"
                        >
                            View all
                            <ArrowRight
                                className="ml-1 inline size-4"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>

                {isPending ? (
                    <RailSkeleton />
                ) : isError ? (
                    <ErrorState
                        className="mt-10"
                        title="Price drops failed to load"
                        error={error}
                        onRetry={refetch}
                    />
                ) : picks.length === 0 ? (
                    <EmptyState
                        className="mt-10"
                        title="No active price drops"
                        description="This visit's catalog page came back without discounts — the full lineup is still one click away."
                        action={
                            <Link to="/shop" className="btn btn-secondary">
                                Browse every product
                            </Link>
                        }
                    />
                ) : (
                    <ul
                        ref={railRef}
                        tabIndex={0}
                        aria-label="Curated price drops"
                        className="hide-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
                    >
                        {picks.map((product, index) => (
                            <li
                                key={product.id}
                                className={`${index === 0 ? FIRST_WIDTH : ITEM_WIDTH} shrink-0 snap-start`}
                            >
                                <article className="group flex h-full flex-col">
                                    <div className="relative aspect-4/5 overflow-hidden bg-sunken">
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="block size-full"
                                            aria-label={`View ${product.title}`}
                                        >
                                            <img
                                                src={
                                                    product.thumbnail ||
                                                    product.images?.[0] ||
                                                    ""
                                                }
                                                alt={product.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </Link>
                                        <span className="absolute left-0 top-0 bg-accent px-2 py-1 text-[11px] font-bold tracking-wide text-accent-contrast">
                                            −
                                            {Math.round(
                                                Number(
                                                    product.discountPercentage,
                                                ),
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-start justify-between gap-3 border-t border-hair pt-3">
                                        <div className="min-w-0">
                                            <p className="eyebrow tabular-nums">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </p>
                                            <h3 className="mt-1.5 font-display text-base leading-snug">
                                                <Link
                                                    to={`/product/${product.id}`}
                                                    className="transition-colors hover:text-accent"
                                                >
                                                    {product.title}
                                                </Link>
                                            </h3>
                                            <p className="mt-1 text-xs text-muted">
                                                {String(
                                                    product.category ?? "",
                                                ).replaceAll("-", " ")}
                                            </p>
                                        </div>
                                        <ProductPrice
                                            price={product.price}
                                            discountPercentage={
                                                product.discountPercentage
                                            }
                                            size="sm"
                                            className="shrink-0"
                                        />
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
