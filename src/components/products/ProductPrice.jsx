import { formatCurrency } from "../../utils/formatting";
import { unitPriceFor } from "../../utils/pricing";

const SIZES = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
};

/**
 * Canonical price display: discounted unit price prominent, list price struck
 * through when a discount applies. Never rounds differently from cart totals.
 */
export default function ProductPrice({
    price,
    discountPercentage = 0,
    size = "md",
    showOriginal = true,
    className = "",
}) {
    const hasDiscount = Number(discountPercentage) > 0;
    const unit = unitPriceFor(price, discountPercentage);

    return (
        <span
            className={`inline-flex items-baseline gap-2 ${SIZES[size] ?? SIZES.md} ${className}`}
        >
            <span
                className={`font-semibold ${hasDiscount ? "text-accent" : "text-ink"}`}
            >
                {formatCurrency(unit)}
            </span>
            {hasDiscount && showOriginal ? (
                <s className="text-xs font-normal text-muted">
                    {formatCurrency(price)}
                </s>
            ) : null}
        </span>
    );
}
