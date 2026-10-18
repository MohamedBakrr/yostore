import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { ReceiptText, Search } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useDebounce } from "../../hooks/useDebounce";
import { ORDER_STATUSES } from "../../repositories/ordersRepository";
import { useToast } from "../../providers/ToastProvider";
import { formatCurrency, formatDateTime } from "../../utils/formatting";
import {
    buildBuyerLabels,
    isKnownStatus,
    statusLabel,
    statusToneClass,
} from "../../features/admin/orderSummary";
import { useDemoOrders } from "../../features/admin/useDemoOrders";
import DemoDataNotice from "../../components/admin/DemoDataNotice";
import OrderStatusSelect from "../../components/admin/OrderStatusSelect";
import OrderDetailDialog from "../../components/admin/OrderDetailDialog";
import EmptyState from "../../components/feedback/EmptyState";

/** Header cells: uppercase micro-labels mirroring the `eyebrow` utility. */
const HEAD_SX = {
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "text.secondary",
};

const STATUS_IDS = new Set(ORDER_STATUSES.map((status) => status.id));

function itemCount(order) {
    return (order.items ?? []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
    );
}

/**
 * `/admin/orders` — every demo order stored in this browser (all mock accounts
 * plus guest checkouts), newest first. Filtering lives in `?status=` and
 * `?q=` (order id), the detail dialog in `?order=` so the dashboard can deep
 * link into it. Status updates append *simulated* timeline events to local
 * storage — this page never talks to a fulfillment system.
 */
