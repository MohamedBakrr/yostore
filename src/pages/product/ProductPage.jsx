import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, PackageOpen } from "lucide-react";

import { productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { isApiError } from "../../utils/apiErrors";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import { recentRepository } from "../../repositories/recentRepository";
import { demoProductsRepository } from "../../repositories/demoProductsRepository";
import ProductCard from "../../components/products/ProductCard";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import { SkeletonBlock } from "../../components/feedback/Skeletons";
import RelatedProducts from "../../components/products/RelatedProducts";
import ProductDetails from "./ProductDetails";

const PRODUCT_ID_PATTERN = /^\d+$/;

function ProductNotFoundState() {
    return (
        <div className="page-frame py-16 md:py-24">
            <h1 className="sr-only">Product not found</h1>
            <div className="mx-auto max-w-xl">
                <EmptyState
                    icon={Package}
                    title="Product not found"
                    description="That product link isn't valid — product addresses use a numeric id, and this one doesn't. It may have been truncated or mistyped."
                    action={
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link to="/shop" className="btn btn-primary">
                                Browse the shop
                            </Link>
                            <Link to="/" className="btn btn-secondary">
                                Back home
                            </Link>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

function ProductUnavailableState() {
    return (
        <div className="page-frame py-16 md:py-24">
            <h1 className="sr-only">Product unavailable</h1>
            <div className="mx-auto max-w-xl">
                <EmptyState
                    icon={PackageOpen}
                    title="This product is no longer available"
                    description="It may have been removed from the demo catalog, or the link points to a product that no longer exists."
                    action={
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link to="/shop" className="btn btn-primary">
                                Browse the shop
                            </Link>
                            <Link to="/" className="btn btn-secondary">
                                Back home
                            </Link>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

function ProductLoadingState() {
    return (
        <div
            className="page-frame py-10 md:py-14"
            role="status"
            aria-label="Loading product"
        >
            <SkeletonBlock className="h-4 w-52" />
            <div className="mt-8 grid gap-10 lg:grid-cols-2 xl:gap-16">
                <SkeletonBlock className="aspect-square w-full" />
                <div>
                    <SkeletonBlock className="h-3.5 w-28" />
                    <SkeletonBlock className="mt-4 h-9 w-3/4" />
                    <SkeletonBlock className="mt-3 h-4 w-36" />
                    <SkeletonBlock className="mt-6 h-7 w-44" />
                    <SkeletonBlock className="mt-6 h-4 w-full" />
                    <SkeletonBlock className="mt-2.5 h-4 w-11/12" />
                    <SkeletonBlock className="mt-2.5 h-4 w-2/3" />
                    <SkeletonBlock className="mt-8 h-12 w-full" />
                </div>
            </div>
        </div>
    );
}

function RecentlyViewedRail({ products }) {
    if (products.length === 0) return null;

    return (
        <section
            aria-labelledby="recently-viewed-heading"
            className="rule-t py-14 md:py-16"
        >
            <h2
                id="recently-viewed-heading"
                className="mb-8 font-display text-2xl md:text-3xl text-balance-tight"
            >
                Recently viewed
            </h2>
            <ul
                className="hide-scrollbar flex snap-x gap-6 overflow-x-auto pb-2"
                role="list"
            >
                {products.map((product) => (
                    <li
                        key={product.id}
                        className="w-56 shrink-0 snap-start"
                    >
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

/**
 * Product detail route — `/product/:id` (SPEC §10).
 *
 * The id must be numeric; anything else renders the not-found view without an
 * API call. After a 404 the local admin demo repository is consulted, because
 * locally created products (ids ≥ 900001) exist only in this browser. Every
 * successful view is recorded for the recently-viewed rail.
 */
export default function ProductPage() {
    const { id } = useParams();
    const validId = PRODUCT_ID_PATTERN.test(id ?? "");

    const { data, error, refetch } = useQuery({
        queryKey: queryKeys.product(id ?? "invalid"),
        queryFn: ({ signal }) => productsApi.getProduct(id, { signal }),
        enabled: validId,
        staleTime: 10 * 60 * 1000, // product detail: 10 min (SPEC §7.3)
    });

    // Locally created demo products are not on DummyJSON — a 404 here means
    // "check the browser's own admin repository" before giving up.
    const localFallback = useMemo(() => {
        if (!validId) return null;
        if (isApiError(error) && error.kind === "client") {
            return demoProductsRepository.getById(id);
        }
        return null;
    }, [validId, error, id]);

    // Merge any local admin edits over the API record; returns null when an
    // API product was deleted in the local demo overlay.
    const product = useMemo(() => {
        if (!validId) return null;
        if (data) return demoProductsRepository.applyOne(data);
        return localFallback;
    }, [validId, data, localFallback]);

    const recentlyViewed = useRecentlyViewed({
        excludeId: validId ? id : null,
    });

    const viewedId = product?.id ?? null;
    useEffect(() => {
        if (viewedId === null) return;
        recentRepository.add(viewedId);
    }, [viewedId]);

    const notFound = !validId;
    // A 404 with no local record means the product genuinely isn't available.
    const unavailable =
        product === null &&
        isApiError(error) &&
        error.kind === "client";

    useDocumentTitle(product?.title ?? (notFound ? "Product not found" : "Product"), {
        description: product?.description
            ? product.description.slice(0, 160)
            : "Product details on YoStore — a frontend-only demo storefront powered by the DummyJSON public API.",
    });

    if (notFound) return <ProductNotFoundState />;
    if (product) {
        return (
            <div className="page-frame py-10 md:py-14">
                <ProductDetails key={product.id} product={product} />
                <RelatedProducts
                    category={product.category}
                    excludeId={product.id}
                />
                <RecentlyViewedRail products={recentlyViewed} />
            </div>
        );
    }
    // Data arrived but merged to null: deleted in the local demo overlay.
    if (data && product === null) return <ProductUnavailableState />;
    if (unavailable) return <ProductUnavailableState />;
    if (error) return (
        <div className="page-frame py-16 md:py-24">
            <h1 className="sr-only">We couldn't load this product</h1>
            <div className="mx-auto max-w-xl">
                <ErrorState
                    title="We couldn't load this product"
                    error={error}
                    onRetry={refetch}
                />
                <div className="mt-4 flex justify-center">
                    <Link to="/shop" className="btn btn-secondary btn-sm">
                        Back to the shop
                    </Link>
                </div>
            </div>
        </div>
    );

    return <ProductLoadingState />;
}
