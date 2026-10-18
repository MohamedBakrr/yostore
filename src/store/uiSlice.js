import { createSlice } from "@reduxjs/toolkit";

/**
 * Shared overlay state. Kept in Redux (instead of scattered contexts) because
 * the cart drawer, search overlay, and mobile navigation are opened from many
 * unrelated components across every layout.
 */
const uiSlice = createSlice({
    name: "ui",
    initialState: {
        cartDrawerOpen: false,
        searchOpen: false,
        mobileNavOpen: false,
    },
    reducers: {
        openCartDrawer(state) {
            state.cartDrawerOpen = true;
            state.searchOpen = false;
            state.mobileNavOpen = false;
        },
        closeCartDrawer(state) {
            state.cartDrawerOpen = false;
        },
        toggleCartDrawer(state) {
            state.cartDrawerOpen = !state.cartDrawerOpen;
        },
        openSearch(state) {
            state.searchOpen = true;
            state.cartDrawerOpen = false;
            state.mobileNavOpen = false;
        },
        closeSearch(state) {
            state.searchOpen = false;
        },
        openMobileNav(state) {
            state.mobileNavOpen = true;
            state.cartDrawerOpen = false;
            state.searchOpen = false;
        },
        closeMobileNav(state) {
            state.mobileNavOpen = false;
        },
        closeAllOverlays(state) {
            state.cartDrawerOpen = false;
            state.searchOpen = false;
            state.mobileNavOpen = false;
        },
    },
});

export const {
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    openSearch,
    closeSearch,
    openMobileNav,
    closeMobileNav,
    closeAllOverlays,
} = uiSlice.actions;

export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectMobileNavOpen = (state) => state.ui.mobileNavOpen;

export default uiSlice.reducer;
