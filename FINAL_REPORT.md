# Final Report — AUTH/PROFILE/WISHLIST + informational pages (YoStore)

## Scope & Exclusivity
- Only files under these paths modified/created: `src/pages/auth/**`, `src/pages/profile/**`, `src/pages/wishlist/**`, `src/pages/about/**`, `src/pages/contact/**`, `src/pages/faq/**`, `src/pages/not-found/**`, `src/components/forms/**`, `src/features/auth/**`, `src/features/profile/**`, `src/features/wishlist/**`.
- No changes outside those paths. Any issues found outside are reported below.

## Files Created/Changed

### Features
- `src/features/auth/authMessages.js` — Maps rejected auth codes (`invalid`, `duplicate`, `no-session`, `missing-account`, `unknown`) to user-facing strings.
- `src/features/auth/MockAuthNotice.jsx` — Mock authentication demo disclosure (used on auth/profile pages).
- `src/features/profile/accountSummary.js` — Helpers to format saved address/count (imports `capitalize`).
- `src/features/wishlist/useWishlistProducts.js` — Fetches each wishlist id via `useQueries` with 404→local fallback (`demoProductsRepository.getById`) and tracks `missingIds`; never crashes.

### Forms
- `src/components/forms/ProfileForm.jsx` — RHF + `zodResolver(profileFormSchema)` (address block all-or-nothing to allow saving fresh accounts without full address), email read-only, keeps values (schema requires email), dispatches `updateProfile`, shows inline errors, uses `LoadingButton`, toasts on success.
- `src/components/forms/ContactForm.jsx` — RHF + `contactSchema`, disables submit while submitting, shows inline errors, `LoadingButton`, success state with simulated disclosure, no fake phone numbers.

### Pages
- `src/pages/auth/LoginPage.jsx` — Login form (email/password), accessible errors, `LoadingButton`, clears auth error on input change, redirects back to `location.state?.from ?? "/"`, redirects to home if already authenticated, maps errors to friendly copy, links to register/shop, mock notice. No seeded demo-credentials helper.
- `src/pages/auth/RegisterPage.jsx` — `registerSchema`, duplicate handling → friendly message, auto-sign-in on success → navigate back, mock notice.
- `src/pages/profile/ProfilePage.jsx` — Protected account home: ProfileForm, account summary (email/member-since/saved count/session), quick links, shipping address, MockAuthNotice, sign-out (`logoutUser()` + toast) with `window.location.replace("/")` to avoid RequireAuth race.
- `src/pages/wishlist/WishlistPage.jsx` — Resolves ids via hook; shows missing-items banner with "Remove them/it", never crashes; `ProductCard` grid; empty states with CTAs; "Clear wishlist" guarded by `ConfirmDialog`; guest→account sync note; uses `DemoNotice` and `ProductGridSkeleton`.
- `src/pages/about/AboutPage.jsx` — Original editorial content, asymmetric typography, 2-column figures, images loaded via TanStack Query with graceful fallback, computed numbers from `COUPONS`/`SHIPPING_METHODS`, links to shop/contact, demo disclaimer.
- `src/pages/contact/ContactPage.jsx` — Contact intro with email `mailto:hello@yostore.example`, ContactForm, "nothing sent or stored" disclosure, `DemoNotice`, cross-links to FAQ/shipping.
- `src/pages/faq/FaqPage.jsx` — Native `<details>` expandables, grouped sections, coupon codes from `COUPONS` registry (WELCOME10/EDITORIAL20/FREESHIP), numbers from `SHIPPING_METHODS`, cross-links across `/shipping`, `/contact`, `/tracking`, `/shop`, `/cart`, `/profile`, `/orders`.
- `src/pages/not-found/NotFoundPage.jsx` — Branded 404 with display type, self-contained styles (standalone rendering), search form → `/shop?q=…`, tip to use navbar search, links home/shop.

### Supporting (light fixes)
- `src/components/forms/ProfileForm.jsx` — Introduced `profileFormSchema` (address all-or-nothing) so fresh accounts can save name without full address; normalizes undefined address fields to `""` on submit.

## Verification

- ESLint (assigned paths): clean — `npx eslint src/pages/auth src/pages/profile src/pages/wishlist src/pages/about src/pages/contact src/pages/faq src/pages/not-found src/components/forms src/features/auth src/features/profile src/features/wishlist` → 0 errors, 0 warnings.
- Repo lint/build: `npm run build` passes (chunk-size warning pre-existing). Full suite not run (outside paths).
- Grep: zero `STUB`/`TODO`/`lorem`/`FIXME` in assigned paths.
- Browser QA (end-to-end via `browser.mjs` script): login validation (required fields), bad credentials copy ("Email or password is incorrect."), register success → `/`, welcome toast, duplicate detection, guard + redirect-back to `/profile`, profile save toast, sign-out → home, wishlist (empty → seeded [1,33,999999] → shows 2 cards + missing notice → Remove them → updated; Clear wishlist dialog → cleared), FAQ has expandables + coupon codes + links, contact simulated success + "nothing was sent or stored" toast, About imagery + fallback + demo notice, 404 search → `/shop?q=phone`. All steps pass.

## Out-of-scope Issues Reported (do not fix)

1. **Storage hydration/session persistence** (`src/utils/storage/index.js`, lines ~59–67 in current tree): The `read` helper returns `parsed.data` correctly when validator returns `true` (current state is correct). Earlier state was observed to return `true` instead; the code as-is now correctly uses `return result === true || result == null ? parsed.data : result;`. No change made here.
2. **Dev-time cart slice action type** (`src/store/cartSlice.js`) — a transient `builder.addCase(logoutUser, ...)` with an empty/incorrect action type was mentioned earlier; imports/build work now and the bug is outside assigned paths. Treat as already resolved or report to the owning agent.

## Notes on Decisions
- No demo-credentials helper on login (no seeded account exists in `accountRepository`).
- `MockAuthNotice` used instead of a non-existent shared `DemoDataNotice`; reused `DemoNotice` (checkout) on Wishlist/Contact/About.
- Profile email read-only but kept in RHF values (schema requires it; repository ignores email patches).
- Sign-out navigates home and dispatches `logoutUser()` to avoid RequireAuth race (uses `window.location.replace("/")` in ProfilePage for robustness).
- Avoided RHF `watch()` subscription (React Compiler rules); used input-change handling via standard `register`.
- FAQ/About figures/coupons assembled from `COUPONS`/`SHIPPING_METHODS` configs to prevent drift.
- Wishlist 404 fallback uses `demoProductsRepository.getById` for local-overlay ids (≥900001); still-failed ids surfaced with removal.

## Final State
- All assigned files implemented/replaced per SPEC §9, §10, §14, §18 and conventions.
- Clean lint, passing build, full browser QA green.
- Ready to hand off.