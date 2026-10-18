/**
 * Storage availability probe for the demo admin area.
 *
 * Private-browsing modes, blocked storage APIs, and quota limits can make
 * localStorage writes fail silently. The admin pages probe once per mount so
 * they can warn the user *before* demo changes are made that cannot persist.
 *
 * This detects a browser limitation only — it is not a security or integrity
 * guarantee (browser storage is always user-editable).
 */
import { discard, key, read, write } from "../../utils/storage";

const PROBE_KEY = key("admin", "storage-probe");

/** Round-trip a tiny value through storage; false when writes don't stick. */
export function isDemoStorageAvailable() {
    try {
        if (!write(PROBE_KEY, { at: Date.now() })) return false;
        const roundTrip = read(
            PROBE_KEY,
            (value) => value && typeof value.at === "number",
            null,
        );
        discard(PROBE_KEY);
        return roundTrip != null;
    } catch {
        return false;
    }
}
