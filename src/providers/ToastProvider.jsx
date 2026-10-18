/* eslint-disable react-refresh/only-export-components -- the toast hook must ship with its provider. */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

let toastSeq = 0;

const TONE_STYLES = {
    success: "border-l-success bg-success-tint",
    error: "border-l-danger bg-danger-tint",
    info: "border-l-accent bg-accent-tint",
};

/**
 * Lightweight, accessible toast system.
 *
 * The container is a polite live region so additions are announced without
 * stealing focus. Toasts never carry information that is not also available in
 * the page itself.
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const notify = useCallback(
        (message, tone = "info", { duration = 4200, action } = {}) => {
            const id = (toastSeq += 1);
            setToasts((list) => [
                ...list.slice(-2),
                { id, message: String(message ?? ""), tone, action },
            ]);
            const timer = setTimeout(() => {
                setToasts((list) => list.filter((t) => t.id !== id));
                timers.current.delete(id);
            }, duration);
            timers.current.set(id, timer);
            return id;
        },
        [],
    );

    const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="pointer-events-none fixed inset-x-3 bottom-3 z-[120] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
                role="status"
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={[
                            "pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-hair border-l-4 bg-surface px-4 py-3 text-sm shadow-float",
                            TONE_STYLES[toast.tone] ?? TONE_STYLES.info,
                        ].join(" ")}
                    >
                        <p className="flex-1 text-ink">{toast.message}</p>
                        {toast.action}
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            className="mt-0.5 text-muted transition-colors hover:text-ink"
                            aria-label="Dismiss notification"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
