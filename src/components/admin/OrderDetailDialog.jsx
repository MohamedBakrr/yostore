import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { X } from "lucide-react";
import { formatCurrency, formatDateTime } from "../../utils/formatting";
import { unitPriceFor } from "../../utils/pricing";
import {
    buyerLabel,
    statusLabel,
    statusToneClass,
} from "../../features/admin/orderSummary";

/** Titled block inside the dialog content. Local to this module. */
function DetailSection({ title, children }) {
    return (
        <section className="border-t border-hair pt-4 first:border-t-0 first:pt-0">
            <h3 className="font-display text-base font-semibold">{title}</h3>
            <div className="mt-2.5">{children}</div>
        </section>
    );
}

function Meta({ label, children }) {
    return (
        <div className="min-w-32">
            <p className="eyebrow">{label}</p>
            <div className="mt-1 text-sm text-ink">{children}</div>
        </div>
    );
}

/**
 * Read-only detail for one demo order: item/price/address snapshots taken at
 * checkout, demo totals, payment state, and the simulated timeline. Status
 * changes happen on the orders page rows — this dialog only displays.
 */
export default function OrderDetailDialog({ order, onClose }) {
    const totals = order?.totals;

    return (
        <Dialog
            open={Boolean(order)}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            aria-labelledby="order-detail-title"
            slotProps={{
                paper: { sx: { border: "1px solid", borderColor: "divider" } },
            }}
        >
            {order ? (
                <>
                    <DialogTitle
                        id="order-detail-title"
                        sx={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                        className="flex items-start justify-between gap-3 pr-3"
                    >
                        <span>Order {order.orderId}</span>
                        <button
                            type="button"
                            className="icon-btn shrink-0"
                            onClick={onClose}
                            aria-label="Close order details"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </DialogTitle>

                    <DialogContent className="space-y-5">
                        <DetailSection title="Overview">
                            <div className="flex flex-wrap gap-x-8 gap-y-3">
                                <Meta label="Created">
                                    {formatDateTime(order.createdAt)}
                                </Meta>
                                <Meta label="Buyer">
                                    {buyerLabel(order)}
                                    <span className="mt-1 block text-xs text-muted">
                                        {!order.accountId
                                            ? "Guest checkout — no account attached."
                                            : "Stored with a mock account in this browser."}
                                    </span>
                                </Meta>
                                <Meta label="Status">
                                    <span
                                        className={`chip ${statusToneClass(order.status)}`}
                                    >
                                        {statusLabel(order.status)}
                                    </span>
                                </Meta>
                                <Meta label="Shipping">
                                    {order.shippingMethodName ?? "—"}
                                    <span className="mt-1 block text-xs text-muted">
                                        {order.shippingEta ?? ""}
                                    </span>
                                </Meta>
                            </div>
                        </DetailSection>

                        <DetailSection title="Items (checkout snapshot)">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-hair">
                                            <th
                                                scope="col"
                                                className="eyebrow py-2 pr-3 text-left"
                                            >
                                                Product
                                            </th>
                                            <th
                                                scope="col"
                                                className="eyebrow py-2 pr-3 text-right"
                                            >
                                                Qty
                                            </th>
                                            <th
                                                scope="col"
                                                className="eyebrow py-2 pr-3 text-right"
                                            >
                                                Unit
                                            </th>
                                            <th
                                                scope="col"
                                                className="eyebrow py-2 text-right"
                                            >
                                                Line total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(order.items ?? []).map(
                                            (item, index) => {
                                                const unit = unitPriceFor(
                                                    item.price,
                                                    item.discountPercentage,
                                                );
                                                return (
                                                    <tr
                                                        key={`${item.id}-${index}`}
                                                        className="border-b border-hair last:border-0"
                                                    >
                                                        <td className="py-2 pr-3 font-medium">
                                                            {item.title}
                                                        </td>
                                                        <td className="py-2 pr-3 text-right text-ink-soft">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="py-2 pr-3 text-right text-ink-soft">
                                                            {formatCurrency(unit)}
                                                        </td>
                                                        <td className="py-2 text-right font-semibold">
                                                            {formatCurrency(
                                                                unit *
                                                                    item.quantity,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totals ? (
                                <dl className="ml-auto mt-4 w-full max-w-sm space-y-1.5 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-muted">Subtotal</dt>
                                        <dd>{formatCurrency(totals.subtotal)}</dd>
                                    </div>
                                    {Number(totals.itemDiscounts) > 0 ? (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-muted">
                                                Item discounts
                                            </dt>
                                            <dd>
                                                −{" "}
                                                {formatCurrency(
                                                    totals.itemDiscounts,
                                                )}
                                            </dd>
                                        </div>
                                    ) : null}
                                    {totals.coupon ? (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-muted">
                                                Coupon {totals.coupon}
                                            </dt>
                                            <dd>
                                                −{" "}
                                                {formatCurrency(
                                                    totals.couponDiscount,
                                                )}
                                            </dd>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-muted">
                                            Shipping ({order.shippingMethodName})
                                        </dt>
                                        <dd>{formatCurrency(totals.shipping)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4 border-t border-hair pt-2 text-base font-semibold">
                                        <dt>Total (demo)</dt>
                                        <dd>{formatCurrency(totals.total)}</dd>
                                    </div>
                                </dl>
                            ) : null}
                        </DetailSection>

                        <DetailSection title="Address (checkout snapshot)">
                            <address className="not-italic text-sm leading-relaxed text-ink-soft">
                                {order.contact?.fullName}
                                <br />
                                {order.contact?.address}
                                <br />
                                {[order.contact?.postalCode, order.contact?.city]
                                    .filter(Boolean)
                                    .join(" ")}
                                <br />
                                {order.contact?.country}
                                <br />
                                <span className="text-muted">
                                    {order.contact?.phone}
                                    {order.contact?.phone && order.contact?.email
                                        ? " · "
                                        : ""}
                                    {order.contact?.email}
                                </span>
                            </address>
                            <p className="mt-2 text-xs text-muted">
                                Snapshot taken at checkout — stored only in this
                                browser.
                            </p>
                        </DetailSection>

                        <DetailSection title="Payment">
                            <span
                                className={`chip ${
                                    order.paymentStatus === "paid"
                                        ? "border-success bg-success-tint text-success"
                                        : "border-warning bg-warning-tint text-warning"
                                }`}
                            >
                                {order.paymentStatus === "paid"
                                    ? "Paid (simulated)"
                                    : "Due"}
                            </span>
                            <p className="mt-2 text-sm text-ink-soft">
                                {order.paymentMethodId === "online"
                                    ? "Online payment — simulated; YoStore never collects real payment credentials."
                                    : "Cash on delivery — nothing is charged in this demo."}
                            </p>
                        </DetailSection>

                        <DetailSection title="Timeline">
                            {(order.timeline ?? []).length === 0 ? (
                                <p className="text-sm text-muted">
                                    No timeline events recorded.
                                </p>
                            ) : (
                                <ol className="space-y-3">
                                    {(order.timeline ?? []).map(
                                        (event, index) => (
                                            <li
                                                key={event.key ?? index}
                                                className="flex items-start gap-3"
                                            >
                                                <span
                                                    className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {event.label}
                                                        {event.simulated !==
                                                        false ? (
                                                            <span className="chip ml-2 align-middle">
                                                                Simulated
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {formatDateTime(event.at)}
                                                    </p>
                                                </div>
                                            </li>
                                        ),
                                    )}
                                </ol>
                            )}
                            <p className="mt-3 text-xs leading-relaxed text-muted">
                                Timeline entries are simulated demo events —
                                YoStore never invents real carrier or payment
                                updates.
                            </p>
                        </DetailSection>
                    </DialogContent>

                    <DialogActions className="px-4 pb-4">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </DialogActions>
                </>
            ) : null}
        </Dialog>
    );
}
