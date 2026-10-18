import { Drawer } from "@mui/material";
import { ShoppingBag, X } from "lucide-react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectCartCount, selectCartItems } from "../../store/cartSlice";
import { closeCartDrawer, selectCartDrawerOpen } from "../../store/uiSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { formatCurrency } from "../../utils/formatting";
import { SHIPPING_METHODS } from "../../utils/pricing";
import CartItem from "../cart/CartItem";
import EmptyState from "../feedback/EmptyState";

const FREE_SHIPPING_OVER =
    SHIPPING_METHODS.find((m) => m.id === "standard")?.freeOver ?? 100;

/**
 * Slide-over cart (MUI Drawer). Mirrors the cart page exactly: same items,
 * same totals, same coupon state — one source of truth in the store.
 */
export default function CartDrawer() {
    const open = useAppSelector(selectCartDrawerOpen);
    const items = useAppSelector(selectCartItems);
    const count = useAppSelector(selectCartCount);
    const totals = useCartTotals();
    const dispatch = useAppDispatch();

    const close = () => dispatch(closeCartDrawer());

    const progress = Math.min(
        100,
        (totals.merchandiseTotal / FREE_SHIPPING_OVER) * 100,
    );
    const remaining = Math.max(0, FREE_SHIPPING_OVER - totals.merchandiseTotal);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={close}
            aria-label="Shopping cart"
            slotProps={{
                paper: {
                    sx: { width: "100%", maxWidth: "26rem", borderLeft: "1px solid", borderColor: "divider" },
                },
            }}
        >
            <div className="flex h-full flex-col bg-surface">
                <header className="flex items-center justify-between border-b border-hair px-5 py-4">
                    <h2 className="font-display text-lg">
                        Your cart{" "}
                        <span className="text-muted">({count})</span>
                    </h2>
                    <button
                        type="button"
                        className="icon-btn -mr-2"
                        onClick={close}
                        aria-label="Close cart"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </header>

                {items.length === 0 ? (
                    <div className="flex flex-1 items-center p-5">
                        <EmptyState
                            compact
                            icon={ShoppingBag}
                            title="Your cart is empty"
                            description="Everything you add shows up here — no account required."
                            action={
                                <Link
                                    to="/shop"
                                    onClick={close}
                                    className="btn btn-primary btn-sm"
                                >
                                    Browse the shop
                                </Link>
                            }
                            className="w-full"
                        />
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 overflow-y-auto px-5">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} compact />
                            ))}
                        </ul>

                        <footer className="space-y-3.5 border-t border-hair px-5 py-4">
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

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Subtotal</span>
                                <span className="font-semibold text-ink">
                                    {formatCurrency(totals.merchandiseTotal)}
                                </span>
                            </div>
                            <p className="text-xs text-muted">
                                Shipping and promo codes are applied at
                                checkout.
                            </p>

                            <div className="grid grid-cols-2 gap-2.5">
                                <Link
                                    to="/cart"
                                    onClick={close}
                                    className="btn btn-secondary btn-sm"
                                >
                                    View cart
                                </Link>
                                <Link
                                    to="/checkout"
                                    onClick={close}
                                    className="btn btn-primary btn-sm"
                                >
                                    Checkout
                                </Link>
                            </div>
                        </footer>
                    </>
                )}
            </div>
        </Drawer>
    );
}
