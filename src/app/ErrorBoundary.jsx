import { Component } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import ErrorState from "../components/feedback/ErrorState";
import NotFoundPage from "../pages/not-found/NotFoundPage";

/**
 * Application-level render error boundary.
 *
 * Shows a branded recovery screen — never a stack trace or internal details.
 * Route-level failures are handled by `RouteErrorBoundary` (router errorElement).
 */
export class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        // Diagnostics stay in the console (dev + prod alike); the UI stays clean.
        console.error("YoStore render error:", error, info?.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex min-h-svh flex-col items-center justify-center bg-paper px-6">
                    <div className="w-full max-w-lg">
                        <h1 className="mb-2 font-display text-3xl">
                            Something broke on this page
                        </h1>
                        <p className="mb-8 text-sm text-muted">
                            The rest of the store is likely fine. Reload to
                            recover, or head back to the homepage.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                Reload the store
                            </button>
                            <Link to="/" className="btn btn-secondary">
                                Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

/** Router `errorElement`: catches loader/render failures inside the tree. */
export function RouteErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error) && error.status === 404) {
        return <NotFoundPage />;
    }

    return (
        <div className="flex min-h-svh items-center justify-center bg-paper px-6 py-16">
            <div className="w-full max-w-lg">
                <ErrorState
                    title="This page ran into trouble"
                    message="Something went wrong while loading this view. Try again, or return to the homepage."
                    onRetry={() => window.location.reload()}
                    retryLabel="Reload"
                />
                <div className="mt-4 text-center">
                    <Link to="/" className="link-underline text-sm text-muted">
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AppErrorBoundary;
