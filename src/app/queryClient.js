import { QueryClient } from "@tanstack/react-query";
import { ERROR_KINDS } from "../utils/apiErrors";

/**
 * Shared TanStack Query client.
 *
 * Retry policy: only transient failures (network / timeout / 5xx) retry,
 * at most twice. 4xx client errors and malformed payloads never retry —
 * retrying a permanent error only delays the recovery UI.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (!error?.retryable) return false;
                return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
        },
    },
});

/** Factory for isolated clients (tests). */
export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    if (!error?.retryable) return false;
                    return failureCount < 2;
                },
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
            },
        },
    });
}

export const queryKeys = {
    products: (params) => ["products", params],
    search: (params) => ["products", "search", params],
    category: (slug, params) => ["products", "category", slug, params],
    product: (id) => ["product", id],
    related: (categoryId, excludeId) => [
        "products",
        "related",
        categoryId,
        excludeId,
    ],
    catalog: (sortBy, order) => ["products", "catalog", { sortBy, order }],
    categories: ["categories"],
};

export { ERROR_KINDS };
