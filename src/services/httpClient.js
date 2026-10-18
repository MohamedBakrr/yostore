import axios from "axios";
import { ApiError, ERROR_KINDS } from "../utils/apiErrors";

/**
 * Centralized Axios instance. All DummyJSON traffic goes through here so that
 * timeouts, base URL, and error normalization stay consistent.
 */
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://dummyjson.com",
    timeout: 12000,
    headers: { Accept: "application/json" },
});

/** Convert any Axios failure into a normalized ApiError. */
export function normalizeApiError(error) {
    if (error instanceof ApiError) return error;

    if (
        axios.isCancel?.(error) ||
        error?.code === "ERR_CANCELED" ||
        error?.name === "CanceledError"
    ) {
        return new ApiError(ERROR_KINDS.cancelled, {
            message: "Request cancelled.",
            retryable: false,
            cause: error,
        });
    }

    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
        return new ApiError(ERROR_KINDS.timeout, {
            message: "Request timed out.",
            retryable: true,
            cause: error,
        });
    }

    const status = error?.response?.status;
    if (typeof status === "number") {
        if (status >= 400 && status < 500) {
            return new ApiError(ERROR_KINDS.client, {
                status,
                message: `Request failed with status ${status}.`,
                retryable: false,
                cause: error,
            });
        }
        return new ApiError(ERROR_KINDS.server, {
            status,
            message: `Server error ${status}.`,
            retryable: true,
            cause: error,
        });
    }

    // No response at all — DNS failure, offline, CORS, etc.
    return new ApiError(ERROR_KINDS.network, {
        message: "Network unreachable.",
        retryable: true,
        cause: error,
    });
}

http.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normalizeApiError(error)),
);

/** Strip empty/undefined params so URLs stay predictable. */
export function safeParams(params = {}) {
    const out = {};
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        out[k] = v;
    }
    return out;
}

/**
 * GET json with optional cancellation. Throws normalized ApiError and
 * additionally guards against structurally invalid payloads.
 */
export async function getJson(url, { params, signal, validate } = {}) {
    const response = await http.get(url, {
        params: safeParams(params),
        signal,
    });
    const data = response?.data;
    if (typeof validate === "function" && !validate(data)) {
        throw new ApiError(ERROR_KINDS.malformed, {
            message: "Unexpected response shape from the products API.",
            retryable: true,
        });
    }
    return data;
}
