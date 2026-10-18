import { useCallback, useMemo, useState } from "react";
import { demoProductsRepository } from "../../repositories/demoProductsRepository";
import { isDemoStorageAvailable } from "./storageProbe";

function readStats() {
    try {
        return demoProductsRepository.stats();
    } catch {
        return { created: 0, edited: 0, deleted: 0 };
    }
}

/**
 * Local demo-product overlay state: current stats plus mutation helpers.
 *
 * Every write goes to `demoProductsRepository` — this browser's storage only.
 * The public DummyJSON dataset is never modified, and a future refresh of the
 * external catalog does not transfer these changes anywhere.
 *
 * Each operation returns `{ ok }` (plus `product` for create/update) so pages
 * can toast failures honestly. `storageAvailable` lets the UI warn when the
 * browser refuses to persist anything (private mode, quota).
 */
export function useDemoOverlay() {
    const [stats, setStats] = useState(readStats);
    const storageAvailable = useMemo(() => isDemoStorageAvailable(), []);

    const commit = useCallback((operation) => {
        try {
            const extra = operation();
            setStats(readStats());
            return { ok: true, ...(extra ?? {}) };
        } catch {
            return { ok: false };
        }
    }, []);

    const create = useCallback(
        (values) => commit(() => ({ product: demoProductsRepository.create(values) })),
        [commit],
    );

    const update = useCallback(
        (id, patch) => commit(() => ({ product: demoProductsRepository.update(id, patch) })),
        [commit],
    );

    const remove = useCallback(
        (id) => commit(() => demoProductsRepository.remove(id)),
        [commit],
    );

    const reset = useCallback(() => commit(() => demoProductsRepository.reset()), [commit]);

    const refresh = useCallback(() => setStats(readStats()), []);

    return {
        stats,
        hasChanges: stats.created + stats.edited + stats.deleted > 0,
        storageAvailable,
        refresh,
        create,
        update,
        remove,
        reset,
    };
}
