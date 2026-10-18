/**
 * Sort order control for the shop toolbar. A native select keeps the control
 * fully keyboard- and screen-reader-accessible with zero extra machinery.
 * Options carry the `{ sortBy, order }` mapping consumed by the shop page.
 */
export default function SortSelect({
    value,
    onChange,
    options = [],
    className = "",
}) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <label htmlFor="shop-sort" className="field-label mb-0 whitespace-nowrap">
                Sort
            </label>
            <select
                id="shop-sort"
                className="field w-auto py-2 pr-9 text-sm"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
