import { useState } from "react";
import { Link } from "react-router";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addItem } from "../../store/cartSlice";
import { selectIsWishlisted, toggleWishlist } from "../../store/wishlistSlice";
import { useToast } from "../../providers/ToastProvider";
import ProductPrice from "./ProductPrice";
import RatingDisplay from "./RatingDisplay";
import QuickViewDialog from "./QuickViewDialog";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * The canonical catalog card: image, quick actions, metadata, price.
 *
 * Quick actions live in the DOM at all times and reveal on hover *and*
 * `:focus-within`, and stay visible below `md` where hover does not exist —
 * so no essential control is hover-gated.
 *
 * Image scaling uses a CSS transform on a single element (cheap with dozens of
 * cards); Motion is reserved for hero/scroll choreography.
 */
export default function ProductCard({ product, eager = false }) {
    const [quickView, setQuickView] = useState(false);
    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const wishlisted = useAppSelector(selectIsWishlisted(product.id));

    const thumbnail = product.thumbnail || product.images?.[0] || "";
    const categoryLabel = String(product.category ?? "").replaceAll("-", " ");
    const discount = Number(product.discountPercentage) || 0;
    const outOfStock = Number(product.stock) === 0;

    const addToCart = (event) => {
        event.preventDefault();
        dispatch(addItem({ product, quantity: 1 }));
        notify(`Added “${product.title}” to your cart.`, "success");
    };

    const toggleWish = (event) => {
        event.preventDefault();
        dispatch(toggleWishlist(product.id));
        notify(
            wishlisted
                ? `Removed “${product.title}” from your wishlist.`
                : `Saved “${product.title}” to your wishlist.`,
            "success",
        );
    };

    return (
        <>
            <article className="group relative flex flex-col">
                <div className="relative mb-4 overflow-hidden bg-sunken aspect-4/5">
                    <Link
                        to={`/product/${product.id}`}
                        className="block size-full"
                        aria-label={`View ${product.title}`}
                    >
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt={product.title}
                                loading={eager ? "eager" : "lazy"}
                                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ transitionTimingFunction: EASE }}
                            />
                        ) : (
                            <span className="grid size-full place-items-center font-display text-3xl text-muted">
                                {product.title?.slice(0, 1) ?? "Y"}
                            </span>
                        )}
                    </Link>

                    {discount > 0 ? (
                        <span className="absolute left-0 top-0 bg-accent px-2 py-1 text-[11px] font-bold tracking-wide text-accent-contrast">
                            −{Math.round(discount)}%
                        </span>
                    ) : null}

                    <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        <button
                            type="button"
                            className="btn btn-inverse btn-sm min-w-0 flex-1"
                            onClick={addToCart}
                            disabled={outOfStock}
                            aria-label={`Add ${product.title} to cart`}
                        >
                            <ShoppingBag className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">
                                {outOfStock ? "Sold out" : "Add"}
                            </span>
                        </button>
                        <button
                            type="button"
                            className="icon-btn border border-hair bg-surface"
                            onClick={() => setQuickView(true)}
                            aria-label={`Quick view ${product.title}`}
                        >
                            <Eye className="size-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={`icon-btn border border-hair bg-surface ${wishlisted ? "text-accent" : ""}`}
                            onClick={toggleWish}
                            aria-pressed={wishlisted}
                            aria-label={
                                wishlisted
                                    ? `Remove ${product.title} from wishlist`
                                    : `Save ${product.title} to wishlist`
                            }
                        >
                            <Heart
                                className={`size-4 ${wishlisted ? "fill-accent text-accent" : ""}`}
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <p className="eyebrow">{categoryLabel}</p>
                    <h3 className="font-display text-[1.0625rem] leading-snug">
                        <Link
                            to={`/product/${product.id}`}
                            className="transition-colors hover:text-accent"
                        >
                            {product.title}
                        </Link>
                    </h3>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                        <ProductPrice
                            price={product.price}
                            discountPercentage={product.discountPercentage}
                            size="sm"
                        />
                        <RatingDisplay value={product.rating} />
                    </div>
                </div>
            </article>

            <QuickViewDialog
                product={product}
                open={quickView}
                onClose={() => setQuickView(false)}
            />
        </>
    );
}
