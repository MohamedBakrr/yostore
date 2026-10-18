import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PackageSearch, Plus, RotateCcw, Search } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useDebounce } from "../../hooks/useDebounce";
import { useCategories } from "../../hooks/useCategories";
import { PAGE_SIZE, productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { isApiError } from "../../utils/apiErrors";
import { useToast } from "../../providers/ToastProvider";
import { demoProductsRepository } from "../../repositories/demoProductsRepository";
import { useDemoOverlay } from "../../features/admin/useDemoOverlay";
import DemoDataNotice from "../../components/admin/DemoDataNotice";
import ProductManagementTable from "../../components/admin/ProductManagementTable";
import ProductFormDialog from "../../components/admin/ProductFormDialog";
import ConfirmDialog from "../../components/feedback/ConfirmDialog";
import EmptyState from "../../components/feedback/EmptyState";
import ErrorState from "../../components/feedback/ErrorState";
import { RowSkeleton } from "../../components/feedback/Skeletons";
import Pagination from "../../components/products/Pagination";

function parsePage(value) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * `/admin/products` — a DummyJSON page fetched server-side, merged with the
 * local demo overlay at read time (deletes filtered, edits overridden, local
 * creations appended). Search lives in `?q=`, the category in `?category=`,
 * pagination in `?page=`; the two filters are mutually exclusive because the
 * catalog API offers no combined search+category endpoint.
 */
export default function AdminProductsPage() {
    useDocumentTitle("Manage products", {
        description:
            "Create, edit, hide, and reset demo products in YoStore's local admin overlay — a frontend-only demonstration.",
    });

    const { notify } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const overlay = useDemoOverlay();
    const categoriesQuery = useCategories();
    const categories = categoriesQuery.data;

    const urlQ = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "";
    const page = parsePage(searchParams.get("page"));

    /** Merge a patch into the URL search params. Filter edits reset `page`. */
    const updateParams = useCallback(
        (updates, { replace = true } = {}) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    for (const [param, value] of Object.entries(updates)) {
                        if (value === null || value === undefined || value === "") {
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

    /* --- search: local input, debounced into the URL ------------------- */
    const [searchDraft, setSearchDraft] = useState(urlQ);
    const syncedQ = useRef(urlQ);

    // External URL changes (deep links, back/forward) refresh the input.
    useEffect(() => {
        if (urlQ === syncedQ.current) return;
        syncedQ.current = urlQ;
        setSearchDraft(urlQ);
    }, [urlQ]);

    const debouncedQ = useDebounce(searchDraft.trim(), 350);

    useEffect(() => {
        if (debouncedQ === syncedQ.current) return;
        syncedQ.current = debouncedQ;
        updateParams(
            debouncedQ
                ? { q: debouncedQ, category: null, page: null }
                : { q: null, page: null },
        );
    }, [debouncedQ, updateParams]);

    // Deep links may carry both filters — search wins, drop the category.
    useEffect(() => {
        if (urlQ && category) updateParams({ category: null, page: null });
    }, [urlQ, category, updateParams]);

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        setSearchDraft("");
        syncedQ.current = "";
        updateParams({ category: value, page: null, q: null });
    };

    const clearFilters = () => {
        setSearchDraft("");
        syncedQ.current = "";
        updateParams({ q: null, category: null, page: null });
    };

    /* --- catalog query ------------------------------------------------- */
    const listParams = {
        page,
        limit: PAGE_SIZE,
        ...(debouncedQ ? { q: debouncedQ } : {}),
        ...(category ? { category } : {}),
    };
    const queryKey = debouncedQ
        ? queryKeys.search(listParams)
        : category
          ? queryKeys.category(category, listParams)
          : queryKeys.products(listParams);

    const productsQuery = useQuery({
        queryKey,
        queryFn: ({ signal }) => {
            if (debouncedQ) {
                return productsApi.searchProducts({
                    q: debouncedQ,
                    page,
                    limit: PAGE_SIZE,
                    signal,
                });
            }
            if (category) {
                return productsApi.getCategoryProducts(category, {
                    page,
                    limit: PAGE_SIZE,
                    signal,
                });
            }
            return productsApi.getProducts({ page, limit: PAGE_SIZE, signal });
        },
        placeholderData: keepPreviousData,
    });

    const data = productsQuery.data;
    // applyTo re-reads the overlay on every render, so a mutation (which
    // updates overlay stats state) re-merges without touching the cache.
    const products = data
        ? demoProductsRepository.applyTo(data.products)
        : [];

    const totalPages = data
        ? Math.max(1, Math.ceil(Number(data.total) / PAGE_SIZE))
        : 1;

    // Recover from an out-of-range ?page= (e.g. a stale deep link).
    useEffect(() => {
        if (data && page > totalPages) {
            updateParams({ page: totalPages > 1 ? String(totalPages) : null });
        }
    }, [data, page, totalPages, updateParams]);

    const isUnknownCategory =
        productsQuery.isError &&
        Boolean(category) &&
        isApiError(productsQuery.error) &&
        productsQuery.error.status === 404;

    /* --- overlay mutations --------------------------------------------- */
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [confirmReset, setConfirmReset] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditing(null);
    };

    const handleSave = (values) => {
        const result = editing
            ? overlay.update(editing.id, values)
            : overlay.create(values);
        if (!result.ok) {
            notify(
                "Couldn't save the demo product — browser storage may be unavailable.",
                "error",
            );
            return { ok: false };
        }
        notify(
            editing
                ? `“${values.title}” updated in the local demo overlay.`
                : `“${values.title}” created as a local demo product (not on DummyJSON).`,
            "success",
        );
        closeDialog();
        return { ok: true };
    };

    const handleDelete = () => {
        const target = deleting;
        if (!target) return;
        const result = overlay.remove(target.id);
        if (!result.ok) {
            notify(
                "Couldn't update the demo overlay — browser storage may be unavailable.",
                "error",
            );
            return;
        }
        notify(
            target.locallyCreated
                ? `“${target.title}” removed from the local demo overlay.`
                : `“${target.title}” hidden in this browser — DummyJSON still has it.`,
            "success",
        );
        setDeleting(null);
    };

    const handleReset = () => {
        const result = overlay.reset();
        if (!result.ok) {
            notify(
                "Couldn't reset the overlay — browser storage may be unavailable.",
                "error",
            );
            return;
        }
        notify(
            "Local product changes reset — showing the plain DummyJSON catalog.",
            "success",
        );
        setConfirmReset(false);
    };

    const deleteMessage = deleting
        ? deleting.locallyCreated
            ? `“${deleting.title}” exists only in this browser's demo overlay. Deleting removes it for good — it is not on DummyJSON.`
            : `“${deleting.title}” will be hidden in this browser's local overlay. The public DummyJSON dataset keeps the product — local actions never modify it.`
        : "";

    const hasFilters = Boolean(debouncedQ || category);
    const { stats, hasChanges, storageAvailable } = overlay;

    return (
        <div className="page-frame py-10 md:py-14">
            <p className="eyebrow">Admin (demo)</p>
            <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                Products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Create, edit, and hide products in the local demo overlay. The
                listing below is a live DummyJSON page merged with your local
                changes at read time.
            </p>

            <DemoDataNotice className="mt-6" />

            {!storageAvailable ? (
                <p
                    role="alert"
                    className="mt-4 border border-hair border-l-4 border-l-danger bg-danger-tint px-4 py-3 text-sm leading-relaxed text-ink"
                >
                    Browser storage is unavailable (private browsing or a
                    blocked storage API). Changes will appear while this tab is
                    open but cannot be saved.
                </p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="chip">
                    {hasChanges
                        ? `Local overlay: ${stats.created} created · ${stats.edited} edited · ${stats.deleted} hidden`
                        : "Local overlay: no changes"}
                </span>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setConfirmReset(true)}
                    disabled={!hasChanges}
                >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Reset local changes
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={openCreate}
                >
                    <Plus className="size-4" aria-hidden="true" />
                    New product
                </button>
            </div>

            <div className="mt-6 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)_auto]">
                <div>
                    <label
                        className="field-label"
                        htmlFor="admin-products-search"
                    >
                        Search catalog
                    </label>
                    <input
                        id="admin-products-search"
                        type="search"
                        className="field"
                        placeholder="Search by title…"
                        value={searchDraft}
                        onChange={(event) => setSearchDraft(event.target.value)}
                    />
                </div>
                <div>
                    <label
                        className="field-label"
                        htmlFor="admin-products-category"
                    >
                        Category
                    </label>
                    <select
                        id="admin-products-category"
                        className="field"
                        value={category}
                        disabled={categoriesQuery.isPending}
                        onChange={handleCategoryChange}
                    >
                        <option value="">
                            {categoriesQuery.isPending
                                ? "Loading categories…"
                                : "All categories"}
                        </option>
                        {(categories ?? []).map((item) => (
                            <option key={item.slug} value={item.slug}>
                                {item.name}
                            </option>
                        ))}
                        {categoriesQuery.isSuccess &&
                        category &&
                        !(categories ?? []).some(
                            (item) => item.slug === category,
                        ) ? (
                            <option value={category}>
                                {category} (unknown)
                            </option>
                        ) : null}
                    </select>
                </div>
                <p className="text-sm text-muted sm:col-span-2 lg:col-span-1 lg:text-right">
                    {data
                        ? `${products.length} shown · ${data.total} on DummyJSON`
                        : "Loading catalog…"}
                    {productsQuery.isFetching && !productsQuery.isPending
                        ? " · updating…"
                        : ""}
                </p>
            </div>

            {productsQuery.isPending ? (
                <div
                    className="mt-6 border border-hair bg-surface px-4"
                    role="status"
                    aria-label="Loading products"
                >
                    {Array.from({ length: 6 }, (_, index) => (
                        <RowSkeleton key={index} />
                    ))}
                </div>
            ) : productsQuery.isError ? (
                isUnknownCategory ? (
                    <EmptyState
                        className="mt-6"
                        icon={Search}
                        title="Unknown category"
                        description={`“${category}” is not a category on the DummyJSON catalog.`}
                        action={
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    updateParams({ category: null, page: null })
                                }
                            >
                                Clear category filter
                            </button>
                        }
                    />
                ) : (
                    <ErrorState
                        className="mt-6"
                        title="Couldn't load the catalog"
                        error={productsQuery.error}
                        onRetry={() => productsQuery.refetch()}
                        retryLabel="Try again"
                    />
                )
            ) : products.length === 0 && hasFilters ? (
                <EmptyState
                    className="mt-6"
                    icon={Search}
                    title="No products match these filters"
                    description="Try a different search term or clear the category filter."
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
            ) : products.length === 0 ? (
                <EmptyState
                    className="mt-6"
                    icon={PackageSearch}
                    title="The catalog is empty"
                    description="DummyJSON returned no products for this page — or they are all hidden in your local overlay."
                    action={
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={openCreate}
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            New demo product
                        </button>
                    }
                />
            ) : (
                <>
                    <div className="mt-6">
                        <ProductManagementTable
                            products={products}
                            onEdit={openEdit}
                            onDelete={setDeleting}
                        />
                    </div>
                    <Pagination
                        className="mt-8"
                        page={page}
                        totalPages={totalPages}
                        onChange={(next) =>
                            updateParams(
                                { page: next > 1 ? String(next) : null },
                                { replace: false },
                            )
                        }
                        disabled={productsQuery.isFetching}
                    />
                    <p className="mt-4 text-center text-xs leading-relaxed text-muted">
                        Page {page} of {totalPages} · {PAGE_SIZE} products per
                        page from DummyJSON
                        {stats.created > 0
                            ? ` · ${stats.created} local demo product${stats.created === 1 ? "" : "s"} appended (visible on every page)`
                            : ""}
                    </p>
                </>
            )}

            <ProductFormDialog
                open={dialogOpen}
                product={editing}
                categories={categories}
                onClose={closeDialog}
                onSubmit={handleSave}
            />

            <ConfirmDialog
                open={Boolean(deleting)}
                title={deleting ? `Delete “${deleting.title}”?` : "Delete?"}
                message={deleteMessage}
                confirmLabel="Remove product"
                cancelLabel="Cancel"
                destructive
                onCancel={() => setDeleting(null)}
                onConfirm={handleDelete}
            />

            <ConfirmDialog
                open={confirmReset}
                title="Reset local product changes?"
                message="This discards every local creation, edit, and hidden product in this browser, restoring the plain DummyJSON catalog. This cannot be undone."
                confirmLabel="Reset local changes"
                cancelLabel="Keep changes"
                destructive
                onCancel={() => setConfirmReset(false)}
                onConfirm={handleReset}
            />
        </div>
    );
}
