import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../../services";
import { queryKeys } from "../../../app/queryClient";

/**
 * Shared home-page queries.
 *
 * Every section that needs the same slice of the catalog uses the same query
 * key, so the landing page issues one request per dataset (top-rated, sale
 * pool) no matter how many sections read it.
 */

export const TOP_RATED_PARAMS = { page: 1, limit: 12, sortBy: "rating", order: "desc" };
export const SALE_POOL_PARAMS = { page: 1, limit: 24 };

/** Top-rated page — hero imagery, featured grid, and both campaign bands. */
export function useTopRatedProducts() {
    return useQuery({
        queryKey: queryKeys.products(TOP_RATED_PARAMS),
        queryFn: ({ signal }) => productsApi.getProducts({ ...TOP_RATED_PARAMS, signal }),
    });
}

/** A wider default-ordered page the curation rail ranks locally (no catalog sweep). */
export function useSalePool() {
    return useQuery({
        queryKey: queryKeys.products(SALE_POOL_PARAMS),
        queryFn: ({ signal }) => productsApi.getProducts({ ...SALE_POOL_PARAMS, signal }),
    });
}

/**
 * Deterministic curation: prefer products from `preferredCategories`, then
 * fill from the rest of the fetched page. Never invents data — only reorders
 * what the API already returned.
 */
export function pickProducts(products, preferredCategories, count) {
    const pool = Array.isArray(products) ? products : [];
    const primary = preferredCategories
        .map((category) => pool.find((product) => product.category === category))
        .filter(Boolean);
    const usedIds = primary.map((product) => product.id);
    const fillers = pool.filter((product) => !usedIds.includes(product.id));
    return [...primary, ...fillers].slice(0, count);
}

/** Biggest live discount first, rating as the tie-breaker. */
export function rankByDiscount(products, count) {
    const pool = Array.isArray(products) ? products : [];
    return [...pool]
        .sort((a, b) => {
            const discountDelta =
                (Number(b.discountPercentage) || 0) - (Number(a.discountPercentage) || 0);
            if (discountDelta !== 0) return discountDelta;
            return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        })
        .slice(0, count);
}

/** Preferred collection slugs first, then whatever the API returned, capped. */
export function selectCollectionSlugs(categories, preferredSlugs, count) {
    const all = Array.isArray(categories) ? categories : [];
    const preferred = preferredSlugs.filter((slug) =>
        all.some((category) => category.slug === slug),
    );
    const rest = all
        .map((category) => category.slug)
        .filter((slug) => !preferred.includes(slug));
    return [...preferred, ...rest].slice(0, count);
}
