import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
    CheckCircle2,
    Heart,
    Info,
    Minus,
    Plus,
    ShoppingBag,
    XCircle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addItem } from "../../store/cartSlice";
import { selectIsWishlisted, toggleWishlist } from "../../store/wishlistSlice";
import { useToast } from "../../providers/ToastProvider";
import { useCategories } from "../../hooks/useCategories";
import { formatCurrency, formatDate } from "../../utils/formatting";
import { unitPriceFor } from "../../utils/pricing";
import Breadcrumbs from "../../components/products/Breadcrumbs";
import ProductGallery from "../../components/products/ProductGallery";
import ProductPrice from "../../components/products/ProductPrice";
import RatingDisplay from "../../components/products/RatingDisplay";
import { categoryLabel } from "../../components/products/categoryLabel";
import { sampleReviewsFor } from "./sampleReviews";

const MAX_QUANTITY = 99;

function clampQuantity(value, max) {
    if (!Number.isFinite(value)) return 1;
    return Math.min(Math.max(Math.round(value), 1), max);
}

/**
 * Successful product detail view (SPEC §8.10): breadcrumb, gallery, price and
 * stock, quantity selector, cart/wishlist actions, and the clearly-labeled
 * sample reviews. Rendered by ProductPage with `key={product.id}` so quantity
 * state resets when navigating between products.
 */
