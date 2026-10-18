import { formatCurrency } from "../../utils/formatting";
import { getShippingMethod } from "../../utils/pricing";

/**
 * One money row. Values arrive pre-formatted — this component never does math.
 */
function Row({ term, value, tone = "" }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className={tone === "gain" ? "text-success" : "text-muted"}>
                {term}
            </dt>
            <dd
                className={`tabular-nums font-medium ${
                    tone === "gain" ? "text-success" : "text-ink"
                }`}
            >
                {value}
            </dd>
        </div>
    );
}

/**
 * Canonical totals display. Every figure comes from `useCartTotals()` /
 * `computeTotals()` (or an order's stored totals snapshot) — formatting only,
 * never arithmetic. Accepts both shapes: live totals (`shippingMethod`) and
 * persisted order totals (`shippingMethodId`).
 */
export default function TotalsBreakdown({
    totals,
    onRemoveCoupon = null,
    className = "",
}) {
    const method = getShippingMethod(
        totals.shippingMethod ?? totals.shippingMethodId ?? "standard",
    );
    const showItemDiscounts = Number(totals.itemDiscounts) > 0;
    const showCoupon = Boolean(totals.coupon) && Number(totals.couponDiscount) > 0;

    return (
        <dl className={`space-y-3 text-sm ${className}`}>
            <Row
                term="Subtotal"
                value={formatCurrency(totals.subtotal)}
            />
            {showItemDiscounts ? (
                <Row
                    term="Item discounts"
                    value={`−${formatCurrency(totals.itemDiscounts)}`}
                    tone="gain"
                />
            ) : null}
            <Row
                term="Merchandise total"
                value={formatCurrency(totals.merchandiseTotal)}
            />
            {showCoupon ? (
                <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">
                        Promo {totals.coupon}
                        {onRemoveCoupon ? (
                            <button
                                type="button"
                                onClick={onRemoveCoupon}
                                className="link-underline ml-2 text-xs font-semibold text-accent"
                                aria-label={`Remove promo code ${totals.coupon}`}
                            >
                                Remove
                            </button>
                        ) : null}
                    </dt>
                    <dd className="tabular-nums font-medium text-success">
                        −{formatCurrency(totals.couponDiscount)}
                    </dd>
                </div>
            ) : null}
            <Row
                term={`Shipping — ${method.name}`}
                value={
                    Number(totals.shipping) === 0
                        ? "Free"
                        : formatCurrency(totals.shipping)
                }
            />
            <div className="rule-t flex items-baseline justify-between gap-4 pt-3">
                <dt className="font-display text-lg text-ink">Total</dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-ink">
                    {formatCurrency(totals.total)}
                </dd>
            </div>
        </dl>
    );
}
