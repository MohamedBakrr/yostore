import { configureStore } from "@reduxjs/toolkit";
import authReducer, { hydrateSession } from "./authSlice";
import cartReducer, { hydrateCart } from "./cartSlice";
import wishlistReducer, { hydrateWishlist } from "./wishlistSlice";
import checkoutReducer, { hydrateCheckout } from "./checkoutSlice";
import uiReducer from "./uiSlice";
import { accountRepository } from "../repositories/accountRepository";
import { discard, read, storageKeys, write } from "../utils/storage";
import {
    isValidCart,
    isValidCheckoutDraft,
    isValidSession,
    isValidWishlist,
} from "../utils/storage/validators";

const EMPTY_CART = {
    items: [],
    couponCode: null,
    shippingMethodId: "standard",
};

/** Store factory — production uses the module-level singleton, tests use this. */
export function createStore() {
    return configureStore({
        reducer: {
            auth: authReducer,
            cart: cartReducer,
            wishlist: wishlistReducer,
            checkout: checkoutReducer,
            ui: uiReducer,
        },
    });
}

export const store = createStore();

/** Account id of the active scope, or null for guest. */
export const scopeKey = (state) => state.auth.user?.id ?? null;

/* ------------------------------------------------------------------ */
/* Boot hydration — every read goes through a validator                */
/* ------------------------------------------------------------------ */

export function hydrateStore(target) {
    const session = read(storageKeys.session, isValidSession);
    let user = null;

    if (session) {
        user = accountRepository.findById(session.accountId);
        if (!user) discard(storageKeys.session); // account deleted elsewhere
    }
    if (user) target.dispatch(hydrateSession({ user }));

    const scope = scopeKey(target.getState());

    const cart = read(
        scope ? storageKeys.accountCart(scope) : storageKeys.guestCart,
        isValidCart,
        EMPTY_CART,
    );
    target.dispatch(hydrateCart(cart ?? EMPTY_CART));

    const wishlist = read(
        scope ? storageKeys.accountWishlist(scope) : storageKeys.guestWishlist,
        isValidWishlist,
        { ids: [] },
    );
    target.dispatch(hydrateWishlist(wishlist ?? { ids: [] }));

    const draft = read(
        storageKeys.checkoutDraft(scope ?? "guest"),
        isValidCheckoutDraft,
        null,
    );
    if (draft) target.dispatch(hydrateCheckout(draft));
}

/* ------------------------------------------------------------------ */
/* Persistence — account-scoped writes, deduplicated per key           */
/* ------------------------------------------------------------------ */

/**
 * Writes cart / wishlist / checkout draft to the *active* scope key.
 * The auth thunks own session and merge persistence; this subscriber keeps
 * everything else in sync as the user shops.
 *
 * @returns {Function} unsubscribe (used by tests).
 */
export function startPersistence(target) {
    const lastWritten = new Map();

    function persist(storageKeyValue, data) {
        const serialized = JSON.stringify(data);
        if (lastWritten.get(storageKeyValue) === serialized) return;
        if (write(storageKeyValue, data)) {
            lastWritten.set(storageKeyValue, serialized);
        }
    }

    return target.subscribe(() => {
        const state = target.getState();
        const scope = scopeKey(state);

        persist(
            scope ? storageKeys.accountCart(scope) : storageKeys.guestCart,
            {
                items: state.cart.items,
                couponCode: state.cart.couponCode,
                shippingMethodId: state.cart.shippingMethodId,
            },
        );

        persist(
            scope
                ? storageKeys.accountWishlist(scope)
                : storageKeys.guestWishlist,
            { ids: state.wishlist.ids },
        );

        persist(storageKeys.checkoutDraft(scope ?? "guest"), {
            step: state.checkout.step,
            contact: state.checkout.contact,
            paymentMethodId: state.checkout.paymentMethodId,
            draftId: state.checkout.draftId,
        });
    });
}
