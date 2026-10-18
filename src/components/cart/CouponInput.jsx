import { useState } from "react";
import { Check, Tag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    removeCoupon,
    selectCouponCode,
    setCoupon,
} from "../../store/cartSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { useToast } from "../../providers/ToastProvider";
import { formatCurrency } from "../../utils/formatting";
import {
    COUPONS,
    couponErrorMessage,
    validateCoupon,
} from "../../utils/pricing/coupons";
import InlineValidationError from "../feedback/InlineValidationError";

/**
 * Promo code entry. Validation runs through the shared pricing module
 * (`validateCoupon` + `couponErrorMessage`) against the live merchandise
 * total, so every rule (invalid / expired / disabled / minimum) surfaces the
 * same copy the tests assert. All promo logic is demonstration behavior.
 */
export default function CouponInput() {
    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const totals = useCartTotals();
    const couponCode = useAppSelector(selectCouponCode);
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmed = code.trim();
        if (!trimmed) {
            setError("Enter a promo code to apply.");
            return;
        }
        const result = validateCoupon(trimmed, totals.merchandiseTotal);
        if (!result.ok) {
            setError(couponErrorMessage(result));
            return;
        }
        dispatch(setCoupon(result.coupon.code));
        setCode("");
        setError(null);
        notify(
            `Promo code ${result.coupon.code} applied — ${result.coupon.label}.`,
            "success",
        );
    };

    // Applied code no longer qualifies (e.g. the cart dropped below the
    // minimum) — explain inline and offer removal right where the error is.
    if (couponCode && !totals.coupon) {
        return (
            <div className="card-flat border border-danger bg-danger-tint px-4 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-danger">
                    <Tag className="size-4 shrink-0" aria-hidden="true" />
                    Code {couponCode} can’t be applied
                </p>
                <InlineValidationError id="coupon-error">
                    {couponErrorMessage(totals.couponError)}
                </InlineValidationError>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm mt-3"
                    onClick={() => {
                        dispatch(removeCoupon());
                        notify("Promo code removed.", "info");
                    }}
                >
                    Remove code
                </button>
            </div>
        );
    }

    // Valid code applied — show the win; removal lives in the summary row.
    if (couponCode && totals.coupon) {
        const coupon = COUPONS.find((c) => c.code === totals.coupon);
        return (
            <div className="card-flat px-4 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-success">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    Code {totals.coupon} applied
                </p>
                <p className="mt-1.5 text-sm text-muted">
                    {coupon?.label ?? "Promo discount"} — saves{" "}
                    <span className="font-semibold text-success tabular-nums">
                        {formatCurrency(totals.couponDiscount)}
                    </span>
                    . One code per cart; remove it any time from the order
                    summary.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="card-flat px-4 py-4">
            <label htmlFor="coupon-code" className="field-label">
                Promo code
            </label>
            <div className="flex gap-2">
                <input
                    id="coupon-code"
                    className="field uppercase"
                    type="text"
                    value={code}
                    onChange={(event) => {
                        setCode(event.target.value);
                        if (error) setError(null);
                    }}
                    placeholder="WELCOME10"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={`coupon-help${error ? " coupon-error" : ""}`}
                />
                <button type="submit" className="btn btn-secondary shrink-0">
                    Apply
                </button>
            </div>
            <InlineValidationError id="coupon-error">
                {error}
            </InlineValidationError>
            <p id="coupon-help" className="mt-2.5 text-xs leading-relaxed text-muted">
                Demo codes: WELCOME10 · EDITORIAL20 · FREESHIP — or try
                EXPIRED5 / SINGLEUSE25 to preview the error states.
            </p>
        </form>
    );
}
