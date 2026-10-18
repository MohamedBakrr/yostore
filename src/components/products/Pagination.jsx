import { ChevronLeft, ChevronRight } from "lucide-react";

/** Window of page numbers with leading/trailing gaps: 1 … 4 5 6 … 20 */
function pageItems(page, totalPages) {
    const items = [];
    const add = (n) => items.push(n);
    const gap = () => items.push(null);

    if (totalPages <= 7) {
        for (let n = 1; n <= totalPages; n += 1) add(n);
        return items;
    }

    add(1);
    if (page > 3) gap();
    for (
        let n = Math.max(2, page - 1);
        n <= Math.min(totalPages - 1, page + 1);
        n += 1
    ) {
        add(n);
    }
    if (page < totalPages - 2) gap();
    add(totalPages);
    return items;
}

/** Accessible pagination control used by the shop and category listings. */
export default function Pagination({
    page,
    totalPages,
    onChange,
    disabled = false,
    className = "",
}) {
    if (!Number.isFinite(page) || !Number.isFinite(totalPages) || totalPages <= 1) {
        return null;
    }

    const current = Math.min(Math.max(page, 1), totalPages);

    const goTo = (next) => (event) => {
        event.preventDefault();
        if (disabled || next === current) return;
        onChange(Math.min(Math.max(next, 1), totalPages));
    };

    return (
        <nav
            aria-label="Pagination"
            className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
        >
            <button
                type="button"
                className="icon-btn border border-hair"
                onClick={goTo(current - 1)}
                disabled={disabled || current <= 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="size-4" aria-hidden="true" />
            </button>

            {pageItems(current, totalPages).map((item, index) =>
                item === null ? (
                    <span
                        key={`gap-${index}`}
                        className="px-1.5 text-sm text-muted"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={goTo(item)}
                        disabled={disabled}
                        aria-current={item === current ? "page" : undefined}
                        aria-label={`Page ${item}`}
                        className={[
                            "h-10 min-w-10 border px-2 text-sm transition-colors",
                            item === current
                                ? "border-ink bg-ink font-semibold text-paper"
                                : "border-hair text-ink-soft hover:border-ink hover:text-ink",
                            disabled ? "opacity-50" : "",
                        ].join(" ")}
                    >
                        {item}
                    </button>
                ),
            )}

            <button
                type="button"
                className="icon-btn border border-hair"
                onClick={goTo(current + 1)}
                disabled={disabled || current >= totalPages}
                aria-label="Next page"
            >
                <ChevronRight className="size-4" aria-hidden="true" />
            </button>
        </nav>
    );
}
