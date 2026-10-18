import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { accountRepository } from "../repositories/accountRepository";
import { storageKeys, read, write, discard } from "../utils/storage";
import { mergeCartItems, mergeWishlistIds } from "../features/cart/merge";

/* ------------------------------------------------------------------ */
/* Scope helpers — guest vs account-scoped persistence                 */
/* ------------------------------------------------------------------ */

const emptyCart = { items: [], couponCode: null, shippingMethodId: "standard" };

function loadScopedCart(accountId) {
    const k = accountId
        ? storageKeys.accountCart(accountId)
        : storageKeys.guestCart;
    return read(k, (d) => (d && Array.isArray(d.items) ? d : false), emptyCart);
}

function persistScopedCart(accountId, cart) {
    const k = accountId
        ? storageKeys.accountCart(accountId)
        : storageKeys.guestCart;
    write(k, cart);
}

function loadScopedWishlist(accountId) {
    const k = accountId
        ? storageKeys.accountWishlist(accountId)
        : storageKeys.guestWishlist;
    return read(k, (d) => (d && Array.isArray(d.ids) ? d : false), { ids: [] });
}

function persistScopedWishlist(accountId, wishlist) {
    const k = accountId
        ? storageKeys.accountWishlist(accountId)
        : storageKeys.guestWishlist;
    write(k, wishlist);
}

/* ------------------------------------------------------------------ */
/* Async thunks — mock registration / login with guest-cart merging    */
/* ------------------------------------------------------------------ */

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (payload, { rejectWithValue }) => {
        const result = await accountRepository.createAccount(payload);
        if (!result.ok) return rejectWithValue(result.error);
        // New accounts start with the current guest data (SPEC §10 merge behavior).
        const guestCart = loadScopedCart(null);
        const guestWishlist = loadScopedWishlist(null);
        const session = {
            accountId: result.account.id,
            email: result.account.email,
            name: result.account.name,
            createdAt: new Date().toISOString(),
        };
        write(storageKeys.session, session);
        persistScopedCart(result.account.id, guestCart);
        persistScopedWishlist(result.account.id, guestWishlist);
        discard(storageKeys.guestCart);
        discard(storageKeys.guestWishlist);
        return {
            user: result.account,
            cart: guestCart,
            wishlist: guestWishlist,
        };
    },
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        const result = await accountRepository.verifyCredentials(
            email,
            password,
        );
        if (!result.ok) return rejectWithValue(result.error);

        const account = result.account;
        // 1-2. Load and validate both scopes.
        const accountCart = loadScopedCart(account.id);
        const guestCart = loadScopedCart(null);
        const accountWishlist = loadScopedWishlist(account.id);
        const guestWishlist = loadScopedWishlist(null);

        // 3-4. Merge duplicates by summing quantities (clamped in mergeCartItems).
        const mergedCart = {
            items: mergeCartItems(accountCart.items, guestCart.items),
            couponCode: accountCart.couponCode ?? guestCart.couponCode ?? null,
            shippingMethodId: accountCart.shippingMethodId ?? "standard",
        };
        const mergedWishlist = {
            ids: mergeWishlistIds(accountWishlist.ids, guestWishlist.ids),
        };

        // 5-6. Persist the merged account state.
        const cartOk = persistScopedCart(account.id, mergedCart);
        persistScopedWishlist(account.id, mergedWishlist);

        // 7. Only clear the guest cart after the merge persisted successfully.
        if (cartOk !== false) {
            discard(storageKeys.guestCart);
            discard(storageKeys.guestWishlist);
        }

        const session = {
            accountId: account.id,
            email: account.email,
            name: account.name,
            createdAt: new Date().toISOString(),
        };
        write(storageKeys.session, session);
        return { user: account, cart: mergedCart, wishlist: mergedWishlist };
    },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    // Guest scope starts fresh for the next visitor — no account leakage.
    discard(storageKeys.session);
    write(storageKeys.guestCart, emptyCart);
    write(storageKeys.guestWishlist, { ids: [] });
    return true;
});

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (patch, { getState, rejectWithValue }) => {
        const accountId = getState().auth.user?.id;
        if (!accountId) return rejectWithValue("no-session");
        const updated = accountRepository.updateProfile(accountId, patch);
        if (!updated) return rejectWithValue("missing-account");
        return updated;
    },
);

/* ------------------------------------------------------------------ */
/* Slice                                                               */
/* ------------------------------------------------------------------ */

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        status: "idle", // idle | loading | authenticated (user non-null implies authenticated)
        error: null,
    },
    reducers: {
        /** Synchronous boot hydration from a persisted session. */
        hydrateSession(state, action) {
            if (action.payload?.user) {
                state.user = action.payload.user;
                state.status = "authenticated";
                state.error = null;
            }
        },
        clearAuthError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = "authenticated";
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload ?? "unknown";
            })
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "authenticated";
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload ?? "unknown";
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.status = "idle";
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { hydrateSession, clearAuthError } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export {
    loadScopedCart,
    persistScopedCart,
    loadScopedWishlist,
    persistScopedWishlist,
};

export default authSlice.reducer;
