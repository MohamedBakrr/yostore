import { Suspense } from "react";
import { Outlet, Link } from "react-router";
import RouteFallback from "./RouteFallback";

/**
 * Minimal shell for login/registration: brand mark, no storefront chrome.
 * Keeps the way back to the store one click away.
 */
export default function AuthLayout() {
    return (
        <div className="flex min-h-svh flex-col bg-paper">
            <header className="page-frame flex h-16 items-center justify-between md:h-20">
                <Link
                    to="/"
                    className="font-display text-xl tracking-tight md:text-2xl"
                    aria-label="YoStore home"
                >
                    Yo<span className="text-accent">Store</span>
                </Link>
                <Link to="/shop" className="link-underline text-sm text-muted">
                    Back to the store
                </Link>
            </header>

            <main
                id="main-content"
                className="flex flex-1 items-center justify-center px-5 py-10"
            >
                <div className="w-full max-w-md">
                    <Suspense fallback={<RouteFallback />}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>

            <footer className="page-frame py-6 text-center text-xs text-muted">
                YoStore is a demonstration storefront — mock accounts only, no
                real identities verified.
            </footer>
        </div>
    );
}
