import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import ProductCard from "./ProductCard";
import ProductGrid from "./ProductGrid";
import { ProductGridSkeleton } from "../feedback/Skeletons";
import { categoryLabel } from "./categoryLabel";

const RELATED_LIMIT = 8; // fetched — current product is filtered out client-side
const RELATED_COUNT = 4; // rendered

/**
 * "You may also like" strip for the product page: same category, current
 * product excluded (SPEC §10). The section degrades to nothing when the
 * category is unknown (locally created demo products) or the request fails —
 * it is supporting content, so it never blocks or errors the page.
 */
export default function RelatedProducts({ category, excludeId, label = null }) {
    const { data, isPending, isError } = useQuery({
        queryKey: queryKeys.related(category ?? null, excludeId ?? null),
        queryFn: ({ signal }) =>
            productsApi.getCategoryProducts(category, {
                page: 1,
                limit: RELATED_LIMIT,
                signal,
            }),
        enabled: Boolean(category),
        staleTime: 5 * 60 * 1000,
    });

    const related = (data?.products ?? [])
        .filter((product) => Number(product.id) !== Number(excludeId))
        .slice(0, RELATED_COUNT);

    if (!category || isError || (!isPending && related.length === 0)) {
        return null;
    }

    const heading = label ?? categoryLabel(category);

    return (
        <section
            aria-labelledby="related-products-heading"
            className="rule-t py-14 md:py-16"
        >
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2
                    id="related-products-heading"
                    className="font-display text-2xl md:text-3xl text-balance-tight"
                >
                    You may also like
                </h2>
                <Link
                    to={`/shop/${category}`}
                    className="link-underline text-sm"
                >
                    More in {heading}
                </Link>
            </div>

            {isPending ? (
                <ProductGridSkeleton count={4} />
            ) : (
                <ProductGrid>
                    {related.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </ProductGrid>
            )}
        </section>
    );
}