export default function AdminOrdersPage() {
    useDocumentTitle("Manage orders", {
        description:
            "Review demo orders stored in this browser, update their simulated status, and inspect checkout snapshots — a frontend-only demonstration.",
    });

    const { notify } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { orders, storageAvailable, updateStatus } = useDemoOrders();

    const rawStatus = searchParams.get("status") ?? "";
    const statusFilter = STATUS_IDS.has(rawStatus) ? rawStatus : "all";
    const orderParam = searchParams.get("order") ?? "";

    /** Merge a patch into the URL search params. */
    const updateParams = useCallback(
        (updates, { replace = true } = {}) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    for (const [param, value] of Object.entries(updates)) {
                        if (
                            value === null ||
                            value === undefined ||
                            value === ""
                        ) {
                            next.delete(param);
                        } else {
                            next.set(param, String(value));
                        }
                    }
                    return next;
                },
                { replace },
            );
        },
        [setSearchParams],
    );

    /* --- search: local input, debounced into `?q=` ---------------------- */
    const urlQ = searchParams.get("q") ?? "";
    const [searchDraft, setSearchDraft] = useState(urlQ);
    const syncedQ = useRef(urlQ);

    // External URL changes (deep links, back/forward) refresh the input.
    useEffect(() => {
        if (urlQ === syncedQ.current) return;
        syncedQ.current = urlQ;
        setSearchDraft(urlQ);
    }, [urlQ]);

    const debouncedQ = useDebounce(searchDraft.trim(), 300);

    useEffect(() => {
        if (debouncedQ === syncedQ.current) return;
        syncedQ.current = debouncedQ;
        updateParams(debouncedQ ? { q: debouncedQ } : { q: null });
    }, [debouncedQ, updateParams]);

    const handleStatusFilter = (event) => {
        const value = event.target.value;
        updateParams(value === "all" ? { status: null } : { status: value });
    };

    const clearFilters = () => {
        setSearchDraft("");
        syncedQ.current = "";
        updateParams({ status: null, q: null });
    };

    /* --- local filtering (synchronous storage reads, no loading state) -- */
    const filtered = useMemo(() => {
        const needle = debouncedQ.toUpperCase();
        return orders.filter((order) => {
            const statusId = isKnownStatus(order.status)
                ? order.status
                : "pending";
            if (statusFilter !== "all" && statusId !== statusFilter) {
                return false;
            }
            if (
                needle &&
                !String(order.orderId ?? "")
                    .toUpperCase()
                    .includes(needle)
            ) {
                return false;
            }
            return true;
        });
    }, [orders, statusFilter, debouncedQ]);

    const buyers = useMemo(() => buildBuyerLabels(filtered), [filtered]);

    const selectedOrder = useMemo(
        () =>
            orderParam
                ? (orders.find((order) => order.orderId === orderParam) ??
                  null)
                : null,
        [orders, orderParam],
    );

    const hasFilters = statusFilter !== "all" || Boolean(debouncedQ);

    /* --- status updates (simulated timeline events) --------------------- */
    const handleStatusChange = (order, statusId) => {
        const result = updateStatus(order, statusId);
        if (!result.ok) {
            notify(
                "Couldn't update the order — browser storage may be unavailable.",
                "error",
            );
            return;
        }
        notify(
            `Order ${order.orderId} set to “${statusLabel(statusId)}” — simulated demo event, stored only in this browser.`,
            "success",
        );
    };

    const openDetail = (orderId) => updateParams({ order: orderId });
    const closeDetail = () => updateParams({ order: null });

    return (
        <div className="page-frame py-10 md:py-14">
            <p className="eyebrow">Admin (demo)</p>
            <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                Orders
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Every demo order stored in this browser — account checkouts and
                guest checkouts alike — newest first. Status changes append
                simulated timeline events; no fulfillment system is involved.
            </p>

            <DemoDataNotice className="mt-6" />

            {!storageAvailable ? (
                <p
                    role="alert"
                    className="mt-4 border border-hair border-l-4 border-l-danger bg-danger-tint px-4 py-3 text-sm leading-relaxed text-ink"
                >
                    Browser storage is unavailable (private browsing or a
                    blocked storage API). Orders shown here cannot be updated
                    persistently — status changes will not survive a refresh.
                </p>
            ) : null}

            {orderParam && !selectedOrder ? (
                <p
                    role="status"
                    className="mt-4 flex flex-wrap items-center gap-3 border border-hair bg-surface px-4 py-3 text-sm leading-relaxed text-ink-soft"
                >
                    Order “{orderParam}” isn&apos;t stored in this browser — it
                    may have been created in another browser or profile.
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={closeDetail}
                    >
                        Dismiss
                    </button>
                </p>
            ) : null}

            <div className="mt-7 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)_auto]">
                <div>
                    <label
                        className="field-label"
                        htmlFor="admin-orders-search"
                    >
                        Search by order id
                    </label>
                    <input
                        id="admin-orders-search"
                        type="search"
                        className="field"
                        placeholder="e.g. YS-9F3K2B…"
                        value={searchDraft}
                        onChange={(event) => setSearchDraft(event.target.value)}
                    />
                </div>
                <div>
                    <label
                        className="field-label"
                        htmlFor="admin-orders-status"
                    >
                        Status
                    </label>
                    <select
                        id="admin-orders-status"
                        className="field"
                        value={statusFilter}
                        onChange={handleStatusFilter}
                    >
                        <option value="all">All statuses</option>
                        {ORDER_STATUSES.map((status) => (
                            <option key={status.id} value={status.id}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
                <p className="text-sm text-muted sm:col-span-2 lg:col-span-1 lg:text-right">
                    {hasFilters
                        ? `${filtered.length} of ${orders.length} demo orders`
                        : `${orders.length} demo order${orders.length === 1 ? "" : "s"}`}
                    {" · newest first"}
                </p>
            </div>

            {orders.length === 0 ? (
                <EmptyState
                    className="mt-6"
                    icon={ReceiptText}
                    title="No demo orders yet"
                    description="Complete a checkout to create one — demo orders are stored locally in this browser."
                    action={
                        <Link to="/shop" className="btn btn-primary">
                            Start shopping
                        </Link>
                    }
                />
            ) : filtered.length === 0 ? (
                <EmptyState
                    className="mt-6"
                    icon={Search}
                    title="No orders match these filters"
                    description="Try a different order id, or clear the status filter."
                    action={
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={clearFilters}
                        >
                            Clear search &amp; filters
                        </button>
                    }
                />
            ) : (
                <>
                    {/* md+ — data table */}
                    <div className="mt-6 hidden overflow-x-auto border border-hair bg-surface md:block">
                        <Table
                            size="small"
                            aria-label="Demo orders stored in this browser"
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Order
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Created
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Buyer
                                    </TableCell>
                                    <TableCell
                                        scope="col"
                                        align="right"
                                        sx={HEAD_SX}
                                    >
                                        Items
                                    </TableCell>
                                    <TableCell
                                        scope="col"
                                        align="right"
                                        sx={HEAD_SX}
                                    >
                                        Total (demo)
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((order) => (
                                    <TableRow
                                        key={`${order.accountId ?? "guest"}-${order.orderId}`}
                                        hover
                                    >
                                        <TableCell>
                                            <button
                                                type="button"
                                                className="link-underline text-left font-semibold text-ink"
                                                onClick={() =>
                                                    openDetail(order.orderId)
                                                }
                                                aria-label={`Open details for order ${order.orderId}`}
                                            >
                                                {order.orderId}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(order.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            {buyers.get(order.orderId) ??
                                                "Guest"}
                                        </TableCell>
                                        <TableCell align="right">
                                            {itemCount(order)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatCurrency(
                                                order.totals?.total,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusSelect
                                                order={order}
                                                onChange={handleStatusChange}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* below md — stacked cards */}
                    <ul className="mt-6 space-y-3 md:hidden">
                        {filtered.map((order) => (
                            <li
                                key={`${order.accountId ?? "guest"}-${order.orderId}`}
                                className="card-flat p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <button
                                            type="button"
                                            className="link-underline break-words text-left font-semibold text-ink"
                                            onClick={() =>
                                                openDetail(order.orderId)
                                            }
                                            aria-label={`Open details for order ${order.orderId}`}
                                        >
                                            {order.orderId}
                                        </button>
                                        <p className="mt-1 text-xs text-muted">
                                            {formatDateTime(order.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`chip ${statusToneClass(order.status)}`}
                                    >
                                        {statusLabel(order.status)}
                                    </span>
                                </div>

                                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hair pt-3">
                                    <div>
                                        <dt className="eyebrow">Buyer</dt>
                                        <dd className="mt-1 break-words text-sm text-ink-soft">
                                            {buyers.get(order.orderId) ??
                                                "Guest"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="eyebrow">Items</dt>
                                        <dd className="mt-1 text-sm text-ink-soft">
                                            {itemCount(order)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="eyebrow">
                                            Total (demo)
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-ink">
                                            {formatCurrency(
                                                order.totals?.total,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="eyebrow">Shipping</dt>
                                        <dd className="mt-1 text-sm text-ink-soft">
                                            {order.shippingMethodName ?? "—"}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <OrderStatusSelect
                                        order={order}
                                        onChange={handleStatusChange}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary min-h-11"
                                        onClick={() =>
                                            openDetail(order.orderId)
                                        }
                                    >
                                        View details
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-4 text-xs leading-relaxed text-muted">
                        Status changes append{" "}
                        <strong className="font-semibold">
                            simulated demo events
                        </strong>{" "}
                        to this browser&apos;s local storage. YoStore has no
                        server-side fulfillment — nothing here reflects a real
                        shipment or payment.
                    </p>
                </>
            )}

            <OrderDetailDialog
                order={selectedOrder}
                onClose={closeDetail}
            />
        </div>
    );
}
