/**
 * Locally managed demo products (admin dashboard).
 *
 * DummyJSON is read-only for this project: admin edits are stored as a local
 * *overlay* (`overrides`, `created`, `deleted`) and never written back to the
 * public DummyJSON dataset. The overlay survives refreshes; it is merged over
 * freshly fetched catalog results at read time.
 *
 * Local products use ids ≥ 900001 so they never collide with DummyJSON ids and
 * still work with the numeric cart/wishlist code paths.
 */

import { read, storageKeys, write } from "../utils/storage";

const LOCAL_ID_FLOOR = 900001;

const OVERLAY_FIELDS = [
    "title",
    "description",
    "price",
    "discountPercentage",
    "category",
    "stock",
    "brand",
];

function isValidOverlay(data) {
    return (
        data &&
        typeof data === "object" &&
        (data.overrides == null ||
            (typeof data.overrides === "object" &&
                !Array.isArray(data.overrides))) &&
        Array.isArray(data.created) &&
        Array.isArray(data.deleted)
    );
}

function loadOverlay() {
    const data = read(storageKeys.adminProducts, isValidOverlay, null);
    if (!data) return { overrides: {}, created: [], deleted: [] };
    return {
        overrides: data.overrides ?? {},
        created: (data.created ?? []).filter(
            (p) => p && Number.isFinite(Number(p.id)) && typeof p.title === "string",
        ),
        deleted: (data.deleted ?? []).filter((id) => Number.isFinite(Number(id))),
    };
}

function saveOverlay(overlay) {
    write(storageKeys.adminProducts, overlay);
}

function pickFields(source) {
    const out = {};
    for (const field of OVERLAY_FIELDS) {
        if (source[field] !== undefined) out[field] = source[field];
    }
    return out;
}

function nextLocalId(overlay) {
    const used = overlay.created.map((p) => Number(p.id));
    return Math.max(LOCAL_ID_FLOOR - 1, ...used.filter(Number.isFinite)) + 1;
}

/** Merge the local overlay over an API product (or product array). */
function applyToProducts(products) {
    const overlay = loadOverlay();
    const deleted = new Set(overlay.deleted.map(Number));
    const visible = products
        .filter((p) => !deleted.has(Number(p.id)))
        .map((p) => {
            const patch = overlay.overrides[Number(p.id)];
            return patch ? { ...p, ...patch, locallyEdited: true } : p;
        });
    return [...visible, ...overlay.created];
}

export const demoProductsRepository = {
    getOverlay: loadOverlay,

    /** Counts for admin metrics / notices. */
    stats() {
        const overlay = loadOverlay();
        return {
            created: overlay.created.length,
            edited: Object.keys(overlay.overrides).length,
            deleted: overlay.deleted.length,
        };
    },

    /** Merge one API product with any local edits (product detail page). */
    applyOne(product) {
        if (!product) return product;
        const overlay = loadOverlay();
        const id = Number(product.id);
        if (overlay.deleted.includes(id)) return null;
        const patch = overlay.overrides[id];
        return patch ? { ...product, ...patch, locallyEdited: true } : product;
    },

    hasLocalEdit(id) {
        const overlay = loadOverlay();
        const numId = Number(id);
        return (
            overlay.deleted.includes(numId) ||
            Object.hasOwn(overlay.overrides ?? {}, numId) ||
            overlay.created.some((p) => Number(p.id) === numId)
        );
    },

    /** Local-only product lookup (created products are not on DummyJSON). */
    getById(id) {
        const overlay = loadOverlay();
        const numId = Number(id);
        const created = overlay.created.find((p) => Number(p.id) === numId);
        if (created) return created;
        return null;
    },

    create(data) {
        const overlay = loadOverlay();
        const id = nextLocalId(overlay);
        const now = new Date().toISOString();
        const product = {
            id,
            ...pickFields(data),
            images: [],
            thumbnail: "",
            rating: 0,
            sku: `LOCAL-${id}`,
            meta: { createdAt: now, updatedAt: now, barcode: "" },
            locallyCreated: true,
        };
        overlay.created.unshift(product);
        saveOverlay(overlay);
        return product;
    },

    update(id, patch) {
        const numId = Number(id);
        const overlay = loadOverlay();
        const createdIdx = overlay.created.findIndex(
            (p) => Number(p.id) === numId,
        );
        if (createdIdx >= 0) {
            overlay.created[createdIdx] = {
                ...overlay.created[createdIdx],
                ...pickFields(patch),
                meta: {
                    ...overlay.created[createdIdx].meta,
                    updatedAt: new Date().toISOString(),
                },
            };
            saveOverlay(overlay);
            return overlay.created[createdIdx];
        }
        overlay.overrides[numId] = {
            ...(overlay.overrides[numId] ?? {}),
            ...pickFields(patch),
        };
        saveOverlay(overlay);
        return applyToProducts([
            { id: numId, ...overlay.overrides[numId] },
        ])[0];
    },

    remove(id) {
        const numId = Number(id);
        const overlay = loadOverlay();
        const before = overlay.created.length;
        overlay.created = overlay.created.filter(
            (p) => Number(p.id) !== numId,
        );
        delete overlay.overrides[numId];
        if (overlay.created.length === before && !overlay.deleted.includes(numId)) {
            overlay.deleted.push(numId);
        }
        saveOverlay(overlay);
        return true;
    },

    /** Full reset of local admin changes (demo convenience). */
    reset() {
        saveOverlay({ overrides: {}, created: [], deleted: [] });
    },

    applyTo: applyToProducts,
};
