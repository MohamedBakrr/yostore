import { useState } from "react";
import { Link } from "react-router";
import { Heart, Info, Trash2 } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearWishlist, removeWishlistItem } from "../../store/wishlistSlice";
import { selectIsAuthenticated } from "../../store/authSlice";
import { useToast } from "../../providers/ToastProvider";
import { useWishlistProducts } from "../../features/wishlist/useWishlistProducts";
import ProductCard from "../../components/products/ProductCard";
import ProductGrid from "../../components/products/ProductGrid";
import { ProductGridSkeleton } from "../../components/feedback/Skeletons";
import EmptyState from "../../components/feedback/EmptyState";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import DemoNotice from "../../components/checkout/DemoNotice";

/**
 * Saved-for-later list (SPEC §9). Each id resolves through its own query, so
 * a product that leaves the demo dataset can never crash the page — it is
 * reported with a one-click removal instead.
 */
export default function WishlistPage() {
    useDocumentTitle("Wishlist", {
        description:
            "Everything you saved for later in the YoStore demo — a browser-local list that merges into your demo account when you sign in.",
    });

    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const authenticated = useAppSelector(selectIsAuthenticated);
    const { ids, products, missingIds, isLoading } = useWishlistProducts();
    const [confirmClear, setConfirmClear] = useState(false);

    const removeMissing = () => {
        missingIds.forEach((id) => dispatch(removeWishlistItem(id)));
        notify(
            missingIds.length === 1
                ? "Removed the unavailable item from your wishlist."
                : `Removed ${missingIds.length} unavailable items from your wishlist.`,
            "success",
        );
    };

    const clearAll = () => {
        dispatch(clearWishlist());
        setConfirmClear(false);
        notify("Wishlist cleared.", "success");
    };

    const shopAction = (
        <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/shop" className="btn btn-primary">
                Browse the shop
            </Link>
            {!authenticated ? (
                <Link to="/auth/login" className="btn btn-secondary">
                    Sign in to keep your list
                </Link>
            ) : null}
        </div>
    );

    return (
        <div className="page-frame py-12 md:py-16">
            <header>
                <p className="eyebrow">Wishlist</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-balance-tight md:text-5xl">
                    Saved for later
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                    A shortlist of the pieces you liked. Heart any product in
                    the catalog to keep it here.
                </p>
            </header>

            {ids.length === 0 ? (
                <div className="mt-10">
                    <EmptyState
                        icon={Heart}
                        title="Nothing saved yet"
                        description="Your wishlist is empty. Browse the catalog and tap the heart on anything you would like to come back to."
                        action={shopAction}
                    />
                </div>
            ) : (
                <div className="mt-10">
                    <div className="rule-t flex flex-wrap items-center justify-between gap-4 pt-5">
                        <p
                            role="status"
                            className="text-sm text-muted"
                        >
                            {ids.length} saved{" "}
                            {ids.length === 1 ? "item" : "items"}
                        </p>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirmClear(true)}
                        >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Clear wishlist
                        </button>
                    </div>

                    {missingIds.length > 0 ? (
                        <div
                            role="status"
                            className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-hair border-l-4 border-l-warning bg-warning-tint px-4 py-4"
                        >
                            <div className="flex items-start gap-3">
                                <Info
                                    className="mt-0.5 size-4 shrink-0 text-warning"
                                    aria-hidden="true"
                                />
                                <p className="max-w-xl text-sm leading-relaxed text-ink">
                                    <strong className="font-semibold">
                                        {missingIds.length === 1
                                            ? "One saved item is"
                                            : `${missingIds.length} saved items are`}{" "}
                                        no longer in the catalog
                                    </strong>{" "}
                                    — the demo dataset may have changed since
                                    you saved{" "}
                                    {missingIds.length === 1 ? "it" : "them"}.{" "}
                                    {missingIds.length === 1
                                        ? "It is"
                                        : "They are"}{" "}
                                    not shown below.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={removeMissing}
                            >
                                <Trash2
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Remove {missingIds.length === 1 ? "it" : "them"}
                            </button>
                        </div>
                    ) : null}

                    {products.length > 0 ? (
                        <div className="mt-8">
                            <ProductGrid>
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        eager={index < 4}
                                    />
                                ))}
                            </ProductGrid>
                            {isLoading ? (
                                <p
                                    role="status"
                                    className="mt-6 text-sm text-muted"
                                >
                                    Still loading the rest of your list…
                                </p>
                            ) : null}
                        </div>
                    ) : isLoading ? (
                        <div className="mt-8">
                            <ProductGridSkeleton
                                count={Math.min(ids.length, 8)}
                            />
                        </div>
                    ) : (
                        <div className="mt-8">
                            <EmptyState
                                icon={Heart}
                                title="Nothing from your list is available"
                                description="Every saved item is missing from the demo catalog right now. Remove them below, or browse the store to save something new."
                                action={shopAction}
                            />
                        </div>
                    )}

                    <DemoNotice
                        label={authenticated ? "Demo account list." : "Guest list."}
                        className="mt-8"
                    >
                        {authenticated
                            ? "Saved items live in this browser under your demo account — a local record, not a cloud list that follows you to other devices."
                            : "Saved items are stored in this browser only. Sign in and your guest wishlist (and cart) merge into your demo account automatically."}
                    </DemoNotice>
                </div>
            )}

            <ConfirmDialog
                open={confirmClear}
                title="Clear your wishlist?"
                message={`This removes all ${ids.length} saved ${ids.length === 1 ? "item" : "items"} from this browser. You can always save them again from the catalog.`}
                confirmLabel="Clear wishlist"
                cancelLabel="Keep my list"
                destructive
                onConfirm={clearAll}
                onCancel={() => setConfirmClear(false)}
            />
        </div>
    );
}
