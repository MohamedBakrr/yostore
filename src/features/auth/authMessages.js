/**
 * Friendly copy for the rejected payloads produced by the auth thunks
 * (`src/store/authSlice.js`). The codes are stable strings; anything
 * unexpected falls back to a generic message so raw codes never reach the UI.
 */

export const AUTH_ERROR_MESSAGES = {
    invalid: "Email or password is incorrect.",
    duplicate:
        "An account with that email already exists in this browser. Sign in instead, or use a different address.",
    "no-session":
        "Your demo session has ended. Sign in again to pick up where you left off.",
    "missing-account":
        "We could not find that account in this browser's demo storage. It may have been created in a different browser or removed.",
    unknown: "Something went wrong. Please try again.",
};

/** Maps an auth error code (or `null`) to displayable copy. */
export function authErrorMessage(code) {
    return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.unknown;
}

export default authErrorMessage;
