import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

/**
 * 404 (SPEC §18). Rendered in two contexts: inside `AppLayout` for unknown
 * routes, and standalone by the route error boundary — so it carries its own
 * background, spacing, and a working search form instead of assuming any
 * surrounding chrome.
 */
export default function NotFoundPage() {
    useDocumentTitle("Page not found", {
        description:
            "This page does not exist in the YoStore demo. Search the catalog or head back to the home page.",
    });

    const navigate = useNavigate();
    const [term, setTerm] = useState("");

    const onSubmit = (event) => {
        event.preventDefault();
        const q = term.trim();
        navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    };

    return (
        <div className="flex min-h-[60svh] flex-col items-center justify-center bg-paper px-5 py-16 text-center">
            <p className="eyebrow">Error 404</p>
            <p
                aria-hidden="true"
                className="mt-6 font-display text-[5.5rem] leading-none tracking-tight text-accent md:text-[9rem]"
            >
                404
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-3xl leading-tight text-balance-tight md:text-5xl">
                This page was never in the collection.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                The link may be old, or the address may be mistyped. Everything
                else in YoStore is still a click away — search the catalog
                below, or head back to the start.
            </p>

            <form
                onSubmit={onSubmit}
                role="search"
                aria-label="Search the store"
                className="mt-8 w-full max-w-md"
            >
                <label htmlFor="not-found-search" className="field-label">
                    Search the catalog
                </label>
                <div className="flex gap-2">
                    <input
                        id="not-found-search"
                        type="search"
                        className="field flex-1"
                        placeholder="e.g. phone, laptop, gold ring"
                        value={term}
                        onChange={(event) => setTerm(event.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" className="btn btn-primary">
                        <Search className="size-4" aria-hidden="true" />
                        Search
                    </button>
                </div>
            </form>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-muted">
                Tip: the magnifier in the site header opens the same search,
                with live results, from any page.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/" className="btn btn-primary">
                    Back to home
                </Link>
                <Link to="/shop" className="btn btn-secondary">
                    Browse the shop
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}
