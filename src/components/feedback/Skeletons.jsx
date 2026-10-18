/** Shimmering placeholder blocks (see `.skeleton` in styles/main.css). */

export function SkeletonBlock({ className = "" }) {
    return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Single product card placeholder. */
export function ProductSkeleton() {
    return (
        <div>
            <SkeletonBlock className="aspect-4/5 w-full" />
            <SkeletonBlock className="mt-4 h-3 w-1/3" />
            <SkeletonBlock className="mt-2.5 h-4 w-3/4" />
            <SkeletonBlock className="mt-2 h-3.5 w-1/2" />
        </div>
    );
}

/** Grid of product placeholders matching ProductGrid columns. */
export function ProductGridSkeleton({ count = 8 }) {
    return (
        <div
            className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
            role="status"
            aria-label="Loading products"
        >
            {Array.from({ length: count }, (_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}

/** Row placeholder for list/search results. */
export function RowSkeleton() {
    return (
        <div className="flex items-center gap-4 border-b border-hair py-4">
            <SkeletonBlock className="size-16 shrink-0" />
            <div className="flex-1">
                <SkeletonBlock className="h-3.5 w-2/3" />
                <SkeletonBlock className="mt-2 h-3 w-1/4" />
            </div>
        </div>
    );
}

/** Generic content placeholder for lazy route fallbacks. */
export function PageSkeleton() {
    return (
        <div
            className="page-frame py-16"
            role="status"
            aria-label="Loading page"
        >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-6 h-10 w-full max-w-xl" />
            <SkeletonBlock className="mt-4 h-4 w-full max-w-lg" />
            <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonBlock key={i} className="aspect-4/5" />
                ))}
            </div>
        </div>
    );
}

export default ProductSkeleton;
