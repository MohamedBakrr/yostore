import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

/**
 * Trail breadcrumbs for the product detail page.
 * The final crumb is the current page (`aria-current="page"`), not a link.
 */
export default function Breadcrumbs({ items = [] }) {
    if (items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li
                            key={`${item.label}-${index}`}
                            className="flex items-center gap-2"
                        >
                            {index > 0 ? (
                                <ChevronRight
                                    className="size-3 shrink-0"
                                    aria-hidden="true"
                                />
                            ) : null}
                            {item.to && !isLast ? (
                                <Link
                                    to={item.to}
                                    className="transition-colors hover:text-ink"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={isLast ? "text-ink" : undefined}
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