export default function ProductDetails({ product }) {
    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const wishlisted = useAppSelector(selectIsWishlisted(product.id));
    const { data: categories } = useCategories();
    const [quantity, setQuantity] = useState(1);

    const reviews = useMemo(() => sampleReviewsFor(product), [product]);

    const stock = Number.isFinite(Number(product.stock))
        ? Number(product.stock)
        : null;
    const outOfStock = stock === 0;
    const maxQuantity =
        stock !== null && stock > 0 ? Math.min(stock, MAX_QUANTITY) : MAX_QUANTITY;
    const discount = Number(product.discountPercentage) || 0;
    const unit = unitPriceFor(product.price, discount);

    const categoryName =
        categories?.find((entry) => entry.slug === product.category)?.name ??
        categoryLabel(product.category);

    const breadcrumbItems = [
        { label: "Home", to: "/" },
        { label: "Shop", to: "/shop" },
        ...(product.category
            ? [{ label: categoryName, to: `/shop/${product.category}` }]
            : []),
        { label: product.title },
    ];

    const handleQuantityChange = (event) => {
        const raw = event.target.value;
        if (raw === "") {
            setQuantity(1);
            return;
        }
        setQuantity(clampQuantity(Number(raw), maxQuantity));
    };

    const addToCart = () => {
        if (outOfStock) return;
        dispatch(addItem({ product, quantity }));
        notify(`Added “${product.title}” to your cart.`, "success");
    };

    const toggleWish = () => {
        dispatch(toggleWishlist(product.id));
        notify(
            wishlisted
                ? `Removed “${product.title}” from your wishlist.`
                : `Saved “${product.title}” to your wishlist.`,
            "success",
        );
    };

    return (
        <article>
            <Breadcrumbs items={breadcrumbItems} />

            <div className="grid gap-10 lg:grid-cols-2 xl:gap-16">
                <ProductGallery key={product.id} product={product} />

                <div className="flex flex-col">
                    <p className="eyebrow">
                        {product.category ? (
                            <Link
                                to={`/shop/${product.category}`}
                                className="transition-colors hover:text-accent"
                            >
                                {categoryName}
                            </Link>
                        ) : (
                            categoryName || "Uncategorized"
                        )}
                    </p>

                    <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl text-balance-tight">
                        {product.title}
                    </h1>

                    {product.brand ? (
                        <p className="mt-2 text-sm text-muted">
                            by {product.brand}
                        </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <RatingDisplay value={product.rating} size="md" />
                        {product.sku ? (
                            <span className="text-xs text-muted">
                                SKU {product.sku}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <ProductPrice
                            price={product.price}
                            discountPercentage={product.discountPercentage}
                            size="lg"
                        />
                        {discount > 0 ? (
                            <span className="chip border-accent bg-accent-tint text-accent">
                                Save {Math.round(discount)}%
                            </span>
                        ) : null}
                    </div>

                    {stock !== null ? (
                        stock > 0 ? (
                            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-success">
                                <CheckCircle2
                                    className="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                In stock — {stock} available
                            </p>
                        ) : (
                            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-danger">
                                <XCircle
                                    className="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                Out of stock
                            </p>
                        )
                    ) : null}

                    {product.locallyCreated || product.locallyEdited ? (
                        <p className="chip mt-4 self-start border-warning bg-warning-tint text-warning">
                            {product.locallyCreated
                                ? "Created locally in the demo admin"
                                : "Edited locally in the demo admin"}
                        </p>
                    ) : null}

                    <p className="mt-6 max-w-prose leading-relaxed text-ink-soft">
                        {product.description ||
                            "No description has been provided for this product yet."}
                    </p>

                    {/* Purchase controls */}
                    <div className="mt-8 rule-t pt-8">
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <label
                                    htmlFor="product-quantity"
                                    className="field-label"
                                >
                                    Quantity
                                </label>
                                <div className="inline-flex items-stretch border border-hair-strong">
                                    <button
                                        type="button"
                                        className="icon-btn min-h-11 min-w-11 border-r border-hair"
                                        onClick={() =>
                                            setQuantity((current) =>
                                                Math.max(1, current - 1),
                                            )
                                        }
                                        disabled={quantity <= 1 || outOfStock}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <input
                                        id="product-quantity"
                                        type="number"
                                        inputMode="numeric"
                                        className="w-14 border-0 bg-transparent text-center text-sm font-semibold"
                                        value={quantity}
                                        min={1}
                                        max={maxQuantity}
                                        disabled={outOfStock}
                                        onChange={handleQuantityChange}
                                        onBlur={() =>
                                            setQuantity((current) =>
                                                clampQuantity(
                                                    current,
                                                    maxQuantity,
                                                ),
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="icon-btn min-h-11 min-w-11 border-l border-hair"
                                        onClick={() =>
                                            setQuantity((current) =>
                                                Math.min(
                                                    maxQuantity,
                                                    current + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            quantity >= maxQuantity || outOfStock
                                        }
                                        aria-label="Increase quantity"
                                    >
                                        <Plus
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary min-h-11 min-w-56 flex-1"
                                onClick={addToCart}
                                disabled={outOfStock}
                            >
                                <ShoppingBag
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                {outOfStock
                                    ? "Out of stock"
                                    : `Add to cart · ${formatCurrency(unit * quantity)}`}
                            </button>

                            <button
                                type="button"
                                className={`btn btn-secondary min-h-11 ${
                                    wishlisted ? "border-accent text-accent" : ""
                                }`}
                                aria-pressed={wishlisted}
                                onClick={toggleWish}
                            >
                                <Heart
                                    className={`size-4 ${wishlisted ? "fill-accent text-accent" : ""}`}
                                    aria-hidden="true"
                                />
                                {wishlisted
                                    ? "Saved to wishlist"
                                    : "Add to wishlist"}
                            </button>
                        </div>

                        <p className="mt-3 text-xs text-muted">
                            Quantity is capped at {maxQuantity} — the smaller of
                            your limit and the available stock.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sample reviews — explicitly demo content (SPEC §10) */}
            <section
                aria-labelledby="sample-reviews-heading"
                className="rule-t mt-14 pt-10"
            >
                <h2
                    id="sample-reviews-heading"
                    className="font-display text-2xl md:text-3xl text-balance-tight"
                >
                    Sample reviews
                </h2>

                <p className="mt-4 flex items-start gap-2.5 border-l-4 border-warning bg-warning-tint px-4 py-3.5 text-sm leading-relaxed text-ink">
                    <Info
                        className="mt-0.5 size-4 shrink-0 text-warning"
                        aria-hidden="true"
                    />
                    <span>
                        <strong>Sample reviews — demonstration content, not
                        verified customer feedback.</strong>{" "}
                        YoStore does not collect or verify reviews; these
                        entries are generated locally for this demo.
                    </span>
                </p>

                <ul className="mt-6 grid gap-5 md:grid-cols-3" role="list">
                    {reviews.map((review) => (
                        <li
                            key={review.id}
                            className="card-flat flex flex-col gap-3 p-5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <RatingDisplay value={review.rating} />
                                <time
                                    dateTime={review.date}
                                    className="text-xs text-muted"
                                >
                                    {formatDate(review.date)}
                                </time>
                            </div>
                            <p className="text-sm leading-relaxed text-ink-soft">
                                {review.body}
                            </p>
                            <p className="eyebrow mt-auto pt-2">
                                {review.author} · {review.location}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </article>
    );
}
