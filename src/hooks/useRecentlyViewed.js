import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { recentRepository } from "../repositories/recentRepository";
import { productsApi } from "../services";
import { queryKeys } from "../app/queryClient";

/**
 * Recently viewed products (persisted ids, newest first).
 * Products that no longer exist resolve to an error and are filtered out, so
 * a removed product never breaks the rail.
 */
export function useRecentlyViewed({ excludeId = null, limit = 6 } = {}) {
    const ids = useMemo(
        () => recentRepository.ids(excludeId).slice(0, limit),
        [excludeId, limit],
    );

    const results = useQueries({
        queries: ids.map((id) => ({
            queryKey: queryKeys.product(id),
            queryFn: ({ signal }) => productsApi.getProduct(id, { signal }),
            staleTime: 5 * 60 * 1000,
            retry: false,
        })),
    });

    return results
        .filter((result) => result.data)
        .map((result) => result.data);
}

export default useRecentlyViewed;
