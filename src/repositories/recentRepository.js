/**
 * Recently viewed products — persisted product ids with timestamps.
 * Deduplicated (newest first), capped, and validated on read.
 */

import { read, storageKeys, write } from "../utils/storage";
import { isValidRecent } from "../utils/storage/validators";

const LIMIT = 12;

function load() {
    const data = read(storageKeys.recent, isValidRecent, null);
    if (!data) return [];
    return data.entries
        .filter((e) => Number.isFinite(Number(e.id)))
        .map((e) => ({ id: Number(e.id), at: e.at }));
}

export const recentRepository = {
    list() {
        return load();
    },

    ids(excludeId = null) {
        const exclude = Number(excludeId);
        return load()
            .map((e) => e.id)
            .filter((id) => id !== exclude);
    },

    add(id) {
        const numId = Number(id);
        if (!Number.isFinite(numId)) return;
        const entries = load().filter((e) => e.id !== numId);
        entries.unshift({ id: numId, at: new Date().toISOString() });
        write(storageKeys.recent, { entries: entries.slice(0, LIMIT) });
    },

    clear() {
        write(storageKeys.recent, { entries: [] });
    },
};
