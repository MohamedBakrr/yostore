import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    CHECKOUT_STEPS,
    selectCheckoutDraft,
    setCheckoutContact,
    setCheckoutStep,
    setPaymentMethod,
} from "../../store/checkoutSlice";
import { selectCartItems, selectShippingMethodId, setShippingMethod } from "../../store/cartSlice";
import { selectUser } from "../../store/authSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { useToast } from "../../providers/ToastProvider";
import { CHECKOUT_STEP_LABELS } from "../../features/checkout/constants";
import { usePlaceOrder } from "../../features/checkout/usePlaceOrder";
import CheckoutStepper from "../../components/checkout/CheckoutStepper";
import AddressForm from "../../components/checkout/AddressForm";
import ShippingMethodSelector from "../../components/checkout/ShippingMethodSelector";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import OrderSummary from "../../components/checkout/OrderSummary";
import TotalsBreakdown from "../../components/cart/TotalsBreakdown";
import DemoNotice from "../../components/checkout/DemoNotice";
import LoadingButton from "../../components/feedback/LoadingButton";

function isBlankContact(contact) {
    return Object.values(contact).every(
        (value) => !String(value ?? "").trim(),
    );
}

/** Profile fields → checkout contact shape (used when the draft is empty). */
function contactFromUser(user) {
    return {
        fullName: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        address: user?.address ?? "",
        city: user?.city ?? "",
        postalCode: user?.postalCode ?? "",
        country: user?.country ?? "",
    };
}

/**
 * Four-step checkout (contact → shipping → payment → review).
 *
 * The persisted `checkoutSlice` draft owns the step, contact fields, and
 * payment method, so back/forward navigation and reloads never lose input.
 * Empty carts are bounced to `/cart` with a notice; every step validates
 * before advancing; order creation is guarded against duplicate taps.
 */
