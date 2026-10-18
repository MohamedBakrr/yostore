/**
 * Normalized API error. Every Axios failure passes through `normalizeApiError`
 * so UI code can branch on `kind` without knowing Axios internals.
 */

export const ERROR_KINDS = {
    network: "network",
    timeout: "timeout",
    cancelled: "cancelled",
    client: "client", // 4xx — permanent, never retried
    server: "server", // 5xx — transient, retryable
    malformed: "malformed", // response shape was not what we expected
};

export class ApiError extends Error {
    constructor(
        kind,
        {
            status = null,
            message = "Something went wrong.",
            retryable = false,
            cause,
        } = {},
    ) {
        super(message);
        this.name = "ApiError";
        this.kind = kind;
        this.status = status;
        this.retryable = retryable;
        if (cause) this.cause = cause;
    }
}

/** User-facing copy for each error kind. */
export function apiErrorMessage(error) {
    switch (error?.kind) {
        case ERROR_KINDS.network:
            return "We could not reach the store. Check your connection and try again.";
        case ERROR_KINDS.timeout:
            return "The store took too long to respond. Please try again.";
        case ERROR_KINDS.client:
            return "We could not load that. It may no longer be available.";
        case ERROR_KINDS.server:
            return "The store is having trouble right now. Please try again shortly.";
        case ERROR_KINDS.malformed:
            return "We received an unexpected response from the store. Please try again.";
        default:
            return "Something went wrong. Please try again.";
    }
}

export function isApiError(error) {
    return error instanceof ApiError;
}

export function isCancelled(error) {
    return (
        error?.kind === ERROR_KINDS.cancelled ||
        error?.name === "CanceledError" ||
        error?.name === "AbortError"
    );
}
