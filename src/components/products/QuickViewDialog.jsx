import { Dialog, DialogContent } from "@mui/material";
import { X } from "lucide-react";
import { Link } from "react-router";
import { useAppDispatch } from "../../store/hooks";
import { addItem } from "../../store/cartSlice";
import { useToast } from "../../providers/ToastProvider";
import { formatCurrency } from "../../utils/formatting";
import ProductPrice from "./ProductPrice";
import RatingDisplay from "./RatingDisplay";

/**
 * Optional quick view (MUI Dialog) reachable from every product card.
 * Full details remain one click away — the dialog is a shortcut, not a gate.
 */
export default function QuickViewDialog({ product, open, onClose }) {
    const dispatch = useAppDispatch();
    const { notify } = useToast();

    if (!product) return null;

    const thumbnail = product.thumbnail || product.images?.[0] || "";
    const categoryLabel = String(product.category ?? "").replaceAll("-", " ");

    const addToCart = () => {
        dispatch(addItem({ product, quantity: 1 }));
        notify(`Added “${product.title}” to your cart.`, "success");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="quick-view-title"
            slotProps={{
                paper: {
                    sx: {
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                    },
                },
            }}
        >
            <DialogContent className="p-0">
                <div className="grid md:grid-cols-2">
                    <div className="relative aspect-square bg-sunken md:aspect-auto md:min-h-80">
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt={product.title}
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <span className="absolute inset-0 grid place-items-center font-display text-4xl text-muted">
                                Yo
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close quick view"
                            className="icon-btn absolute right-2 top-2 bg-surface/90"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 p-6 md:p-8">
                        <div>
                            <p className="eyebrow mb-2">{categoryLabel}</p>
                            <h2
                                id="quick-view-title"
                                className="font-display text-2xl leading-tight text-balance-tight"
                            >
                                {product.title}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <ProductPrice
                                price={product.price}
                                discountPercentage={product.discountPercentage}
                                size="lg"
                            />
                            <RatingDisplay value={product.rating} size="md" />
                        </div>

                        <p className="line-clamp-4 text-sm leading-relaxed text-muted">
                            {product.description}
                        </p>

                        {Number.isFinite(Number(product.stock)) ? (
                            <p className="text-xs font-semibold text-success">
                                {Number(product.stock) > 0
                                    ? `In stock (${product.stock})`
                                    : "Currently out of stock"}
                            </p>
                        ) : null}

                        <div className="mt-auto flex flex-col gap-2.5 pt-2">
                            <button
                                type="button"
                                className="btn btn-primary btn-block"
                                onClick={addToCart}
                                disabled={Number(product.stock) === 0}
                            >
                                Add to cart ·{" "}
                                {formatCurrency(
                                    product.price *
                                        (1 -
                                            (Number(product.discountPercentage) || 0) /
                                                100),
                                )}
                            </button>
                            <Link
                                to={`/product/${product.id}`}
                                onClick={onClose}
                                className="btn btn-secondary btn-block"
                            >
                                View full details
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
