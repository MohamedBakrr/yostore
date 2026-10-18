# YoStore — Engineering Conventions (read before writing code)

Companion to `SPEC.md`. The spec defines **what**; this file defines **how it
already works** so every module stays consistent. The foundation (stores,
services, providers, layouts, shared components) is complete and must be
treated as read-only unless your task explicitly says otherwise.

Commands: `npm run dev` · `npm run build` · `npm run lint` · `npm run test`.
Stack: React 19, Vite 8, React Router 8 (`react-router`), Tailwind CSS **v4**
(CSS-first — no `tailwind.config.js`), MUI 9, Redux Toolkit 2, TanStack Query 5,
Axios, React Hook Form 7 + Zod 4, Motion 14 (`motion/react`), lucide-react.
JavaScript + ES modules only. **No new dependencies.**

---

## 1. File ownership

Only touch files inside your assigned paths. Never edit: `src/styles/main.css`,
`src/app/*`, `src/store/*`, `src/providers/*`, `src/services/*`, `src/utils/*`,
`src/hooks/*` (existing files), shared components you don't own, `package.json`,
`vite.config.js`, `index.html`. If you genuinely need a shared change, note it
in your final report instead of editing.

Pre-built shared components (import, don't modify):

- `components/layout/*` — AppLayout, AuthLayout, AdminLayout, Navbar, Footer,
  AnnouncementBar, PageTransition, ScrollToTop, RouteFallback
- `components/navigation/*` — CartDrawer, SearchOverlay, MobileNavigation
- `components/feedback/*` — ErrorState, EmptyState, ConfirmDialog,
  LoadingButton, InlineValidationError, Skeletons (`ProductSkeleton`,
  `ProductGridSkeleton`, `RowSkeleton`, `PageSkeleton`, `SkeletonBlock`)
- `components/products/ProductCard|ProductGrid|ProductPrice|RatingDisplay|Pagination|QuickViewDialog`
- `components/cart/CartItem`
- `components/admin/AdminSidebar`

Page files ship with an intentional **STUB** header comment. Replace the whole
file with the real implementation. Search your files for "STUB" before you
finish — zero may remain.

## 2. Design system (Tailwind v4 + CSS variables)

Tokens live in `src/styles/main.css` on `:root` / `.dark`, mapped to Tailwind
via `@theme inline`. Use utilities, never hard-coded colors:

- Surfaces: `bg-paper` (page), `bg-surface` (cards/drawers), `bg-sunken`
  (wells, placeholders), `border-hair`, `border-hair-strong`
- Text: `text-ink` (primary), `text-ink-soft`, `text-muted`
- Accent: `text-accent`, `bg-accent`, `text-accent-contrast`
- Status: `text|bg-success|danger|warning` + `*-tint` backgrounds
- Type: `font-display` (Fraunces — headings), body is Inter (`font-sans`
  default). `eyebrow` utility for uppercase micro-labels. Headings h1→h3 in
  display serif, hierarchical sizes (no random text sizes).
- Layout: `page-frame` (max-w 1440 + gutters), `rule-t`/`rule-b` hairlines,
  `text-balance-tight`, `hide-scrollbar`
- Controls (use these classes, do not restyle buttons/inputs from scratch):
  `.btn` + `.btn-primary|secondary|inverse|ghost|danger` + `.btn-sm|.btn-block`,
  `.icon-btn` (+ `.badge-count`), `.field` + `.field-label`, `.link-underline`,
  `.card-flat`, `.chip`
- Shadows: `shadow-float` only for overlays (dialogs/dropdowns/toasts)
- Spacing rhythm: 8-based (gap-4/gap-6/gap-10…); sections typically
  `py-16 md:py-24` inside `page-frame`

Design rules: editorial ≠ uniform. Vary section layouts (full-bleed imagery,
asymmetric grids, big type moments). No pill-UI everywhere, no gratuitous
gradients/glass/blobs, no centered-hero-and-card-grid on every section, small
radii only (cards are square-edged). Borders over shadows.

MUI is allowed for: Dialog, Drawer, Stepper, Autocomplete, Select/FormControl,
Tooltip, data tables. Everything else is Tailwind. MUI theme already mirrors
the CSS tokens — never pass conflicting sx colors.

## 3. Theming & motion

- Dark mode = `.dark` on `<html>`, driven by `useTheme()` from
  `providers/ThemeProvider` (`{ theme, setTheme, toggleTheme, tokens }`).
  Every surface must look deliberate in both themes (use tokens, not literals).
- Toasts: `useToast()` from `providers/ToastProvider` →
  `notify(message, "success" | "error" | "info")`.
- Motion: `import { motion, useReducedMotion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react"`.
  Use Motion for hero pointer/parallax, scroll reveals (whileInView with
  `viewport={{ once: true, margin }}`), and section entrances — not for every
  element. Respect reduced motion (gate pointer effects; content must be fully
  visible without animation). Pointer effects must use motion values + springs
  on `transform` (never React state per pointermove). Hover reveals must also
  work on `:focus-within` and stay visible on touch/small screens.

## 4. Data fetching (Axios + TanStack Query)

```js
import { productsApi, categoriesApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { apiErrorMessage, isApiError, isCancelled } from "../../utils/apiErrors";
```

- Always pass TanStack Query's `signal` into services for cancellation.
- Query keys: `queryKeys.products(params)`, `queryKeys.search(params)`,
  `queryKeys.category(slug, params)`, `queryKeys.product(id)`,
  `queryKeys.related(category, excludeId)`, `queryKeys.categories`,
  `queryKeys.catalog(sortBy, order)`.
- `productsApi`: `getProducts({page,limit,sortBy,order,signal})`,
  `searchProducts({q,page,limit,sortBy,order,signal})`,
  `getCategoryProducts(slug,{page,limit,sortBy,order,signal})`,
  `getProduct(id,{signal})`, `getCatalog({sortBy,order,signal})`;
  `PAGE_SIZE = 12`. Responses: `{products, total, skip, limit}`.
- Category page endpoint responds **404 for unknown category** → handle as
  "unknown category" state (client errors are `retryable: false`).
- Product id must be numeric (`/^\d+$/`); invalid → render the not-found state.
  Local admin-created products (ids ≥ 900001) are NOT on DummyJSON: after a
  404 from `productsApi.getProduct`, check
  `demoProductsRepository.getById(id)` from `src/repositories/demoProductsRepository`
  before giving up (this is how locally created demo products open).
- UI states everywhere: loading (skeletons), error (`ErrorState` with
  `onRetry={refetch}`), empty (`EmptyState` with an action), success.
- Never fetch a whole catalog for pagination — paginate server-side with
  `limit`/`skip`/`total` (client-side catalog filters are allowed only for
  small cross-page refinement like price ranges on a fetched page — prefer URL
  state + server params; document choices).

## 5. State (Redux) — shared slices are done

```js
import { useAppDispatch, useAppSelector } from "../../store/hooks";
```

- **cart**: `addItem({product, quantity})`, `setQuantity({id, quantity})`,
  `removeItem(id)`, `clearCart()`, `setCoupon(code)`, `removeCoupon()`,
  `setShippingMethod(id)`, selectors `selectCartItems`, `selectCartCount`,
  `selectCouponCode`, `selectShippingMethodId`.
- **wishlist**: `toggleWishlist(id)`, `removeWishlistItem(id)`,
  `selectWishlistIds`, `selectIsWishlisted(id)`.
- **auth**: thunks `loginUser({email,password})`, `registerUser({name,email,password})`,
  `logoutUser()`, `updateProfile(patch)`; selectors `selectUser`,
  `selectIsAuthenticated`, `selectAuthError`, `selectAuthStatus`;
  `clearAuthError()`. Rejected payloads: `"duplicate"`, `"invalid"`,
  `"no-session"`, `"missing-account"` — map to friendly copy.
- **checkout**: `setCheckoutStep(n)`, `setCheckoutContact(fields)`,
  `setPaymentMethod("cod"|"online")`, `ensureDraftId()`, `resetCheckout()`,
  `hydrateCheckout`, `CHECKOUT_STEPS`.
- **ui**: `openCartDrawer/closeCartDrawer`, `openSearch/closeSearch`,
  `openMobileNav/closeMobileNav`, `closeAllOverlays`.
- Persistence is automatic: a store subscriber writes cart/wishlist/checkout to
  the correct guest-or-account key. **Never** write those keys directly.
  Session, merge-on-login, and logout isolation are handled by auth thunks.

## 6. Money, coupons, orders

- Format with `formatCurrency` / `formatDate` / `formatDateTime` from
  `src/utils/formatting` — never `toFixed` ad hoc.
- All totals from `useCartTotals()` (`hooks/useCartTotals`) or
  `computeTotals({items, couponCode, shippingMethodId})` from
  `src/utils/pricing`. `unitPriceFor(price, discountPercentage)` = what the
  customer pays; `price` is the list price.
- Coupons: `validateCoupon(code, subtotal)` + `couponErrorMessage(result)` from
  `src/utils/pricing/coupons`. Display coupon logic as demo behavior.
- Shipping: `SHIPPING_METHODS` (standard/express/pickup), `getShippingMethod`.
- Orders: build with `buildOrder({...})` and persist via `ordersRepository`
  from `src/repositories/ordersRepository` (`listByAccount`, `getByOrder`,
  `findByOrderId` (any scope, for tracking/success), `save`, `updateStatus`,
  `listAll`, `ORDER_STATUSES`). Timeline entries are `simulated: true` — the UI
  must label demo/simulated state.

## 7. Forms (React Hook Form + Zod)

Schemas are prebuilt in `src/utils/validation/schemas` (`loginSchema`,
`registerSchema`, `addressSchema`/`checkoutContactSchema`, `profileSchema`,
`contactSchema`, `newsletterSchema`, `adminProductSchema`).
Use `zodResolver` from `@hookform/resolvers/zod`. Every input:

```jsx
<input id={name} {...register(name)} className="field" aria-invalid={!!errors[name]}
  aria-describedby={errors[name] ? `${name}-error` : undefined} />
<InlineValidationError id={`${name}-error`}>{errors[name]?.message}</InlineValidationError>
```

Label via `<label className="field-label" htmlFor={name}>`. Submit buttons use
`LoadingButton` (prevents double submission).

## 8. Routing & pages

Routes (all exist in `src/app/router.jsx`): `/`, `/shop`, `/shop/:category`,
`/product/:id`, `/cart`, `/checkout`, `/checkout/success/:orderId`,
`/wishlist`, `/auth/login`, `/auth/register`, `/profile`, `/orders`,
`/orders/:orderId`, `/shipping`, `/tracking`, `/about`, `/contact`, `/faq`,
`/admin[/products|/orders]`, `*`.

- Every page: `useDocumentTitle("Title", { description: "…" })` (unique per
  route). One `h1` per page, logical heading order.
- Shareable state (q, category, sort, page, price range) lives in URL search
  params (`useSearchParams`); keep `search`, `filters`, `sort`, `pagination`
  synced and recover from invalid values (e.g. `page=abc` → 1).
- Protected pages: already wrapped by `RequireAuth`; login reads
  `location.state.from` to redirect back — implement that read in LoginPage.
- Never link to a route that doesn't exist. Every button does something real.

## 9. Accessibility (must pass review)

Semantic landmarks, one h1, labeled controls, `aria-invalid` + `role="alert"`
errors, visible focus (never `outline-none` without replacement), 44px touch
targets for primary controls, `alt` text for meaningful images (`alt=""` for
decorative), dialogs/drawers labeled, status updates via `notify()` (live
region) — no color-only or motion-only signals.

## 10. Quality bar before you finish

1. `npm run build` passes. 2. `npm run lint` passes. 3. No `STUB` comments
left in your files. 4. No dead links, fake buttons, lorem ipsum, or
`TODO`. 5. Both themes checked (token usage). 6. Reduced-motion safe.
7. Loading + empty + error + success states all implemented. 8. Demo/simulated
nature labeled where behavior is faked (payments, tracking, reviews, coupons,
auth).
