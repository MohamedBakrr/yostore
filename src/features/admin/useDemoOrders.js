import { useCallback, useMemo, useState } from "react";
import { ordersRepository } from "../../repositories/ordersRepository";
import { isDemoStorageAvailable } from "./storageProbe";

function loadAll() {
    try {
        return ordersRepository.listAll();
    } catch {
        return [];
    }
}

/**
 * Every demo order stored in this browser — all mock accounts plus guest
 * checkouts — newest first, with a status-update helper.
 *
 * Reads are synchronous local-storage reads, so there is no network loading
 * state; an unavailable/blocked storage degrades to an empty list and status
 * updates return `{ ok: false }` for the page to surface.
 *
 * Status updates append timeline events marked `simulated: true` — the UI
 * must label them as demo behavior, never as real fulfillment.
 */
export function useDemoOrders() {
    const [orders, setOrders] = useState(loadAll);
    const storageAvailable = useMemo(() => isDemoStorageAvailable(), []);

    const refresh = useCallback(() => setOrders(loadAll()), []);

    const updateStatus = useCallback((order, statusId) => {
        try {
            const updated = ordersRepository.updateStatus(
                order?.accountId ?? null,
                order?.orderId,
                statusId,
            );
            if (!updated) return { ok: false };
            setOrders(loadAll());
            return { ok: true, order: updated };
        } catch {
            return { ok: false };
        }
    }, []);

    return { orders, storageAvailable, updateStatus, refresh };
}