export default function CheckoutPage() {
    useDocumentTitle("Checkout", {
        description:
            "Four-step demo checkout: contact and address, shipping method, simulated payment, and review — nothing is charged and no data leaves your browser.",
    });

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { notify } = useToast();

    const items = useAppSelector(selectCartItems);
    const draft = useAppSelector(selectCheckoutDraft);
    const user = useAppSelector(selectUser);
    const shippingMethodId = useAppSelector(selectShippingMethodId);
    const totals = useCartTotals();

    const [paymentOutcome, setPaymentOutcome] = useState(null);
    const { placeOrder, placing, placedRef } = usePlaceOrder();
    const stepSeenRef = useRef(draft.step);

    const step = draft.step;

    // Empty cart (or a cart emptied mid-flow) → bounce with a notice.
    useEffect(() => {
        if (items.length === 0 && !placedRef.current) {
            navigate("/cart?notice=checkout-empty", { replace: true });
        }
    }, [items.length, navigate, placedRef]);

    // Live-announce step changes through the toast region (not on first paint,
    // and not when the draft resets itself after a successful order).
    useEffect(() => {
        if (placedRef.current) return;
        if (stepSeenRef.current !== step) {
            stepSeenRef.current = step;
            notify(
                `Step ${step + 1} of ${CHECKOUT_STEPS.length} — ${
                    CHECKOUT_STEP_LABELS[step]
                }`,
                "info",
            );
        }
    }, [step, notify, placedRef]);

    // Backwards through the stepper only — forward always re-validates.
    const goToStep = (index) => {
        if (index < step) dispatch(setCheckoutStep(index));
    };

    const handleContactContinue = (values) => {
        dispatch(setCheckoutContact(values));
        dispatch(setCheckoutStep(1));
    };

    const handleShippingChange = (id) => dispatch(setShippingMethod(id));

    const handlePaymentChange = (id) => {
        dispatch(setPaymentMethod(id));
        setPaymentOutcome(null);
    };

    const handlePaymentApproved = () => {
        setPaymentOutcome("paid");
        notify("Payment simulation approved — no real charge occurred.", "success");
    };

    const handlePaymentCancelled = () => {
        setPaymentOutcome("cancelled");
        notify(
            "Payment simulation cancelled — your cart and details are intact.",
            "error",
        );
    };

    const canAdvancePayment =
        draft.paymentMethodId === "cod" || paymentOutcome === "paid";
    const canPlace =
        !(draft.paymentMethodId === "online" && paymentOutcome !== "paid");

    // Profile prefill for accounts whose draft is still empty.
    const initialContact =
        isBlankContact(draft.contact) && user
            ? contactFromUser(user)
            : draft.contact;

    return (
        <div className="page-frame py-10 md:py-14">
            <header className="max-w-3xl">
                <p className="eyebrow">Checkout</p>
                <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                    Complete your order
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                    Four short steps. Your progress is saved in this browser,
                    so you can step back and forth — or leave and return —
                    without losing anything.
                </p>
            </header>

            <div className="mt-6 max-w-3xl">
                <DemoNotice label="Demo checkout.">
                    Orders are stored locally in this browser. No payment is
                    processed, no card details are ever collected, and nothing
                    ships.
                </DemoNotice>
            </div>

            <CheckoutStepper step={step} onSelect={goToStep} />

            <div
                className={`mt-10 grid items-start gap-10 ${
                    step < 3 ? "lg:grid-cols-[minmax(0,1fr)_21rem]" : ""
                }`}
            >
                <section aria-labelledby="checkout-step-title">
                    <h2
                        id="checkout-step-title"
                        className="font-display text-2xl"
                    >
                        {CHECKOUT_STEP_LABELS[step]}
                    </h2>

                    <div className="mt-5">
                        {step === 0 ? (
                            <>
                                <p className="mb-5 text-sm leading-relaxed text-muted">
                                    Where should this demo order go? All fields
                                    are required before you can continue.
                                </p>
                                <AddressForm
                                    defaultValues={initialContact}
                                    onContinue={handleContactContinue}
                                />
                                <Link
                                    to="/cart"
                                    className="btn btn-ghost mt-3"
                                >
                                    <ArrowLeft
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Back to cart
                                </Link>
                            </>
                        ) : null}

                        {step === 1 ? (
                            <>
                                <p className="mb-5 text-sm leading-relaxed text-muted">
                                    Costs below are calculated live from the
                                    pricing module with your current items and
                                    promo code.
                                </p>
                                <ShippingMethodSelector
                                    value={shippingMethodId}
                                    onChange={handleShippingChange}
                                />
                                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => goToStep(0)}
                                    >
                                        <ArrowLeft className="size-4" aria-hidden="true" />
                                        Back
                                    </button>
                                    <LoadingButton
                                        onClick={() =>
                                            dispatch(setCheckoutStep(2))
                                        }
                                        icon={ArrowRight}
                                    >
                                        Continue to payment
                                    </LoadingButton>
                                </div>
                            </>
                        ) : null}

                        {step === 2 ? (
                            <>
                                <p className="mb-5 text-sm leading-relaxed text-muted">
                                    Choose how this demo order would pay — then
                                    run the local simulation for the online
                                    path.
                                </p>
                                <PaymentMethodSelector
                                    value={draft.paymentMethodId}
                                    onChange={handlePaymentChange}
                                    outcome={paymentOutcome}
                                    onApproved={handlePaymentApproved}
                                    onCancelled={handlePaymentCancelled}
                                />
                                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => goToStep(1)}
                                    >
                                        <ArrowLeft className="size-4" aria-hidden="true" />
                                        Back
                                    </button>
                                    <div className="text-right">
                                        <LoadingButton
                                            disabled={!canAdvancePayment}
                                            onClick={() =>
                                                dispatch(setCheckoutStep(3))
                                            }
                                            icon={ArrowRight}
                                        >
                                            Continue to review
                                        </LoadingButton>
                                        {!canAdvancePayment ? (
                                            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted">
                                                {paymentOutcome === "cancelled"
                                                    ? "The simulation was cancelled — approve it again or pick cash on delivery."
                                                    : "Approve the payment simulation to continue."}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </>
                        ) : null}

                        {step === 3 ? (
                            <>
                                <div className="mt-5">
                                    <OrderSummary
                                        onEditContact={() => goToStep(0)}
                                        onEditShipping={() => goToStep(1)}
                                        onEditPayment={() => goToStep(2)}
                                    />
                                </div>

                                <div className="mt-8 border border-hair bg-surface px-5 py-5">
                                    {!canPlace ? (
                                        <p
                                            role="status"
                                            className="mb-4 border border-warning bg-warning-tint px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                                        >
                                            Your simulated payment hasn’t been
                                            approved yet.{" "}
                                            <button
                                                type="button"
                                                className="link-underline font-semibold text-accent"
                                                onClick={() => goToStep(2)}
                                            >
                                                Return to the payment step
                                            </button>{" "}
                                            to run it, or switch to cash on
                                            delivery.
                                        </p>
                                    ) : null}

                                    <LoadingButton
                                        loading={placing}
                                        disabled={!canPlace}
                                        onClick={() =>
                                            placeOrder({
                                                paymentOutcome,
                                            })
                                        }
                                        icon={ShieldCheck}
                                        className="btn-block"
                                    >
                                        Place demo order
                                    </LoadingButton>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => goToStep(2)}
                                        >
                                            <ArrowLeft
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            Back to payment
                                        </button>
                                        <p className="text-xs text-muted">
                                            No charge is made — this creates a
                                            local demo order only.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </section>

                {step < 3 ? (
                    <aside
                        aria-labelledby="checkout-summary-title"
                        className="card-flat lg:sticky lg:top-24"
                    >
                        <div className="flex items-baseline justify-between gap-3 border-b border-hair px-5 py-4">
                            <h2
                                id="checkout-summary-title"
                                className="font-display text-lg"
                            >
                                Order summary
                            </h2>
                            <Link
                                to="/cart"
                                className="link-underline text-xs font-semibold text-accent"
                            >
                                Edit cart
                            </Link>
                        </div>
                        <div className="px-5 py-4">
                            <p className="mb-3 text-xs text-muted">
                                {totals.itemCount}{" "}
                                {totals.itemCount === 1 ? "item" : "items"} ·
                                totals recalculate the moment anything changes.
                            </p>
                            <TotalsBreakdown totals={totals} />
                        </div>
                    </aside>
                ) : null}
            </div>
        </div>
    );
}
