import { Link } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useCategories } from "../../../hooks";
import { productsApi } from "../../../services";
import { queryKeys } from "../../../app/queryClient";
import ErrorState from "../../../components/feedback/ErrorState";
import { SkeletonBlock } from "../../../components/feedback/Skeletons";
import { selectCollectionSlugs } from "../hooks/useHomeData";
import Reveal from "../Reveal";

const PREFERRED_SLUGS = [
    "furniture",
    "womens-dresses",
    "mens-watches",
    "sunglasses",
];
const TEASER_PARAMS = { page: 1, limit: 1, sortBy: "rating", order: "desc" };

/** Varied tile spans: one tall anchor, one wide tile, two small tiles. */
const TILES = [
    "h-72 md:col-span-5 md:row-span-2 md:h-auto",
    "h-64 md:col-span-7",
    "h-56 md:col-span-4",
    "h-56 md:col-span-3",
];

function CollectionTile({ category, teaser, layout }) {
    const lead = teaser?.data?.products?.[0];
    const total = teaser?.data?.total;

    return (
        <Link
            to={`/shop/${category.slug}`}
            aria-label={`Browse the ${category.name} collection`}
            className={`group flex flex-col ${layout}`}
        >
            <div className="relative min-h-0 flex-1 overflow-hidden bg-sunken">
                {lead ? (
                    <img
                        src={lead.thumbnail || lead.images?.[0] || ""}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : teaser?.isError ? (
                    <span
                        className="grid size-full place-items-center font-display text-4xl text-muted"
                        aria-hidden="true"
                    >
                        {category.name.slice(0, 1)}
                    </span>
                ) : (
                    <SkeletonBlock className="absolute inset-0" />
                )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-hair pt-3">
                <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-accent md:text-xl">
                    {category.name}
                </h3>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                    {total != null ? `${total} products` : "Loading…"}
                    <ArrowUpRight
                        className="size-4 transition-colors group-hover:text-accent"
                        aria-hidden="true"
                    />
                </span>
            </div>
        </Link>
    );
}

/**
 * Featured collections: four categories from `/products/categories`, laid out
 * asymmetrically (tall anchor + wide + two small) instead of a uniform grid.
 * Each tile fetches its own single-product teaser so imagery and piece counts
 * are real API values, and every tile links to `/shop/:slug`.
 */
export default function CollectionsSection() {
    const {
        data: categories,
        isPending,
        isError,
        error,
        refetch,
    } = useCategories();

    const slugs = isPending
        ? []
        : selectCollectionSlugs(categories, PREFERRED_SLUGS, 4);

    const teasers = useQueries({
        queries: slugs.map((slug) => ({
            queryKey: queryKeys.category(slug, TEASER_PARAMS),
            queryFn: ({ signal }) =>
                productsApi.getCategoryProducts(slug, {
                    ...TEASER_PARAMS,
                    signal,
                }),
            staleTime: 30 * 60 * 1000,
        })),
    });

    const tiles = slugs.map((slug, index) => ({
        category: Array.isArray(categories)
            ? categories.find((category) => category.slug === slug)
            : undefined,
        teaser: teasers[index],
        layout: TILES[index] ?? TILES[TILES.length - 1],
    }));

    return (
        <section
            id="collections"
            aria-labelledby="collections-heading"
            className="page-frame scroll-mt-32 py-16 md:py-24"
        >
            <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-hair pb-6">
                <div>
                    <p className="eyebrow">Featured collections</p>
                    <h2
                        id="collections-heading"
                        className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-5xl"
                    >
                        Start somewhere specific.
                    </h2>
                </div>
                <Link
                    to="/shop"
                    className="link-underline text-sm font-semibold"
                >
                    Shop all categories
                    <ArrowRight
                        className="ml-1 inline size-4"
                        aria-hidden="true"
                    />
                </Link>
            </Reveal>

            {isError ? (
                <ErrorState
                    className="mt-10"
                    title="Collections unavailable"
                    error={error}
                    onRetry={refetch}
                />
            ) : isPending ? (
                <div
                    className="mt-10 grid gap-5 md:grid-cols-12"
                    role="status"
                    aria-label="Loading collections"
                >
                    {TILES.map((layout, index) => (
                        <SkeletonBlock key={index} className={layout} />
                    ))}
                </div>
            ) : (
                <div className="mt-10 grid gap-5 md:grid-cols-12">
                    {tiles.map(({ category, teaser, layout }) =>
                        category ? (
                            <CollectionTile
                                key={category.slug}
                                category={category}
                                teaser={teaser}
                                layout={layout}
                            />
                        ) : null,
                    )}
                </div>
            )}
        </section>
    );
}
