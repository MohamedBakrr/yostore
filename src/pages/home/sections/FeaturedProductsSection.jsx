import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import ProductCard from "../../../components/products/ProductCard";
import ProductGrid from "../../../components/products/ProductGrid";
import ErrorState from "../../../components/feedback/ErrorState";
import EmptyState from "../../../components/feedback/EmptyState";
import { ProductGridSkeleton } from "../../../components/feedback/Skeletons";
import { useTopRatedProducts } from "../hooks/useHomeData";
import Reveal from "../Reveal";

const FEATURED_COUNT = 8;

/**
 * Featured products: a deterministic top-rated pick rendered with the shared
 * card/grid. Loading (skeleton), error (retry), and empty (escape hatch) are
 * all first-class states; hover-only affordances live inside ProductCard and
 * remain keyboard/touch reachable there.
 */
export default function FeaturedProductsSection() {
    const { data, isPending, isError, error, refetch } = useTopRatedProducts();
    const products = (
        Array.isArray(data?.products) ? data.products : []
    ).slice(0, FEATURED_COUNT);

    return (
        <section
            aria-labelledby="featured-heading"
            className="bg-sunken"
        >
            <div className="page-frame py-16 md:py-24">
                <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p className="eyebrow">Featured — highest rated</p>
                        <h2
                            id="featured-heading"
                            className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-5xl"
                        >
                            The eight pieces reviewers rate highest.
                        </h2>
                    </div>
                    <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end lg:text-right">
                        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
                            A deterministic pick from the demo catalog: sorted
                            by rating, taken straight from the first page.
                            Quick add, quick view and wishlist live on every
                            card.
                        </p>
                        <Link
                            to="/shop"
                            className="link-underline text-sm font-semibold"
                        >
                            View all products
                            <ArrowRight
                                className="ml-1 inline size-4"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </Reveal>

                <div className="mt-10 border-t border-hair pt-10">
                    {isPending ? (
                        <ProductGridSkeleton count={FEATURED_COUNT} />
                    ) : isError ? (
                        <ErrorState
                            title="Products failed to load"
                            error={error}
                            onRetry={refetch}
                        />
                    ) : products.length === 0 ? (
                        <EmptyState
                            title="No featured products yet"
                            description="The catalog returned an empty page this visit — the full shop is still one click away."
                            action={
                                <Link to="/shop" className="btn btn-secondary">
                                    Browse the shop
                                </Link>
                            }
                        />
                    ) : (
                        <ProductGrid>
                            {products.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    eager={index < 4}
                                />
                            ))}
                        </ProductGrid>
                    )}
                </div>
            </div>
        </section>
    );
}
