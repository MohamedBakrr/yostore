/**
 * Responsive product grid. Children are usually <ProductCard /> elements, but
 * skeletons or custom items can be mixed in while keeping column rhythm.
 */
export default function ProductGrid({ children, className = "" }) {
    return (
        <div
            className={`grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4 ${className}`}
        >
            {children}
        </div>
    );
}
