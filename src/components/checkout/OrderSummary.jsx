import { Link } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { selectCartItems } from "../../store/cartSlice";
import { selectCheckoutDraft } from "../../store/checkoutSlice";
import { selectUser } from "../../store/authSlice";
import { useCartTotals } from "../../hooks/useCartTotals";
import { formatCurrency } from "../../utils/formatting";
import { computeMerchandiseTotal, getShippingMethod, unitPriceFor } from "../../utils/pricing";
import TotalsBreakdown from "../cart/TotalsBreakdown";

function EditButton({ onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="link-underline text-xs font-semibold text-accent"
        >
            {children}
        </button>
    );
}

/**
 * Step 4 — full review: item/price snapshots, discounts, shipping, total
 * (all from `useCartTotals()`), plus the contact/address snapshot and the
 * selected shipping + payment method. Edit links jump back to the owning step
 * without losing any input.
 */
export default function OrderSummary({
    onEditContact,
    onEditShipping,
    onEditPayment,
}) {
    const items = useAppSelector(selectCartItems);
    const draft = useAppSelector(selectCheckoutDraft);
    const user = useAppSelector(selectUser);
    const totals = useCartTotals();

    const method = getShippingMethod(totals.shippingMethod);
    const { contact } = draft;

    return (
        <div className="space-y-8">
            {/* Items + price snapshots */}
            <section aria-labelledby="review-items-title">
                <div className="flex items-baseline justify-between gap-4">
                    <h3 id="review-items-title" className="font-display text-lg">
                        Items ({totals.itemCount})
                    </h3>
                    <Link to="/cart" className="link-underline text-xs font-semibold text-accent">
                        Edit in cart
                    </Link>
                </div>
                <ul className="mt-3 border-t border-hair">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-4 border-b border-hair py-3.5 last:border-b-0"
                        >
                            <span className="size-14 shrink-0 overflow-hidden bg-sunken">
                                {item.thumbnail ? (
                                    <img
                                        src={item.thumbnail}
                                        alt=""
                                        className="size-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="grid size-full place-items-center font-display text-sm text-muted">
                                        Yo
                                    </span>
                                )}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="line-clamp-1 text-sm font-medium text-ink">
                                    {item.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted tabular-nums">
                                    Qty {item.quantity} ×{" "}
                                    {formatCurrency(
                                        unitPriceFor(
                                            item.price,
                                            item.discountPercentage,
                                        ),
                                    )}
                                </span>
                            </span>
                            <span className="text-sm font-semibold text-ink tabular-nums">
                                {formatCurrency(
                                    computeMerchandiseTotal([item]),
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Contact + address snapshot */}
            <section aria-labelledby="review-contact-title">
                <div className="flex items-baseline justify-between gap-4">
                    <h3 id="review-contact-title" className="font-display text-lg">
                        Deliver to
                    </h3>
                    <EditButton onClick={onEditContact}>Edit</EditButton>
                </div>
                <address className="mt-3 border border-hair bg-sunken px-4 py-3.5 text-sm not-italic leading-relaxed text-ink-soft">
                    <span className="block font-semibold text-ink">
                        {contact.fullName || "—"}
                    </span>
                    {contact.address ? <span className="block">{contact.address}</span> : null}
                    <span className="block">
                        {[contact.city, contact.postalCode, contact.country]
                            .filter(Boolean)
                            .join(", ") || "—"}
                    </span>
                    {contact.email ? (
                        <span className="block text-muted">{contact.email}</span>
                    ) : null}
                    {contact.phone ? (
                        <span className="block text-muted">{contact.phone}</span>
                    ) : null}
                    {user ? (
                        <span className="mt-1.5 block text-xs text-muted">
                            Signed in as {user.email} — demo account.
                        </span>
                    ) : null}
                </address>
            </section>

            {/* Shipping + payment choices */}
            <section aria-labelledby="review-methods-title">
                <h3 id="review-methods-title" className="font-display text-lg">
                    Shipping &amp; payment
                </h3>
                <dl className="mt-3 space-y-3 border border-hair px-4 py-3.5 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <dt className="text-muted">Shipping method</dt>
                        <dd className="text-right">
                            <span className="font-semibold text-ink">
                                {method.name}
                            </span>
                            <span className="block text-xs text-muted">
                                {method.description} ·{" "}
                                {formatCurrency(totals.shipping)}{" "}
                                {Number(totals.shipping) === 0
                                    ? "(free)"
                                    : ""}
                            </span>
                            <EditButton onClick={onEditShipping}>
                                Change
                            </EditButton>
                        </dd>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <dt className="text-muted">Payment</dt>
                        <dd className="text-right">
                            <span className="font-semibold text-ink">
                                {draft.paymentMethodId === "online"
                                    ? "Simulated online payment"
                                    : "Cash on delivery"}
                            </span>
                            <span className="block text-xs text-muted">
                                {draft.paymentMethodId === "online"
                                    ? "Approved (simulated) — no real charge"
                                    : "Payment due on delivery (demo)"}
                            </span>
                            <EditButton onClick={onEditPayment}>
                                Change
                            </EditButton>
                        </dd>
                    </div>
                </dl>
            </section>

            {/* Totals */}
            <section aria-labelledby="review-totals-title">
                <h3 id="review-totals-title" className="font-display text-lg">
                    Totals
                </h3>
                <TotalsBreakdown totals={totals} className="mt-3" />
            </section>
        </div>
    );
}
