import { Link } from "react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { removeItem, setQuantity } from "../../store/cartSlice";
import { formatCurrency } from "../../utils/formatting";
import { MAX_QUANTITY, unitPriceFor } from "../../utils/pricing";

/**
 * One cart line with quantity stepper and removal.
 * Shared by the cart drawer and the cart page so both stay pixel-identical.
 */
export default function CartItem({ item, compact = false }) {
    const dispatch = useAppDispatch();

    const unit = unitPriceFor(item.price, item.discountPercentage);
    const lineTotal = unit * item.quantity;
    const maxQuantity = Math.max(
        1,
        Math.min(
            MAX_QUANTITY,
            Number.isFinite(Number(item.stock)) ? Number(item.stock) : MAX_QUANTITY,
        ),
    );

    return (
        <li className="flex gap-4 border-b border-hair py-4 last:border-b-0">
            <Link
                to={`/product/${item.id}`}
                className={`${compact ? "size-16" : "size-20 md:size-24"} shrink-0 overflow-hidden bg-sunken`}
                tabIndex={-1}
                aria-hidden="true"
            >
                {item.thumbnail ? (
                    <img
                        src={item.thumbnail}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <span className="grid size-full place-items-center font-display text-lg text-muted">
                        Yo
                    </span>
                )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        to={`/product/${item.id}`}
                        className="line-clamp-2 font-display text-sm leading-snug transition-colors hover:text-accent"
                    >
                        {item.title}
                    </Link>
                    <button
                        type="button"
                        onClick={() => dispatch(removeItem(item.id))}
                        className="-mr-1.5 -mt-1 icon-btn size-8 shrink-0"
                        aria-label={`Remove ${item.title} from cart`}
                    >
                        <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div className="inline-flex items-center border border-hair">
                        <button
                            type="button"
                            onClick={() =>
                                dispatch(
                                    setQuantity({
                                        id: item.id,
                                        quantity: item.quantity - 1,
                                    }),
                                )
                            }
                            disabled={item.quantity <= 1}
                            className="icon-btn size-8"
                            aria-label={`Decrease quantity of ${item.title}`}
                        >
                            <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span
                            className="min-w-8 text-center text-sm font-semibold tabular-nums"
                            aria-label={`Quantity ${item.quantity}`}
                        >
                            {item.quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                dispatch(
                                    setQuantity({
                                        id: item.id,
                                        quantity: item.quantity + 1,
                                    }),
                                )
                            }
                            disabled={item.quantity >= maxQuantity}
                            className="icon-btn size-8"
                            aria-label={`Increase quantity of ${item.title}`}
                        >
                            <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-semibold text-ink">
                            {formatCurrency(lineTotal)}
                        </p>
                        {item.quantity > 1 ? (
                            <p className="text-xs text-muted">
                                {formatCurrency(unit)} each
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </li>
    );
}
