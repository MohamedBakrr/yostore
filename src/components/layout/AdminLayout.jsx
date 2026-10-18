import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import AdminSidebar from "../admin/AdminSidebar";
import RouteFallback from "./RouteFallback";

/**
 * Shell for the frontend-only demo dashboard. The route is guarded by
 * `RequireAuth` in the router — a navigation convenience that is explicitly
 * *not* server-side authorization (stated in the UI and README).
 */
export default function AdminLayout() {
    const location = useLocation();

    return (
        <div className="flex min-h-svh flex-col bg-paper lg:flex-row">
            <AdminSidebar />
            <main
                id="main-content"
                className="flex-1 overflow-x-hidden bg-paper"
            >
                <Suspense fallback={<RouteFallback />}>
                    <Outlet key={location.pathname} />
                </Suspense>
            </main>
        </div>
    );
}
