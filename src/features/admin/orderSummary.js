/**
 * Pure helpers that turn locally stored demo orders into admin metrics and
 * labels. Nothing here talks to the network — every input is a demo record
 * already read from this browser's storage.
 */
import { accountRepository } from "../../repositories/accountRepository";
import { ORDER_STATUSES } from "../../repositories/ordersRepository";

const KNOWN_STATUS_IDS = new Set(ORDER_STATUSES.map((status) => status.id));

/** Whether a status id is part of the demo status flow. */
export function isKnownStatus(statusId) {
    return KNOWN_STATUS_IDS.has(statusId);
}

/** Human label for a status id, falling back to the first known status. */
export function statusLabel(statusId) {
    const match = ORDER_STATUSES.find((status) => status.id === statusId);
    return (match ?? ORDER_STATUSES[0]).label;
}

/** Aggregate counts + gross demo revenue for the dashboard metric cards. */
export function summarizeOrders(orders) {
    const list = Array.isArray(orders) ? orders : [];
    const byStatus = {};
    let guest = 0;
    let revenue = 0;

    for (const order of list) {
        const statusId = KNOWN_STATUS_IDS.has(order?.status)
            ? order.status
            : "pending";
        byStatus[statusId] = (byStatus[statusId] ?? 0) + 1;
        if (!order?.accountId) guest += 1;
        const total = Number(order?.totals?.total);
        if (Number.isFinite(total)) revenue += total;
    }

    return { count: list.length, guest, revenue, byStatus };
}

/** Buyer display name: account name when known, otherwise "Guest". */
export function buyerLabel(order) {
    if (!order?.accountId) return "Guest";
    const account = accountRepository.findById(order.accountId);
    if (account?.name) return account.name;
    return order?.contact?.fullName || "Account";
}

/**
 * Buyer labels for a whole list of orders with a single read of the account
 * storage — used by the orders table and the dashboard mini-table.
 */
export function buildBuyerLabels(orders) {
    const labels = new Map();
    let accounts = null;

    for (const order of Array.isArray(orders) ? orders : []) {
        if (!order?.accountId) {
            labels.set(order.orderId, "Guest");
            continue;
        }
        if (!accounts) accounts = accountRepository.listAccounts();
        const account = accounts.find((a) => a.id === order.accountId);
        labels.set(
            order.orderId,
            account?.name || order?.contact?.fullName || "Account",
        );
    }

    return labels;
}

/**
 * Token-backed chip classes for a status id. Never used alone — the status
 * label always accompanies it so meaning is never color-only.
 */
export function statusToneClass(statusId) {
    switch (statusId) {
        case "delivered":
            return "border-success text-success bg-success-tint";
        case "cancelled":
            return "border-danger text-danger bg-danger-tint";
        case "pending":
            return "border-warning text-warning bg-warning-tint";
        case "shipped":
            return "border-accent text-accent bg-accent-tint";
        default:
            return "border-hair-strong text-ink-soft";
    }
}
