import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authSlice";

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: { ids: [] },
    reducers: {
        hydrateWishlist(state, action) {
            state.ids = Array.isArray(action.payload?.ids)
                ? action.payload.ids.map(Number)
                : [];
        },
        toggleWishlist(state, action) {
            const id = Number(action.payload);
            if (!Number.isFinite(id)) return;
            const idx = state.ids.indexOf(id);
            if (idx >= 0) state.ids.splice(idx, 1);
            else state.ids.unshift(id);
        },
        removeWishlistItem(state, action) {
            state.ids = state.ids.filter((i) => i !== Number(action.payload));
        },
        clearWishlist(state) {
            state.ids = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.ids = action.payload?.wishlist?.ids ?? [];
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.ids = [];
            });
    },
});

export const {
    hydrateWishlist,
    toggleWishlist,
    removeWishlistItem,
    clearWishlist,
} = wishlistSlice.actions;
export const selectWishlistIds = (state) => state.wishlist.ids;
export const selectIsWishlisted = (id) => (state) =>
    state.wishlist.ids.includes(Number(id));

export default wishlistSlice.reducer;
