import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    removeCoupon,
    selectCartItems,
    selectCouponCode,
    setShippingMethod,
} from "../../store/cartSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { useToast } from "../../providers/ToastProvider";
import { formatCurrency } from "../../utils/formatting";
import { computeTotals, SHIPPING_METHODS } from "../../utils/pricing";
import TotalsBreakdown from "./TotalsBreakdown";

const STANDARD_FREE_OVER =
    SHIPPING_METHODS.find((m) => m.id === "standard")?.freeOver ?? 100;

/**
 * Sticky order summary for the cart page. Every number is read from
 * `useCartTotals()` or per-method `computeTotals()` calls — no inline money
 * math. Includes a compact shipping selector so the shipping line always
 * reflects the chosen `SHIPPING_METHODS` option.
 */
export default function CartSummary() {
    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const totals = useCartTotals();
    const items = useAppSelector(selectCartItems);
    const couponCode = useAppSelector(selectCouponCode);

    // Effective cost per method with the current cart + coupon applied.
    const methodOptions = SHIPPING_METHODS.map((method) => ({
        method,
        cost: computeTotals({
            items,
            couponCode,
            shippingMethodId: method.id,
        }).shipping,
    }));

    const progress = Math.min(
        100,
        (totals.merchandiseTotal / STANDARD_FREE_OVER) * 100,
    );
    const remaining = Math.max(0, STANDARD_FREE_OVER - totals.merchandiseTotal);

    const handleMethodChange = (event) => {
        const option = methodOptions.find(
            (o) => o.method.id === event.target.value,
        );
        if (!option) return;
        dispatch(setShippingMethod(option.method.id));
        notify(
            `Shipping set to ${option.method.name} — ${
                option.cost === 0 ? "free" : formatCurrency(option.cost)
            }, ${option.method.etaMin}–${option.method.etaMax} business days.`,
            "info",
        );
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        notify("Promo code removed.", "info");
    };

    return (
        <aside aria-labelledby="cart-summary-title" className="card-flat lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between gap-3 border-b border-hair px-5 py-4">
                <h2 id="cart-summary-title" className="font-display text-xl">
                    Order summary
                </h2>
                <p className="text-xs text-muted tabular-nums">
                    {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
                </p>
            </div>

            <div className="border-b border-hair px-5 py-4">
                {/* Free-standard-shipping progress (same rule as the drawer). */}
                <div>
                    <div
                        className="h-1 w-full bg-sunken"
                        role="img"
                        aria-label={`${Math.round(progress)}% toward free standard shipping`}
                    >
                        <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                        {remaining > 0 ? (
                            <>
                                Add{" "}
                                <strong className="font-semibold text-ink">
                                    {formatCurrency(remaining)}
                                </strong>{" "}
                                for free standard shipping.
                            </>
                        ) : (
                            "Free standard shipping unlocked."
                        )}
                    </p>
                </div>

                <div className="mt-4">
                    <label htmlFor="cart-shipping-method" className="field-label">
                        Shipping method
                    </label>
                    <select
                        id="cart-shipping-method"
                        className="field"
                        value={totals.shippingMethod}
                        onChange={handleMethodChange}
                    >
                        {methodOptions.map(({ method, cost }) => (
                            <option key={method.id} value={method.id}>
                                {method.name} —{" "}
                                {cost === 0 ? "Free" : formatCurrency(cost)} ·{" "}
                                {method.etaMin}–{method.etaMax} days
                            </option>
                        ))}
                    </select>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                        Standard is free over{" "}
                        {formatCurrency(STANDARD_FREE_OVER)} after discounts.
                        Full details in{" "}
                        <Link to="/shipping" className="link-underline font-semibold">
                            shipping &amp; delivery
                        </Link>
                        .
                    </p>
                </div>
            </div>

            <div className="px-5 py-4">
                <TotalsBreakdown totals={totals} onRemoveCoupon={handleRemoveCoupon} />
                <Link to="/checkout" className="btn btn-primary btn-block mt-5">
                    Proceed to checkout
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link to="/shop" className="btn btn-secondary btn-block mt-2.5">
                    Continue shopping
                </Link>
                <p className="mt-3 text-center text-xs text-muted">
                    Demo storefront — no payment is taken and nothing ships.
                </p>
            </div>
        </aside>
    );
}
