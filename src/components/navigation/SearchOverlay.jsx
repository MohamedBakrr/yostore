import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { ArrowRight, Search as SearchIcon, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { closeSearch, selectSearchOpen } from "../../store/uiSlice";
import { productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency } from "../../utils/formatting";
import { RowSkeleton } from "../feedback/Skeletons";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";

const RESULT_LIMIT = 6;

/**
 * Search overlay: debounced live results (obsolete requests are cancelled via
 * TanStack Query's abort signal) plus an explicit "search all products" submit.
 */
export default function SearchOverlay() {
    const open = useAppSelector(selectSearchOpen);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [term, setTerm] = useState("");
    const debounced = useDebounce(term.trim(), 300);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const close = () => dispatch(closeSearch());

    const { data, isPending, isError, refetch } = useQuery({
        queryKey: queryKeys.search({ q: debounced, limit: RESULT_LIMIT }),
        queryFn: ({ signal }) =>
            productsApi.searchProducts({
                q: debounced,
                limit: RESULT_LIMIT,
                signal,
            }),
        enabled: open && debounced.length > 0,
        staleTime: 60 * 1000,
    });

    const results = useMemo(() => (data?.products ?? []).slice(0, RESULT_LIMIT), [data]);

    const submit = (event) => {
        event.preventDefault();
        const q = term.trim();
        if (!q) return;
        close();
        navigate(`/shop?q=${encodeURIComponent(q)}`);
    };

    const goToProduct = () => close();

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="md"
            aria-label="Search the store"
            slotProps={{
                paper: {
                    className: "mt-16 md:mt-24",
                    sx: { border: "1px solid", borderColor: "divider" },
                },
            }}
        >
            <DialogContent className="p-0">
                <form onSubmit={submit} role="search" className="flex items-center gap-3 border-b border-hair px-5 py-4">
                    <SearchIcon className="size-5 shrink-0 text-muted" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Search products, categories…"
                        aria-label="Search products"
                        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
                    />
                    <button
                        type="button"
                        onClick={close}
                        className="icon-btn -mr-2 shrink-0"
                        aria-label="Close search"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </form>

                <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                    {term.trim().length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted">
                            Type to search across the catalog.
                        </p>
                    ) : isPending ? (
                        <div role="status" aria-label="Searching">
                            {Array.from({ length: 3 }, (_, i) => (
                                <RowSkeleton key={i} />
                            ))}
                        </div>
                    ) : isError ? (
                        <ErrorState
                            compact
                            className="border-0"
                            title="Search failed"
                            onRetry={refetch}
                            retryLabel="Retry search"
                        />
                    ) : results.length === 0 ? (
                        <EmptyState
                            compact
                            icon={SearchIcon}
                            title={`No matches for “${debounced}”`}
                            description="Try a different word, or browse the full catalog."
                            action={
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        close();
                                        navigate("/shop");
                                    }}
                                >
                                    Browse all products
                                </button>
                            }
                        />
                    ) : (
                        <>
                            <ul>
                                {results.map((product) => (
                                    <li key={product.id}>
                                        <Link
                                            to={`/product/${product.id}`}
                                            onClick={goToProduct}
                                            className="flex items-center gap-4 border-b border-hair py-3 transition-colors hover:text-accent last:border-b-0"
                                        >
                                            <span className="size-12 shrink-0 overflow-hidden bg-sunken">
                                                {product.thumbnail ? (
                                                    <img
                                                        src={product.thumbnail}
                                                        alt=""
                                                        className="size-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : null}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-display text-sm">
                                                    {product.title}
                                                </span>
                                                <span className="block text-xs text-muted capitalize">
                                                    {String(product.category ?? "").replaceAll("-", " ")}
                                                </span>
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="submit"
                                className="mt-4 flex w-full items-center justify-center gap-2 border border-hair py-3 text-sm font-semibold text-ink transition-colors hover:border-ink"
                            >
                                See all results for “{debounced}”
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
