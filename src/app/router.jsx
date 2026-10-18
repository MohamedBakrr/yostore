/* eslint-disable react-refresh/only-export-components -- route configuration and guard components intentionally live together in the router module. */
import { lazy } from "react";
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ScrollToTop from "../components/layout/ScrollToTop";
import { RouteErrorBoundary } from "./ErrorBoundary";
import { useAppSelector } from "../store/hooks";
import { selectIsAuthenticated } from "../store/authSlice";

/* Eager: first paint of the landing page, the primary Shop CTA, and the 404
 * page (also rendered by the route error boundary). */
import HomePage from "../pages/home/HomePage";
import ShopPage from "../pages/shop/ShopPage";
import NotFoundPage from "../pages/not-found/NotFoundPage";

/* Everything else lazy-loads with a skeleton fallback. */
const ProductPage = lazy(() => import("../pages/product/ProductPage"));
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const ContactPage = lazy(() => import("../pages/contact/ContactPage"));
const FaqPage = lazy(() => import("../pages/faq/FaqPage"));
const CartPage = lazy(() => import("../pages/cart/CartPage"));
const WishlistPage = lazy(() => import("../pages/wishlist/WishlistPage"));
const CheckoutPage = lazy(() => import("../pages/checkout/CheckoutPage"));
const OrderSuccessPage = lazy(
    () => import("../pages/checkout/OrderSuccessPage"),
);
const ShippingPage = lazy(() => import("../pages/shipping/ShippingPage"));
const TrackingPage = lazy(() => import("../pages/tracking/TrackingPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const OrderHistoryPage = lazy(() => import("../pages/orders/OrderHistoryPage"));
const OrderDetailPage = lazy(() => import("../pages/orders/OrderDetailPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const AdminDashboardPage = lazy(
    () => import("../pages/admin/AdminDashboardPage"),
);
const AdminProductsPage = lazy(
    () => import("../pages/admin/AdminProductsPage"),
);
const AdminOrdersPage = lazy(() => import("../pages/admin/AdminOrdersPage"));

/**
 * Client-side route protection. This is a *navigation mechanism* only —
 * everything it guards lives in the browser and is not authorized securely.
 * The intended destination survives the redirect via `location.state.from`.
 */
function RequireAuth({ children }) {
    const authenticated = useAppSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!authenticated) {
        return (
            <Navigate
                to="/auth/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }
    return children;
}

/** Root element: global scroll restoration + nested layouts. */
function RootLayout() {
    return (
        <>
            <ScrollToTop />
            <Outlet />
        </>
    );
}

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { index: true, element: <HomePage /> },
                    { path: "shop", element: <ShopPage /> },
                    { path: "shop/:category", element: <ShopPage /> },
                    { path: "product/:id", element: <ProductPage /> },
                    { path: "about", element: <AboutPage /> },
                    { path: "contact", element: <ContactPage /> },
                    { path: "faq", element: <FaqPage /> },
                    { path: "cart", element: <CartPage /> },
                    { path: "wishlist", element: <WishlistPage /> },
                    { path: "checkout", element: <CheckoutPage /> },
                    {
                        path: "checkout/success/:orderId",
                        element: <OrderSuccessPage />,
                    },
                    { path: "shipping", element: <ShippingPage /> },
                    { path: "tracking", element: <TrackingPage /> },
                    {
                        path: "profile",
                        element: (
                            <RequireAuth>
                                <ProfilePage />
                            </RequireAuth>
                        ),
                    },
                    {
                        path: "orders",
                        element: (
                            <RequireAuth>
                                <OrderHistoryPage />
                            </RequireAuth>
                        ),
                    },
                    {
                        path: "orders/:orderId",
                        element: (
                            <RequireAuth>
                                <OrderDetailPage />
                            </RequireAuth>
                        ),
                    },
                    { path: "*", element: <NotFoundPage /> },
                ],
            },
            {
                element: <AuthLayout />,
                children: [
                    { path: "auth/login", element: <LoginPage /> },
                    { path: "auth/register", element: <RegisterPage /> },
                ],
            },
            {
                element: (
                    <RequireAuth>
                        <AdminLayout />
                    </RequireAuth>
                ),
                children: [
                    { path: "admin", element: <AdminDashboardPage /> },
                    { path: "admin/products", element: <AdminProductsPage /> },
                    { path: "admin/orders", element: <AdminOrdersPage /> },
                ],
            },
        ],
    },
]);
