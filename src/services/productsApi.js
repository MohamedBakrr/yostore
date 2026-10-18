import { getJson } from "./httpClient";

const PAGE_SIZE = 12;
export { PAGE_SIZE };

function isProductArray(data) {
    return Array.isArray(data?.products) && Number.isFinite(data?.total);
}

function isProduct(data) {
    return (
        data &&
        typeof data === "object" &&
        Number.isFinite(Number(data.id)) &&
        typeof data.title === "string"
    );
}

/**
 * Product service modules. Network details live here — never in components.
 * Every call accepts TanStack Query's abort `signal` for cancellation.
 */
export const productsApi = {
    /** Paginated listing with optional server-side sorting. */
    async getProducts({
        page = 1,
        limit = PAGE_SIZE,
        sortBy,
        order,
        signal,
    } = {}) {
        const skip = Math.max(0, (page - 1) * limit);
        return getJson("/products", {
            params: { limit, skip, sortBy, order },
            signal,
            validate: isProductArray,
        });
    },

    /** Full catalog in one request — used only by client-side filter pipelines (SPEC §7.4). */
    async getCatalog({ sortBy, order, signal } = {}) {
        return getJson("/products", {
            params: { limit: 200, sortBy, order },
            signal,
            validate: isProductArray,
        });
    },

    async getProduct(id, { signal } = {}) {
        return getJson(`/products/${encodeURIComponent(id)}`, {
            signal,
            validate: isProduct,
        });
    },

    async searchProducts({
        q = "",
        page = 1,
        limit = PAGE_SIZE,
        sortBy,
        order,
        signal,
    } = {}) {
        const skip = Math.max(0, (page - 1) * limit);
        return getJson("/products/search", {
            params: { q, limit, skip, sortBy, order },
            signal,
            validate: isProductArray,
        });
    },

    async getCategoryProducts(
        slug,
        { page = 1, limit = PAGE_SIZE, sortBy, order, signal } = {},
    ) {
        const skip = Math.max(0, (page - 1) * limit);
        return getJson(`/products/category/${encodeURIComponent(slug)}`, {
            params: { limit, skip, sortBy, order },
            signal,
            validate: isProductArray,
        });
    },
};

export const categoriesApi = {
    async getCategories({ signal } = {}) {
        return getJson("/products/categories", {
            signal,
            validate: (data) =>
                Array.isArray(data) &&
                data.every(
                    (c) =>
                        c &&
                        typeof c.slug === "string" &&
                        typeof c.name === "string",
                ),
        });
    },
};
