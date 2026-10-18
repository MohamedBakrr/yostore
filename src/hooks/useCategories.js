import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../services";
import { queryKeys } from "../app/queryClient";

/** Category tree for nav menus, sidebars, and filter panels. */
export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: ({ signal }) => categoriesApi.getCategories({ signal }),
        staleTime: 30 * 60 * 1000,
    });
}

export default useCategories;
