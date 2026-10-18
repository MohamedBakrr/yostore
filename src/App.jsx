import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { store } from "./store";
import { queryClient } from "./app/queryClient";
import { router } from "./app/router";
import AppErrorBoundary from "./app/ErrorBoundary";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ToastProvider } from "./providers/ToastProvider";

/**
 * Provider order (outer → inner):
 * Redux → TanStack Query → theme (CSS vars + MUI) → toasts → error boundary →
 * router. Every layout and page can reach all of them.
 */
export default function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        <AppErrorBoundary>
                            <RouterProvider router={router} />
                        </AppErrorBoundary>
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
}
