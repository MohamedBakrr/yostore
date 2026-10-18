import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authSlice";

export const CHECKOUT_STEPS = ["contact", "shipping", "payment", "review"];

const EMPTY_DRAFT = {
    step: 0,
    contact: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
    },
    paymentMethodId: "cod",
    draftId: null, // idempotency token for duplicate-submission protection
};

const checkoutSlice = createSlice({
    name: "checkout",
    initialState: EMPTY_DRAFT,
    reducers: {
        hydrateCheckout(state, action) {
            const d = action.payload;
            if (!d) return;
            state.step = Number.isInteger(d.step)
                ? Math.min(Math.max(d.step, 0), 3)
                : 0;
            state.contact = { ...EMPTY_DRAFT.contact, ...(d.contact ?? {}) };
            state.paymentMethodId =
                d.paymentMethodId === "online" ? "online" : "cod";
            state.draftId = typeof d.draftId === "string" ? d.draftId : null;
        },
        setCheckoutStep(state, action) {
            state.step = Math.min(Math.max(Number(action.payload) || 0, 0), 3);
        },
        setCheckoutContact(state, action) {
            state.contact = { ...EMPTY_DRAFT.contact, ...action.payload };
        },
        setPaymentMethod(state, action) {
            state.paymentMethodId =
                action.payload === "online" ? "online" : "cod";
        },
        ensureDraftId(state) {
            if (!state.draftId) {
                state.draftId = `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
            }
        },
        resetCheckout(state) {
            Object.assign(state, EMPTY_DRAFT);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                // Account-scoped draft is persisted by the store subscriber.
                state.step = 0;
                state.paymentMethodId = "cod";
                state.draftId = null;
                if (action.payload?.checkout?.contact) {
                    state.contact = {
                        ...EMPTY_DRAFT.contact,
                        ...action.payload.checkout.contact,
                    };
                } else if (action.payload?.user) {
                    // Prefill from the profile when the account has one.
                    const u = action.payload.user;
                    state.contact = {
                        fullName: u.name ?? "",
                        email: u.email ?? "",
                        phone: u.phone ?? "",
                        address: u.address ?? "",
                        city: u.city ?? "",
                        postalCode: u.postalCode ?? "",
                        country: u.country ?? "",
                    };
                }
            })
            .addCase(logoutUser.fulfilled, (state) => {
                Object.assign(state, EMPTY_DRAFT);
            });
    },
});

export const {
    hydrateCheckout,
    setCheckoutStep,
    setCheckoutContact,
    setPaymentMethod,
    ensureDraftId,
    resetCheckout,
} = checkoutSlice.actions;

export const selectCheckoutDraft = (state) => state.checkout;
export default checkoutSlice.reducer;
