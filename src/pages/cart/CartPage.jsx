import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ShoppingBag } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCart, selectCartItems } from "../../store/cartSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { useToast } from "../../providers/ToastProvider";
import CartItem from "../../components/cart/CartItem";
import CouponInput from "../../components/cart/CouponInput";
import CartSummary from "../../components/cart/CartSummary";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import EmptyState from "../../components/feedback/EmptyState";

/**
 * Cart page: shared `CartItem` lines (quantity/removal dispatch straight to the
 * store), demo coupon entry, and a sticky summary fed exclusively by
 * `useCartTotals()`. Editorial two-column layout — not a centered card.
 */
export default function CartPage() {
    useDocumentTitle("Your cart", {
        description:
            "Review your items, apply a demo promo code, pick a shipping method, and head to checkout.",
    });

    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const items = useAppSelector(selectCartItems);
    const totals = useCartTotals();
    const [params] = useSearchParams();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const noticedRef = useRef(false);

    const redirected =
        params.get("notice") === "checkout-empty" && items.length === 0;

    // Checkout bounces empty carts here with ?notice=checkout-empty.
    useEffect(() => {
        if (redirected && !noticedRef.current) {
            noticedRef.current = true;
            notify(
                "Checkout needs at least one item — your cart is empty.",
                "info",
            );
        }
    }, [redirected, notify]);

    const handleClear = () => {
        setConfirmOpen(false);
        dispatch(clearCart());
        notify("Cart cleared.", "info");
    };

    return (
        <div className="page-frame py-10 md:py-14">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hair pb-6">
                <div>
                    <p className="eyebrow">Cart</p>
                    <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                        Your cart
                    </h1>
                    <p className="mt-3 text-sm text-muted">
                        {items.length === 0
                            ? "Nothing here yet — the edit is waiting."
                            : `${totals.itemCount} ${
                                  totals.itemCount === 1 ? "item" : "items"
                              } ready for checkout.`}
                    </p>
                </div>
                {items.length > 0 ? (
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setConfirmOpen(true)}
                    >
                        Clear cart
                    </button>
                ) : null}
            </header>

            {redirected ? (
                <div
                    role="status"
                    className="mt-6 border border-warning bg-warning-tint px-4 py-3 text-sm leading-relaxed text-ink"
                >
                    Checkout was paused — add at least one item to continue.{" "}
                    <Link to="/shop" className="link-underline font-semibold">
                        Browse the shop
                    </Link>
                </div>
            ) : null}

            {items.length === 0 ? (
                <div className="mt-10 max-w-2xl">
                    <EmptyState
                        icon={ShoppingBag}
                        title="Your cart is empty"
                        description="Add a piece from the edit and it will show up here — no account required. Your cart stays saved in this browser."
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link to="/shop" className="btn btn-primary btn-sm">
                                    Shop the edit
                                </Link>
                                <Link
                                    to="/shop/fragrances"
                                    className="btn btn-secondary btn-sm"
                                >
                                    Explore the fragrance edit
                                </Link>
                            </div>
                        }
                    />
                </div>
            ) : (
                <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
                    <div>
                        <section aria-labelledby="cart-items-title">
                            <div className="flex items-center justify-between gap-4">
                                <h2
                                    id="cart-items-title"
                                    className="font-display text-xl"
                                >
                                    Items
                                </h2>
                                <Link
                                    to="/shop"
                                    className="link-underline text-xs font-semibold text-accent"
                                >
                                    Continue shopping
                                </Link>
                            </div>
                            <ul className="card-flat mt-4 px-5">
                                {items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </ul>
                        </section>

                        <section aria-labelledby="cart-promo-title" className="mt-8">
                            <h2
                                id="cart-promo-title"
                                className="font-display text-xl"
                            >
                                Promo code
                            </h2>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted">
                                Coupons are demo behavior — rules run locally
                                against your merchandise total.
                            </p>
                            <div className="mt-3">
                                <CouponInput />
                            </div>
                        </section>
                    </div>

                    <CartSummary />
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Clear your cart?"
                message={`This removes all ${totals.itemCount} ${
                    totals.itemCount === 1 ? "item" : "items"
                } and any promo code from this demo cart. It can’t be undone.`}
                confirmLabel="Clear cart"
                destructive
                onConfirm={handleClear}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
