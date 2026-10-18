import { Star } from "lucide-react";

const SIZES = { sm: "size-3.5", md: "size-4" };

/**
 * Compact rating readout. DummyJSON supplies a numeric `rating`; there is no
 * review collection behind it, so no review count is invented.
 */
export default function RatingDisplay({ value, size = "sm", className = "" }) {
    const rating = Number(value);

    if (!Number.isFinite(rating) || rating <= 0) {
        return (
            <span className={`text-xs text-muted ${className}`}>
                No rating yet
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            <Star
                className={`${SIZES[size] ?? SIZES.sm} fill-accent text-accent`}
                aria-hidden="true"
            />
            <span className="text-xs font-semibold text-ink">
                {rating.toFixed(1)}
            </span>
            <span className="sr-only">
                Rated {rating.toFixed(1)} out of 5
            </span>
        </span>
    );
}
