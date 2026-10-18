import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import {
    selectCartItems,
    selectCouponCode,
    selectShippingMethodId,
} from "../store/cartSlice";
import { computeTotals } from "../utils/pricing";

/**
 * Single source of truth for displayed money. The cart drawer, cart page,
 * checkout steps, and order review all read totals from here so numbers can
 * never disagree between surfaces.
 */
export function useCartTotals() {
    const items = useAppSelector(selectCartItems);
    const couponCode = useAppSelector(selectCouponCode);
    const shippingMethodId = useAppSelector(selectShippingMethodId);

    return useMemo(
        () => computeTotals({ items, couponCode, shippingMethodId }),
        [items, couponCode, shippingMethodId],
    );
}

export default useCartTotals;
