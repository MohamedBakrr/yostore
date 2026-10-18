import { useQueries } from "@tanstack/react-query";
import { useAppSelector } from "../../store/hooks";
import { selectWishlistIds } from "../../store/wishlistSlice";
import { productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { demoProductsRepository } from "../../repositories/demoProductsRepository";
import { isApiError } from "../../utils/apiErrors";

/**
 * Resolves every saved wishlist id to a product with parallel requests.
 *
 * - Locally created admin products (ids ≥ 900001) are not on DummyJSON, so a
 *   404 falls back to the local overlay (CONVENTIONS §4).
 * - Ids that genuinely cannot be resolved are reported as `missingIds`
 *   instead of crashing or spinning forever, so the page can offer removal.
 */
export function useWishlistProducts() {
    const ids = useAppSelector(selectWishlistIds);

    const results = useQueries({
        queries: ids.map((id) => ({
            queryKey: queryKeys.product(id),
            queryFn: async ({ signal }) => {
                try {
                    return await productsApi.getProduct(id, { signal });
                } catch (error) {
                    if (isApiError(error) && error.status === 404) {
                        const local = demoProductsRepository.getById(id);
                        if (local) return local;
                    }
                    throw error;
                }
            },
            staleTime: 5 * 60 * 1000,
            retry: false,
        })),
    });

    const products = [];
    const missingIds = [];
    let isLoading = false;

    results.forEach((result, index) => {
        if (result.data) {
            products.push(result.data);
        } else if (result.isError) {
            missingIds.push(ids[index]);
        } else {
            isLoading = true;
        }
    });

    const refetch = () => {
        results.forEach((result) => result.refetch());
    };

    return { ids, products, missingIds, isLoading, refetch };
}

export default useWishlistProducts;
