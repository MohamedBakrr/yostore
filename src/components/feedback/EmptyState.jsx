/**
 * Empty state used for zero-result searches, empty carts, and empty lists.
 * Always offers a next step — never a dead end.
 */
export default function EmptyState({
    icon: Icon = null,
    title,
    description = null,
    action = null,
    compact = false,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center border border-dashed border-hair-strong bg-surface text-center ${compact ? "px-5 py-9" : "px-6 py-16"} ${className}`}
        >
            {Icon ? (
                <Icon
                    className={`mb-4 text-muted ${compact ? "size-5" : "size-7"}`}
                    aria-hidden="true"
                />
            ) : null}
            <h2
                className={`mb-1.5 font-display text-balance-tight ${compact ? "text-lg" : "text-2xl"}`}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={`mb-5 max-w-sm text-muted ${compact ? "text-xs" : "text-sm leading-relaxed"}`}
                >
                    {description}
                </p>
            ) : (
                <div className="mb-5" />
            )}
            {action}
        </div>
    );
}
