import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCart } from "../../store/cartSlice";
import {
    ensureDraftId,
    resetCheckout,
    setCheckoutStep,
} from "../../store/checkoutSlice";
import { selectUser } from "../../store/authSlice";
import { useToast } from "../../providers/ToastProvider";
import { checkoutContactSchema } from "../../utils/validation/schemas";
import { computeTotals } from "../../utils/pricing";
import {
    buildOrder,
    ordersRepository,
} from "../../repositories/ordersRepository";

/**
 * Place-order flow for the checkout review step.
 *
 * Duplicate-tap safety comes from three layers: a synchronous `busyRef` flag
 * (React state alone could lag a fast double click), the persisted
 * `checkout.draftId` idempotency token created via `ensureDraftId()`, and the
 * `placedRef` latch that marks the draft as already converted. Guards re-run
 * here at click time so invalid contact data or an unfinished payment
 * simulation can never produce an order.
 */
export function usePlaceOrder() {
    const dispatch = useAppDispatch();
    const store = useStore();
    const navigate = useNavigate();
    const { notify } = useToast();

    const user = useAppSelector(selectUser);

    const [placing, setPlacing] = useState(false);
    const busyRef = useRef(false);
    const placedRef = useRef(false);
    const consumedDraftRef = useRef(null);

    const placeOrder = useCallback(
        ({ paymentOutcome = null } = {}) => {
            if (busyRef.current || placedRef.current) return false;

            // Read the freshest state — never trust render-time closures here.
            const state = store.getState();
            const checkout = state.checkout;
            const cart = state.cart;

            if (!cart.items.length) {
                notify(
                    "Your cart is empty — add an item before checking out.",
                    "error",
                );
                navigate("/cart?notice=checkout-empty", { replace: true });
                return false;
            }

            const parsed = checkoutContactSchema.safeParse(checkout.contact);
            if (!parsed.success) {
                dispatch(setCheckoutStep(0));
                notify(
                    "Some contact details are missing — review the highlighted fields.",
                    "error",
                );
                return false;
            }

            if (
                checkout.paymentMethodId === "online" &&
                paymentOutcome !== "paid"
            ) {
                dispatch(setCheckoutStep(2));
                notify(
                    "Complete the payment simulation before placing the order.",
                    "error",
                );
                return false;
            }

            busyRef.current = true;
            setPlacing(true);
            dispatch(ensureDraftId());
            const draftId = store.getState().checkout.draftId;
            if (!draftId || consumedDraftRef.current === draftId) {
                busyRef.current = false;
                setPlacing(false);
                return false;
            }

            try {
                const totals = computeTotals({
                    items: cart.items,
                    couponCode: cart.couponCode,
                    shippingMethodId: cart.shippingMethodId,
                });
                const order = buildOrder({
                    accountId: user?.id ?? null,
                    items: cart.items,
                    totals,
                    contact: parsed.data,
                    shippingMethodId: cart.shippingMethodId,
                    paymentMethodId: checkout.paymentMethodId,
                    couponCode: totals.coupon,
                });
                ordersRepository.save(order);

                // The draft is now consumed — no second order can reuse it.
                consumedDraftRef.current = draftId;
                placedRef.current = true;
                dispatch(clearCart());
                dispatch(resetCheckout());
                notify(
                    `Order ${order.orderId} placed — saved in this browser (demo).`,
                    "success",
                );
                navigate(`/checkout/success/${order.orderId}`, {
                    replace: true,
                });
                return true;
            } catch {
                notify(
                    "We couldn’t save that order. Please try again.",
                    "error",
                );
                return false;
            } finally {
                busyRef.current = false;
                setPlacing(false);
            }
        },
        [dispatch, navigate, notify, store, user],
    );

    return { placeOrder, placing, placedRef };
}

export default usePlaceOrder;
