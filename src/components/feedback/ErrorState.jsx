import { AlertTriangle, RefreshCw } from "lucide-react";
import { apiErrorMessage } from "../../utils/apiErrors";

/**
 * Retryable error state for API failures, missing resources, and route errors.
 * Copy comes from the normalized error so wording stays consistent.
 */
export default function ErrorState({
    title = "We hit a snag",
    error = null,
    message = null,
    onRetry = null,
    retryLabel = "Try again",
    className = "",
}) {
    const detail =
        message ?? (error ? apiErrorMessage(error) : null) ?? apiErrorMessage(null);

    return (
        <div
            role="alert"
            className={`flex flex-col items-center justify-center border border-hair bg-surface px-6 py-14 text-center ${className}`}
        >
            <AlertTriangle className="mb-5 size-7 text-accent" aria-hidden="true" />
            <h2 className="mb-2 font-display text-2xl text-balance-tight">
                {title}
            </h2>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">
                {detail}
            </p>
            {onRetry ? (
                <button type="button" className="btn btn-primary" onClick={onRetry}>
                    <RefreshCw className="size-4" aria-hidden="true" />
                    {retryLabel}
                </button>
            ) : null}
        </div>
    );
}
