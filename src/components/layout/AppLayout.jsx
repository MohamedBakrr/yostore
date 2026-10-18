import { useEffect, Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { useAppDispatch } from "../../store/hooks";
import { closeAllOverlays } from "../../store/uiSlice";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import RouteFallback from "./RouteFallback";
import CartDrawer from "../navigation/CartDrawer";
import SearchOverlay from "../navigation/SearchOverlay";
import MobileNavigation from "../navigation/MobileNavigation";

/**
 * Primary storefront shell: announcement bar, sticky nav, page outlet with a
 * restrained transition, footer, and the global overlays (cart, search,
 * mobile nav). Overlays close automatically when the route changes.
 */
export default function AppLayout() {
    const dispatch = useAppDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(closeAllOverlays());
    }, [dispatch, location.pathname, location.search]);

    return (
        <div className="flex min-h-svh flex-col bg-paper">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
            >
                Skip to content
            </a>

            <AnnouncementBar />
            <Navbar />

            <main id="main-content" className="flex-1">
                <Suspense fallback={<RouteFallback />}>
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </Suspense>
            </main>

            <Footer />

            <CartDrawer />
            <SearchOverlay />
            <MobileNavigation />
        </div>
    );
}
