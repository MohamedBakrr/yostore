import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchX, SlidersHorizontal, X } from "lucide-react";

import { PAGE_SIZE, productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { isApiError } from "../../utils/apiErrors";
import { useCategories } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

import ProductCard from "../../components/products/ProductCard";
import ProductGrid from "../../components/products/ProductGrid";
import Pagination from "../../components/products/Pagination";
import ProductFilters from "../../components/products/ProductFilters";
import SortSelect from "../../components/products/SortSelect";
import { categoryLabel } from "../../components/products/categoryLabel";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import { ProductGridSkeleton } from "../../components/feedback/Skeletons";

import {
    DEFAULT_SORT,
    SORT_OPTIONS,
    normalizePriceRange,
    parsePage,
    parseQuery,
    parseSort,
    priceRangeLabel,
    sortToApi,
} from "./shopParams";

const SEARCH_DEBOUNCE_MS = 300;
const PRICE_DEBOUNCE_MS = 400;

/**
 * SPEC §7.4 documented trade-off: DummyJSON has no price-filter parameter, so
 * an active price range switches the shop to a single full-catalog request
 * (limit=200 — the public catalog is ~200 items) and filters + paginates
 * client-side. With no price filter, pagination is purely server-side via
 * `limit`/`skip`/`total`. Search within a category also uses this pipeline,
 * since DummyJSON's search endpoint cannot scope to one category.
 */
const CATALOG_LIMIT = 200;

function ActiveFilterChip({ label, onRemove }) {
    return (
        <span className="chip pr-1.5">
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove filter: ${label}`}
                className="grid size-7 place-items-center text-muted transition-colors hover:text-ink"
            >
                <X className="size-3.5" aria-hidden="true" />
            </button>
        </span>
    );
}

/**
 * Shop + category listing — `/shop` and `/shop/:category`.
 *
 * URL search params (`q`, `sort`, `page`, `min`, `max`) are the single source
 * of truth for discovery state: inputs write to the URL immediately, queries
 * run off debounced mirrors, so typing never fires a request per keystroke and
 * every view is shareable/refresh-safe without any setState-in-effect syncing.
 * Changing any filter resets `page` to 1.
 */
export default function ShopPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const reducedMotion = usePrefersReducedMotion();

    /* ---------------- URL state (validated on read) ---------------- */
    const qRaw = parseQuery(searchParams.get("q"));
    const query = qRaw.trim();
    const sort = parseSort(searchParams.get("sort"));
    const page = parsePage(searchParams.get("page"));
    const minRaw = searchParams.get("min") ?? "";
    const maxRaw = searchParams.get("max") ?? "";
    const priceRange = useMemo(
        () => normalizePriceRange(minRaw, maxRaw),
        [minRaw, maxRaw],
    );

    /* Debounced mirrors — the request pipeline only runs on these. */
    const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
    const debouncedPrice = useDebounce(priceRange, PRICE_DEBOUNCE_MS);

    /* ---------------- Categories & route validation ---------------- */
    const categoriesQuery = useCategories();
    const categories = categoriesQuery.data ?? [];
    const activeCategory = category
        ? (categories.find((entry) => entry.slug === category) ?? null)
        : null;
    // `/shop/:category` is validated against the fetched category list (SPEC §6).
    const categoryMissing =
        Boolean(category) && categoriesQuery.isSuccess && !activeCategory;
    const categoryName = activeCategory?.name ?? categoryLabel(category);

    /* ---------------- Query wiring ---------------- */
    const priceActive =
        debouncedPrice.min !== null || debouncedPrice.max !== null;
    const clientPipeline =
        priceActive || (debouncedQuery !== "" && Boolean(category));

    const { sortBy, order } = sortToApi(sort);
    const fetchParams = useMemo(
        () =>
            clientPipeline
                ? { page: 1, limit: CATALOG_LIMIT, sortBy, order }
                : { page, limit: PAGE_SIZE, sortBy, order },
        [clientPipeline, page, sortBy, order],
    );

    const queryKey = useMemo(() => {
        if (debouncedQuery) {
            return queryKeys.search({ q: debouncedQuery, ...fetchParams });
        }
        if (category) return queryKeys.category(category, fetchParams);
        if (clientPipeline) {
            return queryKeys.catalog(fetchParams.sortBy, fetchParams.order);
        }
        return queryKeys.products(fetchParams);
    }, [debouncedQuery, category, clientPipeline, fetchParams]);

    const queryFn = useCallback(
        ({ signal }) => {
            if (debouncedQuery) {
                return productsApi.searchProducts({
                    q: debouncedQuery,
                    ...fetchParams,
                    signal,
                });
            }
            if (category) {
                return productsApi.getCategoryProducts(category, {
                    ...fetchParams,
                    signal,
                });
            }
            if (clientPipeline) {
                return productsApi.getCatalog({ sortBy, order, signal });
            }
            return productsApi.getProducts({ ...fetchParams, signal });
        },
        [debouncedQuery, category, clientPipeline, fetchParams, sortBy, order],
    );

    const {
        data,
        error,
        isPending,
        isFetching,
        isPlaceholderData,
        refetch,
    } = useQuery({
        queryKey,
        queryFn,
        enabled: !categoryMissing,
        placeholderData: keepPreviousData,
    });

    /* ---------------- Derive results ---------------- */
    const filtered = useMemo(() => {
        if (!data) return null;
        let items = data.products;
        // Search inside a category: the category endpoint cannot do it, and
        // this pipeline already fetched the (small) full category.
        if (category && debouncedQuery) {
            const needle = debouncedQuery.toLowerCase();
            items = items.filter(
                (product) =>
                    String(product.title ?? "").toLowerCase().includes(needle) ||
                    String(product.description ?? "")
                        .toLowerCase()
                        .includes(needle),
            );
        }
        if (debouncedPrice.min !== null) {
            items = items.filter(
                (product) => Number(product.price) >= debouncedPrice.min,
            );
        }
        if (debouncedPrice.max !== null) {
            items = items.filter(
                (product) => Number(product.price) <= debouncedPrice.max,
            );
        }
        return items;
    }, [data, category, debouncedQuery, debouncedPrice]);

    const total = data
        ? clientPipeline
            ? (filtered?.length ?? 0)
            : data.total
        : 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const effectivePage = Math.min(page, totalPages);
    const products = !data
        ? []
        : clientPipeline
            ? (filtered ?? []).slice(
                  (effectivePage - 1) * PAGE_SIZE,
                  effectivePage * PAGE_SIZE,
              )
            : data.products;

    const resultStart = total === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
    const resultEnd = Math.min(effectivePage * PAGE_SIZE, total);

    /* ---------------- URL mutation helpers ---------------- */
    const updateParams = useCallback(
        (patch, { replace = false } = {}) => {
            setSearchParams(
                (previous) => {
                    const next = new URLSearchParams(previous);
                    for (const [key, value] of Object.entries(patch)) {
                        if (value === null || value === undefined || value === "") {
                            next.delete(key);
                        } else {
                            next.set(key, String(value));
                        }
                    }
                    return next;
                },
                { replace },
            );
        },
        [setSearchParams],
    );

    const handleQueryChange = (value) =>
        updateParams({ q: value || null, page: null }, { replace: true });

    const handlePriceChange = ({ min, max }) =>
        updateParams(
            { min: min || null, max: max || null, page: null },
            { replace: true },
        );

    const handleSortChange = (value) =>
        updateParams({
            sort: value === DEFAULT_SORT ? null : value,
            page: null,
        });

    const handlePageChange = (value) =>
        updateParams({ page: value > 1 ? value : null });

    const handleSelectCategory = (slug) => {
        const next = new URLSearchParams();
        if (sort !== DEFAULT_SORT) next.set("sort", sort);
        if (qRaw) next.set("q", qRaw);
        if (minRaw) next.set("min", minRaw);
        if (maxRaw) next.set("max", maxRaw);
        const queryString = next.toString();
        setFiltersOpen(false);
        navigate({
            pathname: slug ? `/shop/${slug}` : "/shop",
            search: queryString ? `?${queryString}` : "",
        });
    };

    const clearAll = () => {
        setFiltersOpen(false);
        if (category) {
            navigate({
                pathname: "/shop",
                search: sort !== DEFAULT_SORT ? `?sort=${sort}` : "",
            });
        } else {
            updateParams({ q: null, min: null, max: null, page: null });
        }
    };

    /* Recover from an out-of-range page once the real total is known
     * (e.g. a shared link whose result set has since shrunk). */
    useEffect(() => {
        if (isPending || isPlaceholderData) return;
        if (total > 0 && page > totalPages) {
            updateParams(
                { page: totalPages > 1 ? totalPages : null },
                { replace: true },
            );
        }
    }, [isPending, isPlaceholderData, total, page, totalPages, updateParams]);

    /* Page changes scroll back to the top of the results, not the document
     * top — the user keeps their surrounding context. */
    const resultsRef = useRef(null);
    const previousPageRef = useRef(page);
    useEffect(() => {
        if (previousPageRef.current === page) return;
        previousPageRef.current = page;
        resultsRef.current?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
        });
    }, [page, reducedMotion]);

    /* ---------------- Document title (unique per view) ---------------- */
    const documentTitle = categoryMissing
        ? "Shop — unknown category"
        : query
            ? `Search results for “${query}”${
                  category ? ` in ${categoryName}` : ""
              }`
            : category
                ? `Shop — ${categoryName}`
                : "Shop — all products";
    useDocumentTitle(documentTitle, {
        description:
            "Browse and filter the YoStore catalog — search, sort, price range, and category discovery powered by the DummyJSON demo API.",
    });

    /* ---------------- States ---------------- */
    if (categoryMissing) {
        return (
            <div className="page-frame py-16 md:py-24">
                <p className="eyebrow">Category</p>
                <h1 className="mt-3 font-display text-4xl md:text-5xl text-balance-tight">
                    Shop
                </h1>
                <div className="mt-10 max-w-xl">
                    <EmptyState
                        icon={SearchX}
                        title="Category not found"
                        description={`We couldn't find a category matching “${categoryLabel(
                            category,
                        )}”. It may have been renamed or removed.`}
                        action={
                            <Link to="/shop" className="btn btn-primary">
                                Browse all products
                            </Link>
                        }
                    />
                </div>
            </div>
        );
    }

    const unknownCategory =
        category &&
        isApiError(error) &&
        error.kind === "client"; /* 404 from the category endpoint */

    const heading = query
        ? `Results for “${query}”`
        : category
            ? categoryName
            : "Shop the full edit";

    const subcopy = category
        ? `${categoryName} — part of the YoStore demo catalog.`
        : query
            ? `Matching your search${category ? ` in ${categoryName}` : ""}.`
            : "Every product in the catalog, sourced from DummyJSON's public demo API.";

    const hasActiveFilters = Boolean(
        query ||
            priceRange.min !== null ||
            priceRange.max !== null ||
            category,
    );
    const priceLabel = priceRangeLabel(priceRange);
    const countText = isPending
        ? "Loading products…"
        : total === 0
            ? "No products found"
            : `Showing ${resultStart}–${resultEnd} of ${total} ${
                  total === 1 ? "product" : "products"
              }`;

    return (
        <div className="page-frame py-10 md:py-14">
            {/* Header */}
            <header className="mb-10 max-w-2xl">
                <p className="eyebrow">
                    {query ? "Search" : category ? "Category" : "Catalog"}
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl text-balance-tight">
                    {heading}
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                    {subcopy}
                </p>
            </header>

            <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-14">
                {/* Filters */}
                <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto hide-scrollbar">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm mb-4 w-full lg:hidden"
                        aria-expanded={filtersOpen}
                        aria-controls="shop-filter-panel"
                        onClick={() => setFiltersOpen((open) => !open)}
                    >
                        <SlidersHorizontal className="size-4" aria-hidden="true" />
                        {filtersOpen ? "Hide filters" : "Show filters"}
                    </button>

                    <div
                        id="shop-filter-panel"
                        className={
                            filtersOpen ? "block" : "hidden lg:block"
                        }
                    >
                        <ProductFilters
                            query={qRaw}
                            onQueryChange={handleQueryChange}
                            categories={categories}
                            activeCategory={category ?? null}
                            onSelectCategory={handleSelectCategory}
                            price={{ min: minRaw, max: maxRaw }}
                            onPriceChange={handlePriceChange}
                            onClearAll={clearAll}
                            hasActiveFilters={hasActiveFilters}
                        />
                    </div>
                </aside>

                {/* Results */}
                <div ref={resultsRef} className="scroll-mt-28">
                    {hasActiveFilters ? (
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            <span className="eyebrow mr-1">
                                Active filters
                            </span>
                            {category ? (
                                <ActiveFilterChip
                                    label={`Category: ${categoryName}`}
                                    onRemove={() => handleSelectCategory(null)}
                                />
                            ) : null}
                            {query ? (
                                <ActiveFilterChip
                                    label={`Search: “${query}”`}
                                    onRemove={() => handleQueryChange("")}
                                />
                            ) : null}
                            {priceLabel ? (
                                <ActiveFilterChip
                                    label={priceLabel}
                                    onRemove={() =>
                                        handlePriceChange({ min: "", max: "" })
                                    }
                                />
                            ) : null}
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={clearAll}
                            >
                                Clear all
                            </button>
                        </div>
                    ) : null}

                    <div
                        className="rule-b mb-6 flex flex-wrap items-center justify-between gap-4 pb-4"
                        aria-busy={isFetching && !isPending}
                    >
                        <p
                            className="text-sm text-muted"
                            aria-live="polite"
                        >
                            {countText}
                        </p>
                        <SortSelect
                            value={sort}
                            onChange={handleSortChange}
                            options={SORT_OPTIONS}
                        />
                    </div>

                    {unknownCategory ? (
                        <EmptyState
                            icon={SearchX}
                            title="Category not found"
                            description={`We couldn't find a category matching “${categoryLabel(
                                category,
                            )}”. It may have been renamed or removed.`}
                            action={
                                <Link to="/shop" className="btn btn-primary">
                                    Browse all products
                                </Link>
                            }
                        />
                    ) : error ? (
                        <ErrorState
                            title="We couldn't load the catalog"
                            error={error}
                            onRetry={refetch}
                        />
                    ) : isPending ? (
                        <ProductGridSkeleton count={12} />
                    ) : total === 0 ? (
                        <EmptyState
                            icon={SearchX}
                            title={
                                query
                                    ? `No matches for “${query}”`
                                    : "No products found"
                            }
                            description="Nothing in the catalog matches the current search and filters. Try a broader term or clear what's applied."
                            action={
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={clearAll}
                                    >
                                        Clear filters
                                    </button>
                                    {category ? (
                                        <Link
                                            to="/shop"
                                            className="btn btn-secondary"
                                        >
                                            Browse all products
                                        </Link>
                                    ) : null}
                                </div>
                            }
                        />
                    ) : (
                        <>
                            <ProductGrid>
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        eager={page === 1 && index < 4}
                                    />
                                ))}
                            </ProductGrid>

                            <Pagination
                                page={effectivePage}
                                totalPages={totalPages}
                                onChange={handlePageChange}
                                disabled={isFetching && !isPlaceholderData}
                                className="mt-12"
                            />

                            <p className="mt-10 text-xs text-muted">
                                Product data comes from DummyJSON, a public
                                demo API. YoStore is a frontend demonstration —
                                no real orders are placed here.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
