import { createSlice } from "@reduxjs/toolkit";
import { clampQuantity } from "../features/cart/merge";
import { loginUser, logoutUser } from "./authSlice";

const EMPTY_CART = {
    items: [],
    couponCode: null,
    shippingMethodId: "standard",
};

const cartSlice = createSlice({
    name: "cart",
    initialState: EMPTY_CART,
    reducers: {
        /** Restore persisted cart at boot. */
        hydrateCart(state, action) {
            const persisted = action.payload;
            if (!persisted) return;
            state.items = persisted.items ?? [];
            state.couponCode = persisted.couponCode ?? null;
            state.shippingMethodId = persisted.shippingMethodId ?? "standard";
        },
        addItem(state, action) {
            const product = action.payload.product;
            const quantity = action.payload.quantity ?? 1;
            const id = Number(product.id);
            if (!Number.isFinite(id)) return;
            const existing = state.items.find((i) => i.id === id);
            if (existing) {
                existing.quantity = clampQuantity(
                    existing.quantity + quantity,
                    product.stock,
                );
            } else {
                state.items.unshift({
                    id,
                    title: product.title,
                    price: Number(product.price) || 0,
                    discountPercentage: Number(product.discountPercentage) || 0,
                    thumbnail: product.thumbnail ?? product.images?.[0] ?? null,
                    stock: Number.isFinite(Number(product.stock))
                        ? Number(product.stock)
                        : null,
                    quantity: clampQuantity(quantity, product.stock),
                });
            }
        },
        setQuantity(state, action) {
            const { id, quantity } = action.payload;
            const item = state.items.find((i) => i.id === Number(id));
            if (!item) return;
            if (quantity <= 0) {
                state.items = state.items.filter((i) => i.id !== Number(id));
                return;
            }
            item.quantity = clampQuantity(quantity, item.stock);
        },
        removeItem(state, action) {
            state.items = state.items.filter(
                (i) => i.id !== Number(action.payload),
            );
        },
        clearCart(state) {
            state.items = [];
            state.couponCode = null;
        },
        setCoupon(state, action) {
            state.couponCode = action.payload;
        },
        removeCoupon(state) {
            state.couponCode = null;
        },
        setShippingMethod(state, action) {
            state.shippingMethodId = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Account-scoped hydration on login (merge result computed in the thunk).
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                const cart = action.payload?.cart;
                state.items = cart?.items ?? [];
                state.couponCode = cart?.couponCode ?? null;
                state.shippingMethodId = cart?.shippingMethodId ?? "standard";
            })
            .addCase(logoutUser.fulfilled, (state) => {
                // Account data must never leak to the next visitor.
                state.items = [];
                state.couponCode = null;
                state.shippingMethodId = "standard";
            });
    },
});

export const {
    hydrateCart,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    setCoupon,
    removeCoupon,
    setShippingMethod,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCouponCode = (state) => state.cart.couponCode;
export const selectShippingMethodId = (state) => state.cart.shippingMethodId;
export const selectCartCount = (state) =>
    state.cart.items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);

export default cartSlice.reducer;
