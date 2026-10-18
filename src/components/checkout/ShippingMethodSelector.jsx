import { Check } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { selectCartItems, selectCouponCode } from "../../store/cartSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { formatCurrency } from "../../utils/formatting";
import { computeTotals, SHIPPING_METHODS } from "../../utils/pricing";

/**
 * Step 2 — shipping method radio cards. Costs shown per option come from
 * `computeTotals()` with the live cart + coupon, so the free-over rule and
 * promo interactions are always truthful; nothing is hardcoded twice.
 */
export default function ShippingMethodSelector({ value, onChange }) {
    const items = useAppSelector(selectCartItems);
    const couponCode = useAppSelector(selectCouponCode);
    const totals = useCartTotals();

    return (
        <fieldset>
            <legend className="field-label">Choose a shipping method</legend>
            <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                    const cost = computeTotals({
                        items,
                        couponCode,
                        shippingMethodId: method.id,
                    }).shipping;
                    const checked = value === method.id;

                    return (
                        <label
                            key={method.id}
                            className={`flex cursor-pointer items-start gap-3.5 border px-4 py-4 transition-colors ${
                                checked
                                    ? "border-accent bg-accent-tint"
                                    : "border-hair bg-surface hover:border-hair-strong"
                            }`}
                        >
                            <input
                                type="radio"
                                name="shipping-method"
                                value={method.id}
                                checked={checked}
                                onChange={() => onChange(method.id)}
                                className="mt-1 size-4 shrink-0 accent-accent"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                    <span className="font-display text-base font-semibold text-ink">
                                        {method.name}
                                        {checked ? (
                                            <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-accent">
                                                Selected
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="text-sm font-semibold tabular-nums text-ink">
                                        {cost === 0 ? "Free" : formatCurrency(cost)}
                                        <span className="sr-only">
                                            {cost === 0 ? " (free)" : ""}
                                        </span>
                                    </span>
                                </span>
                                <span className="mt-1 block text-sm text-muted">
                                    {method.description}
                                </span>
                                <span className="mt-1.5 block text-xs text-muted">
                                    Delivery window: {method.etaMin}–
                                    {method.etaMax} business days.
                                    {method.freeOver != null
                                        ? ` Free over ${formatCurrency(
                                              method.freeOver,
                                          )} on your merchandise total after discounts.`
                                        : ""}
                                </span>
                            </span>
                            {checked ? (
                                <Check
                                    className="mt-1 size-4 shrink-0 text-accent"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </label>
                    );
                })}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
                Current merchandise total:{" "}
                <span className="font-semibold tabular-nums text-ink-soft">
                    {formatCurrency(totals.merchandiseTotal)}
                </span>
                . Delivery windows are demo estimates — no carrier is connected.
            </p>
        </fieldset>
    );
}
