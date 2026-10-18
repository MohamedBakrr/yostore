import { Search, X } from "lucide-react";

/**
 * Shop filter panel: debounced-search input, category chips, price range, and
 * a clear-all action. The component is fully controlled — every value comes
 * from the URL search params and every change is routed back through the page,
 * so filters stay shareable and refresh-safe (SPEC §10).
 *
 * Selecting a category navigates to `/shop/:slug` rather than toggling a local
 * flag, so the path (not panel state) remains the source of truth.
 */
export default function ProductFilters({
    query = "",
    onQueryChange,
    categories = [],
    activeCategory = null,
    onSelectCategory,
    price = { min: "", max: "" },
    onPriceChange,
    onClearAll,
    hasActiveFilters = false,
    className = "",
}) {
    const chipClass = (active) =>
        `chip min-h-9 transition-colors ${
            active
                ? "border-ink bg-ink text-paper"
                : "hover:border-ink hover:text-ink"
        }`;

    return (
        <div className={`card-flat flex flex-col gap-7 p-6 ${className}`}>
            {/* Search */}
            <div>
                <label htmlFor="shop-search" className="field-label">
                    Search products
                </label>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                    />
                    <input
                        id="shop-search"
                        type="search"
                        className="field pl-10"
                        placeholder="Search the catalog…"
                        autoComplete="off"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                    />
                </div>
            </div>

            {/* Category */}
            <fieldset>
                <legend className="field-label">Category</legend>
                <ul className="flex flex-wrap gap-2" role="list">
                    <li>
                        <button
                            type="button"
                            className={chipClass(activeCategory === null)}
                            aria-pressed={activeCategory === null}
                            onClick={() => onSelectCategory(null)}
                        >
                            All products
                        </button>
                    </li>
                    {categories.map((category) => (
                        <li key={category.slug}>
                            <button
                                type="button"
                                className={chipClass(
                                    activeCategory === category.slug,
                                )}
                                aria-pressed={activeCategory === category.slug}
                                onClick={() => onSelectCategory(category.slug)}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </fieldset>

            {/* Price range */}
            <div>
                <p className="field-label">Price range (USD)</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="shop-price-min" className="sr-only">
                            Minimum price in dollars
                        </label>
                        <input
                            id="shop-price-min"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="any"
                            className="field"
                            placeholder="Min"
                            value={price.min}
                            onChange={(event) =>
                                onPriceChange({
                                    min: event.target.value,
                                    max: price.max,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label htmlFor="shop-price-max" className="sr-only">
                            Maximum price in dollars
                        </label>
                        <input
                            id="shop-price-max"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="any"
                            className="field"
                            placeholder="Max"
                            value={price.max}
                            onChange={(event) =>
                                onPriceChange({
                                    min: price.min,
                                    max: event.target.value,
                                })
                            }
                        />
                    </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                    Invalid ranges are corrected automatically.
                </p>
            </div>

            {/* Clear all */}
            {hasActiveFilters ? (
                <button
                    type="button"
                    className="btn btn-ghost btn-sm self-start"
                    onClick={onClearAll}
                >
                    <X className="size-4" aria-hidden="true" />
                    Clear all filters
                </button>
            ) : null}
        </div>
    );
}
