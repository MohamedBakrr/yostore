# YoStore — Finalized Specification

> Status: **Finalized.** Implementation must not begin until explicitly authorized.
> This document is the single source of truth for implementation. It refines the
> approved master specification with decisions verified against the actual
> repository state and the npm registry (verified October 2026).

---

## 1. Role and Objective

Build **YoStore**, a complete, modern, editorial-style e-commerce frontend with a
distinctive visual identity, an immersive interactive landing page, and fully
connected shopping workflows. It must feel like a thoughtfully art-directed
commercial product — not a generic template.

The application must be coherent, maintainable, responsive, accessible, and
well-tested: functional navigation, real product data from DummyJSON, reliable
client-side state, persistent demo workflows, meaningful loading/error states,
and carefully designed motion.

Frontend-only. Real API data (DummyJSON) must be clearly distinguished from
locally persisted demonstration data and simulated operations everywhere they
surface in the UI and documentation.

---

## 2. Repository Baseline (verified, not assumed)

The working directory contains a **fresh Vite + React scaffold** with no
application code:

| Item | State |
| --- | --- |
| Framework | React 19.2.8 (JSX, ESM, `"type": "module"`) |
| Build | Vite 8.3.x + `@vitejs/plugin-react` 6.x |
| Lint | ESLint 10 flat config (`eslint.config.js`), react-hooks v7, react-refresh |
| Package manager | **npm** (`package-lock.json` present) — do not switch |
| Existing source | Template boilerplate only: `src/App.jsx`, `src/App.css`, `src/index.css`, `src/main.jsx`, `src/assets/` |
| Git | Not a repository (do not init unless asked) |
| Runtime | Node v24.21.0, npm 11.19.0 |

Preserve the existing toolchain (Vite, ESLint flat config, npm). Template
boilerplate files (`App.jsx`, `App.css`, template `index.css`, template
`README.md`) are scaffolding to be **replaced** during implementation — this is
expected, not destruction of user work. `index.html` is edited in place (title,
meta, theme-boot script).

---

## 3. Verified Dependency Matrix

All versions below were verified against the npm registry and are mutually
peer-compatible with the installed React 19.2.8 / Vite 8.3 / Node 24 toolchain.
Use these majors; do not substitute TypeScript or alternative frameworks.

### Runtime dependencies

| Package | Version | Notes (verified) |
| --- | --- | --- |
| `react`, `react-dom` | `^19.2.8` (installed) | Leave as-is |
| `react-router` | `^8.4.0` | **Single package — do NOT install `react-router-dom` (removed in v8).** ESM-only. Requires React ≥19.2.7, Node ≥22.22 (satisfied). `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `Navigate`, `useNavigate`, `useParams`, `useSearchParams`, `useLocation` all import from `"react-router"`. Data-router `RouterProvider` would come from `"react-router/dom"` — we use declarative mode, so it is not needed. |
| `@mui/material` | `^9.5.0` | Current major; React 17/18/19 peers satisfied. Requires Emotion peers (below). Before building MUI-backed components (Dialog, Drawer, Stepper, form controls), verify the installed v9 docs/migration notes shipped in `node_modules/@mui/material` — v8/v9 breaking changes are outside this spec's knowledge; adjust with the smallest compatible change. |
| `@emotion/react`, `@emotion/styled` | `^11.14.0`, `^11.14.1` | Required MUI peers |
| `tailwindcss`, `@tailwindcss/vite` | `^4.3.3` | **Tailwind v4 — CSS-first configuration.** No `tailwind.config.js`, no PostCSS config; the Vite plugin auto-detects content. See §4.1. |
| `axios` | `^1.20.0` | Central instance in `src/services/` |
| `motion` | `^14.3.0` | Import from `"motion/react"`. `AnimatePresence`, `useReducedMotion`, `MotionConfig`, `useScroll`, `useTransform`, `useSpring`, `useMotionValue`, `useInView` all come from `"motion/react"`. |
| `@reduxjs/toolkit` | `^2.13.0` | Bundles `redux`; do not add `redux` directly |
| `react-redux` | `^9.3.0` | |
| `@tanstack/react-query` | `^5.104.3` | v5 API (`useQuery`, `useInfiniteQuery` not required — page-based pagination) |
| `react-hook-form` | `^7.90.0` | |
| `@hookform/resolvers` | `^5.9.2` | `zodResolver` supports Zod v4 ✓ |
| `zod` | `^4.6.7` | |
| `lucide-react` | `^1.59.0` | Named icon exports |
| `@fontsource-variable/fraunces` | `^5.3.0` | Self-hosted variable display serif (editorial headline face) |
| `@fontsource-variable/inter` | `^5.3.0` | Self-hosted variable text sans |

### Dev dependencies (added)

| Package | Version | Notes (verified) |
| --- | --- | --- |
| `vitest` | `^5.0.5` | Peer: Vite `^6.4 \|\| ^7 \|\| ^8` ✓ |
| `@vitest/coverage-v8` | `^5.0.5` | Released in lockstep with vitest (exact-version peers) — keep both carets in sync |
| `jsdom` | `^30.1.3` | Test environment |
| `@testing-library/react` | `^16.3.3` | |
| `@testing-library/dom` | `^10.4.2` | Explicit peer of RTL 16 |
| `@testing-library/jest-dom` | `^7.0.1` | |
| `@testing-library/user-event` | `^14.6.8` | |
| `@playwright/test` | `^1.64.1` | |

Keep the existing dev dependencies (`vite`, `@vitejs/plugin-react`, `eslint`,
plugins, `@types/react*`). The `@types/*` packages are harmless in a JS project
and are peers of MUI/RTL — leave them.

**Deliberately not added:** MSW or `axios-mock-adapter` (API tests use Axios
custom-adapter injection and `vi.mock` of service modules — §14.1),
`@mui/icons-material` (Lucide covers icons), `clsx`/`tailwind-merge` only if a
concrete need appears, any CSS-in-JS library beyond Emotion (MUI's requirement).

---

## 4. Technical Conventions (version-specific, mandatory)

### 4.1 Tailwind CSS v4

- Single entry: `src/styles/main.css` imported from `src/main.jsx`:

  ```css
  @import "tailwindcss";
  @import "@fontsource-variable/fraunces";
  @import "@fontsource-variable/inter";
  ```

- Design tokens in `@theme { ... }` (see §5). Color/surface tokens reference CSS
  custom properties defined on `:root` / `.dark` so both themes share one token
  map.
- Class-based dark mode via custom variant (v4 defaults to media query — override):

  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```

- No `tailwind.config.js`, no `@tailwind base` directives, no v3 instructions.

### 4.2 React Router v8

- Import everything from `"react-router"` (§3). Never import `react-router-dom`.
- Declarative mode: `<BrowserRouter>` at the app root; nested `<Routes>`.
- Lazy routes via `React.lazy` + `<Suspense>`; route-level code splitting is the
  splitting mechanism (not router loaders).

### 4.3 Material UI v9

- MUI is used only where it earns its place: `Dialog`/`Drawer` (focus trap,
  scroll lock, a11y built in), `Stepper` (checkout), accessible form controls
  (`TextField`, `Select`, `RadioGroup`, `Checkbox`), `Badge`, `Snackbar` is NOT
  used (custom `ToastProvider` instead), `Table` for admin.
- Theme tokens are derived from the same CSS custom properties as Tailwind
  (§17) so both systems switch themes together.
- Do not apply Tailwind utility classes to MUI component internals; style MUI
  via `sx` and its theme. Do not fight specificity between the two systems.

### 4.4 Motion v14

- All imports from `"motion/react"`.
- Global `<MotionConfig reducedMotion="user">` wraps the app.
- Pointer/parallax effects use `useMotionValue` + `useSpring` + `useTransform`
  writing to `transform` only — never `setState` per pointer event, never
  animating layout properties. Pointer listeners throttled via
  `requestAnimationFrame`. Disabled when `prefers-reduced-motion` is set or the
  primary input is coarse (touch).

### 4.5 Vitest 5

- Config inline in `vite.config.js` (import `defineConfig` from `"vitest/config"`):
  `environment: "jsdom"`, `setupFiles: ["./src/tests/setup.js"]`, `css: false`.
- Setup file registers `@testing-library/jest-dom` and RTL `cleanup`.

### 4.6 Forms

- React Hook Form + `zodResolver` (from `@hookform/resolvers/zod`) with Zod v4
  schemas in `src/utils/validation/` (or co-located per feature).
- Schemas are shared between forms and pure-logic tests.

### 4.7 SPA fallback

- Add minimal `vercel.json` (`{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`)
  and `netlify.toml` (`[[rewrites]] from="/*" to="/index.html"`) so direct
  navigation and refresh work on either platform. Harmless defaults; documented
  in README.

---

## 5. Design Philosophy, Brand Identity, and Tokens

Original visual identity inspired by the *quality and interaction ambition* of
getartcraft.com — **without** copying its brand, assets, layout, or distinctive
compositions.

Combines: editorial typography with clear hierarchy; large art-directed product
photography; asymmetric layouts and intentional whitespace; strong composition
and rhythm; refined 1px borders, restrained shadows, consistent spacing;
purposeful contrast and accent use; deliberately designed light and dark themes;
one visual system across storefront, checkout, account, and admin.

**Forbidden patterns:** repeated centered-heading+card-grid sections; excessive
rounding and pill controls; gradient/glassmorphism/blob abuse; shadows as default
separation; random floating elements; uniform layouts without editorial
variation; arbitrary colors; inconsistent icon sizes/spacing; motion for its own
sake; empty sections; placeholder buttons; dead-end navigation.

### Design tokens (`src/styles/tokens.css` + `@theme`)

| Category | Tokens |
| --- | --- |
| Color | `--color-primary` (ink), `--color-accent` (signature editorial red/orange), `--color-surface`, `--color-surface-raised`, `--color-surface-sunken`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-muted`, `--color-danger`, `--color-success`, `--color-warning` — separate values for `:root` (light) and `.dark` |
| Typography | Display: **Fraunces Variable** (`font-display`); Text/UI: **Inter Variable** (`font-sans`). Weights: 400/500/600/700 (Inter), 400/500/600/900 + optical sizing (Fraunces). Type scale: `--text-xs` … `--text-8xl` with tight display leading (0.95–1.05) and comfortable body leading (1.5–1.7) |
| Spacing | Tailwind default scale + `--space-section` (section vertical rhythm) |
| Layout | `--container-max` (1440px), `--container-prose` (72ch), full-bleed allowed for editorial bands |
| Borders/radii | 1px hairlines; radii: `--radius-none` (editorial default), `--radius-sm` (2px), `--radius-md` (4px). No large radii by default |
| Shadows | 2–3 restrained elevations only (drawer/dialog); cards use borders, not shadows |
| Focus | `--focus-ring`: 2px accent outline + 2px offset, `:focus-visible` only |
| Motion | `--duration-fast` (120ms), `--duration-base` (220ms), `--duration-slow` (480ms); easings: `--ease-out-expo`, `--ease-in-out-quint`, spring configs for Motion |
| Layering | z-scale: base 0, header 100, drawer 200, dialog 300, toast 400, hero elements (scoped) |

Fonts load via Fontsource (self-hosted, no external font CDN — no FOUT from
third parties, works offline and in tests).

---

## 6. Application Routing

React Router v8, three shared layouts, lazy-loaded route components with
suspense fallbacks, app-level error boundary, and URL search params for
shareable discovery state.

### Storefront (`AppLayout`)

- `/` — Home
- `/shop` — Shop
- `/shop/:category` — Category listing
- `/product/:id` — Product details
- `/about`, `/contact`, `/faq`
- `*` — branded 404

### Shopping (`AppLayout`, cart/checkout guarded)

- `/cart` — Cart
- `/checkout` — Multi-step checkout (protected)
- `/checkout/success/:orderId` — Order confirmation (protected)
- `/wishlist` — Wishlist

### Auth & account (`AuthLayout` for auth pages; `AppLayout` for account)

- `/auth/login`, `/auth/register`
- `/profile` (protected), `/orders` (protected), `/orders/:orderId` (protected)

### Shipping

- `/shipping` — policy
- `/tracking` — demo order tracking

### Admin (`AdminLayout`)

- `/admin` — demo dashboard (protected; requires mock login)

### Routing requirements

- `React.lazy` for all route components except Home (Home stays eager — it is the
  landing destination); each lazy route has a branded loading fallback.
- Application-level `ErrorBoundary` wraps the router outlet; route-level error
  UI for missing products/categories/params.
- `RequireAuth` wrapper: unauthenticated users → `/auth/login?redirect=<intended
  destination>`; after login, navigate to the preserved destination.
- Route params validated (`/product/:id` must be a positive integer; `/shop/:category`
  validated against the fetched category list). Invalid → dedicated not-found UI,
  not a crash.
- Discovery state (search, category, price range, sort, page) lives in URL
  search params on `/shop` and category pages; direct navigation and refresh
  reproduce the exact view. Invalid param values are sanitized with safe
  defaults (never throw).
- No primary link may point to a nonexistent route. 404 offers Home + Shop +
  search recovery paths.
- Client-side route protection is a navigation mechanism, never presented as
  security.

---

## 7. Product Data and Axios Architecture

### 7.1 Axios (`src/services/httpClient.js`)

- One centralized instance: `baseURL` from `import.meta.env.VITE_API_BASE_URL`
  with default `https://dummyjson.com`, `timeout: 12000`.
- Request interceptor: attach `AbortSignal` from TanStack Query when provided.
- Response interceptor: normalize errors into `ApiError { kind, status, message,
  retryable }` where `kind ∈ {network, timeout, cancelled, client, server,
  malformed}`. Cancellation is **not** an error state users see — queries resolve
  as cancelled silently.
- Never retry `client`-kind errors (4xx); retry `server`/`network`/`timeout`
  at most 2× with backoff.

### 7.2 Service modules (`src/services/`)

- `productsApi`: `getProducts({ limit, skip, sortBy, order })`,
  `getProduct(id)`, `searchProducts({ q, limit, skip, sortBy, order })`,
  `getCategoryProducts(slug, params)`, `getProductsFull({ sortBy, order })`
  (see §7.4).
- `categoriesApi`: `getCategories()` — response **validated** (expect
  `{ slug, name, url }[]`); malformed → `malformed` error kind.
- Every list response validated for shape (`products` array, numeric `total`).
  Invalid shapes surface the retryable error state, not a crash.
- No network logic in components.

### 7.3 TanStack Query (`src/app/queryClient.js`)

- Query keys include every parameter affecting the result:
  `['products', { page, limit, sortBy, order }]`,
  `['products', 'search', { q, page, limit, sortBy, order }]`,
  `['products', 'category', slug, { page, limit, sortBy, order }]`,
  `['product', id]`, `['categories']`, `['products', 'related', categoryId, excludeId]`.
- `staleTime`: 5 min for lists/categories, 10 min for product detail.
- `retry`: per §7.1 (never on 4xx). `refetchOnWindowFocus: false`.
- `placeholderData: keepPreviousData` for paginated lists to avoid layout jumps.
- Query functions receive `signal` and forward it to Axios → obsolete requests
  cancelled automatically when params change (search included).

### 7.4 Pagination, sorting, price filtering (documented semantics)

- Server-side pagination via `limit`/`skip`; respect returned `total` for page
  count. Never fetch the whole catalog just to paginate.
- Sorting server-side via DummyJSON `sortBy`/`order`
  (`title|price|rating|discount`, `asc|desc`).
- **Price filtering is client-side** — DummyJSON has no price filter parameter.
  When a price range is active, the shop performs a single full-catalog request
  (`limit=200`; the catalog is ~200 items) and paginates client-side. When no
  price filter is active, pure server pagination. This trade-off is labeled in
  code comments and README.
- Changing any filter resets `page` to 1 (or computes a safe clamped page when
  the result set shrinks). Price bounds derived from the fetched catalog
  metadata, not guessed.

---

## 8. State Management and Persistence

### 8.1 Responsibility split

- **TanStack Query** → remote server state (products, categories).
- **Redux Toolkit** → shared client state: `cart`, `wishlist`, `auth`, `checkout`
  (draft), `adminDemo` (local demo products/edits). `uiSlice` only for genuinely
  shared UI state (drawer open) — prefer local state otherwise.
- **React Context** → theme (simplest cross-cutting provider), toast
  notifications (`ToastProvider`).
- **localStorage** → persistence only, through `src/utils/storage/` (§8.4).
- No source of truth duplicated across layers.

### 8.2 Cart (`cartSlice` + `src/features/cart/`)

Operations: add, setQuantity, remove, clear, apply/remove coupon.
Selectors compute: itemCount, subtotal, itemDiscountTotal, couponDiscount,
shipping cost (method-dependent), grand total — via **pure functions in
`src/utils/pricing/`** (§11). Cart drawer and cart page read the same slice.
Empty state, max quantity cap (99/item; clamped to DummyJSON `stock` when known).

### 8.3 Persistence & merge policy (account-scoped)

Storage keys (all versioned; §8.4):

- Guest cart: `yostore:cart:guest`
- Account cart: `yostore:cart:account:<accountId>`
- Wishlist: `yostore:wishlist:guest` / `yostore:wishlist:account:<accountId>`
- Orders: `yostore:orders:account:<accountId>`
- Recently viewed: `yostore:recent` (shared across sessions, product IDs only)
- Session: `yostore:session` · Theme: `yostore:theme` · Admin demo products:
  `yostore:admin:products` · Checkout draft: `yostore:checkout:<accountId|guest>`

**On mock login:** load+validate account cart → load+validate guest cart →
merge (duplicate products: **sum quantities, clamped to 99 and to known stock**)
→ persist merged account cart → clear guest cart **only after** the merged
persist succeeds. Merge failure keeps the guest cart intact and surfaces a
toast.

**On logout:** clear in-memory auth + account-scoped slices; the next user
cannot see the previous account's cart, wishlist, orders, or checkout draft.
**On account switch:** hydrate the correct account-scoped data before rendering
account pages.

Hydration runs once at app start (rehydrate from storage into Redux via a
`storageMiddleware`/init action). Every read is validated (§8.4).

### 8.4 Storage layer (`src/utils/storage/`)

- Envelope format: `{ v: 1, data: ... }`. Every consume path validates shape and
  types before use. Malformed JSON, wrong version, or invalid records → discard
  that key (or prune invalid records), log a non-sensitive warning, and continue.
  Never crash on storage. Writes wrapped in try/catch (quota/private mode).
- Nothing sensitive stored: **no plaintext passwords** (§10), no payment
  credentials, no tokens. All storage treated as untrusted.

### 8.5 Wishlist

Add/remove/sync between listing cards, quick view, and PDP; persisted per
account/guest per §8.3 rules; empty + populated states; `/wishlist` page fetches
product data for saved IDs and degrades gracefully for unavailable products.

### 8.6 Recently viewed

Product IDs + timestamps; deduplicated (most-recent-first); capped at 12;
rendered on PDP ("You may also like" companion); invalid/missing IDs skipped at
render.

---

## 9. Brand Identity and Landing Page (main visual priority)

Homepage is the signature experience: lively, interactive, editorial, polished —
a discovery-to-shopping narrative, not a marketing template.

### Required sections (varied layouts — no two consecutive sections share a structure)

1. **Announcement bar** — dismissible (persisted), rotating editorial messages.
2. **Navigation** — responsive (§15), search overlay, cart drawer, wishlist,
   theme toggle, account.
3. **Immersive interactive hero** — editorial headline (Fraunces display),
   supporting copy, primary CTA ("Shop the edit" → `/shop`) + secondary CTA
   (category link). Art-directed DummyJSON product imagery in layered,
   asymmetric composition; pointer-responsive parallax on 2–3 layers only;
   subtle hover scale on imagery; scroll-linked gentle exit. Must be beautiful
   static (reduced motion / no JS). Mobile: simplified composition, no parallax.
4. **Featured collections** — 3–4 categories from `/products/categories`
   (validated slugs → `/shop/<slug>`), asymmetric grid with varied tile sizes,
   hover image swap/scale, editorial captions.
5. **Featured products** — curated selection (deterministic pick from fetched
   catalog, e.g. top-rated), product cards with hover-revealed quick actions
   (always keyboard/touch reachable).
6. **Editorial campaign sections** — two distinct full-bleed bands (e.g. a
   "Material study" story + a "Weekend edit" promo) with parallax imagery,
   scroll-triggered reveals, real links to categories/shop.
7. **Curated discovery** — horizontal scroll rail or mixed grid of discounted /
   new-feeling products with drag/wheel support (native scroll + snap; no
   scroll-jacking).
8. **Benefits & shipping** — real facts (COD, demo tracking, shipping windows →
   `/shipping`), icon + text, restrained.
9. **Newsletter** — demo-only form (RHF+Zod) with explicit "demo, not stored"
   note and success state.
10. **FAQ teaser** — 3 expandable items → `/faq`.
11. **Footer** — complete: all real routes, categories, policies, theme note,
    demo-data disclosure, credits.

### Interaction rules

- **Mouse:** pointer-follow/parallax only via Motion values (no re-render per
  event); limited to hero + campaign bands; off for coarse pointers and reduced
  motion. Hover reveals are supplementary — all actions remain visible/
  focusable for touch and keyboard.
- **Click:** every visible control does its advertised action — CTAs, category
  tiles, product cards, quick add, wishlist toggle, quick view, cart drawer,
  search overlay, theme switch, campaign links. No dead ends.
- **Scroll:** section reveals (staggered, once, via `whileInView`), subtle
  parallax on imagery, restrained page transitions (fade/translate ≤240ms).
  No scroll hijacking, no layout shifts (reserve image space via aspect-ratio),
  content never delayed behind animation.
- **Motion accessibility:** `MotionConfig reducedMotion="user"` + CSS
  `@media (prefers-reduced-motion: reduce)` fallbacks; information never
  conveyed by motion or color alone; focus always visible.

---

## 10. Product Discovery, Shop, and Product Details

### Shop (`/shop`, `/shop/:category`)

Responsive product grid with: search (debounced 350ms, URL-synced, obsolete
requests cancelled), category filter (from validated category list), price range
(§7.4), sort select (price/title/rating, asc/desc), pagination (server-side
unless price-filtered), active-filter chips + clear-all, empty/no-results states,
skeletons, retryable error state. URL is the shareable state store; params
validated and sanitized on load. `ProductCard`: image (lazy), title, category,
price + discount %, rating, stock hint, add-to-cart, wishlist toggle, quick-view
trigger (accessible dialog, focus-trapped — MUI Dialog).

### Product details (`/product/:id`)

Validate ID (positive integer; non-numeric → 404 view). Image gallery (thumbnail
rail + main image, keyboard-navigable); title, description, brand, category,
price + discount, rating display, stock; quantity selector; add-to-cart;
wishlist toggle; breadcrumb; **related products** (same category, current
product excluded, via query key `['products','related',...]`); recently viewed
rail; loading skeleton / retryable error / unavailable-product states.
**Reviews:** DummyJSON has no per-product reviews collection. If demo reviews
are shown, they are generated local content explicitly labeled
*"Demo reviews — not verified customer feedback."*

---

## 11. Cart Pricing and Coupons (`src/utils/pricing/`)

Pure, unit-tested functions: `computeSubtotal`, `computeItemDiscounts`
(DummyJSON `discountPercentage`), `computeCouponDiscount`, `computeShipping`
(method + free-shipping threshold), `computeTotal` (floors at **$0.00** — never
negative). Currency: **USD** via `Intl.NumberFormat("en-US", { currency: "USD" })`
— DummyJSON prices are USD; one currency only, never mixed.

### Demo coupons (config in `src/utils/pricing/coupons.js`, labeled demo)

| Code | Rule | Status |
| --- | --- | --- |
| `WELCOME10` | 10% off subtotal, min $50 | enabled |
| `EDITORIAL20` | $20 off, min $100 | enabled |
| `FREESHIP` | Free standard shipping, min $75 | enabled |
| `EXPIRED5` | 5% off, expired date | disabled — demonstrates expiry error |
| `SINGLEUSE25` | 25% off, min $200 | disabled — demonstrates disabled error |

Rules: one coupon per cart (no stacking); coupon discount applies to
post-item-discount subtotal; invalid/expired/disabled/below-minimum codes
produce specific inline errors; totals recomputed on any quantity, method, or
coupon change; coupon state resets safely when the cart no longer qualifies.

---

## 12. Checkout (multi-step, `/checkout`, protected)

Four steps with accessible stepper (MUI `Stepper`, labeled progress, keyboard
navigable):

1. **Contact & address** — name, email, phone, address, city, postal, country;
   required-field + format validation (RHF + Zod), inline accessible errors.
2. **Shipping** — methods with cost + ETA:
   - Standard — $5.95, 5–8 business days (free over $100)
   - Express — $14.95, 2–3 business days
   - Demo pickup — $0.00, 3–5 days
3. **Payment** — Cash on Delivery **or** simulated online payment (§12.1).
4. **Review** — items, quantities, discounts, shipping, final total; place order.

Requirements: validate each step before advancing; preserve input across
backward/forward navigation; empty cart blocks checkout (redirect with notice);
duplicate submission prevented (in-flight flag + idempotent local creation);
summary recomputes consistently from the pricing module; order ID format
`YS-XXXXX-XXXX` (time-based + random); cart cleared **only after** successful
local order creation; then redirect `/checkout/success/:orderId` with link to
order details. Checkout draft persisted per §8.3 and cleared on completion.

### 12.1 Payment rules

- **COD:** creates demo order with payment status `pending` + notice "pay on
  delivery (demo)".
- **Simulated online:** explicit "simulation — no real charge, no card details
  collected" banner; a **Start simulation** button (no card form, no card
  numbers, ever) runs a local flow: ~90% success after a short delay, with an
  explicit "Simulate cancellation" option to demonstrate the failure path.
  Success → payment status `paid (simulated)`; cancellation → back to payment
  step with a clear message and an intact cart. Never claims a real
  transaction occurred.

---

## 13. Orders, Shipping Policy, and Demo Tracking

### Order repository (`src/repositories/orderRepository.js`)

Local, account-scoped (§8.3). Order record: `orderId`, `accountId`, item
snapshots (id, title, image, unit price, quantity, discount), address snapshot,
shipping method + cost, coupon snapshot, totals, payment method + simulated
payment status, `createdAt`, `status`, `estimatedDelivery`, `timeline` (stored
simulated timestamps).

Statuses: `pending → confirmed → processing → shipped → delivered`
(+ `cancelled`). History lists only the active account's orders; details page
renders full snapshot + timeline. Unknown ID → recovery state.

### `/shipping`

Editorial policy page: the three demo methods, costs, ETAs, free-shipping
threshold, explicit limitations ("no real carrier services are connected;
tracking is simulated").

### `/tracking`

Order-ID lookup (validates format, empty-input error, unknown-order state).
Renders the stored timeline via `OrderTimeline` with: status label + icon +
text (not color alone), clear "Estimated" vs "Simulated" markers, no invented
carrier events, no live-tracking claims.

---

## 14. Mock Authentication and Accounts

Demonstration-only, clearly labeled in UI and README.

- **Register:** RHF + Zod (name, email, password rules); duplicate-account
  detection by email; creates account record.
- **Login/logout:** session record in `yostore:session` (`{ accountId, email,
  name, createdAt }`). Passwords: **never plaintext** — store only a salted
  SHA-256 digest (Web Crypto, async) of password+salt. Limitations banner:
  "Mock authentication — local only, not secure identity verification."
- Auth state in `authSlice`, hydrated at startup; session loss handled
  gracefully (treat as logged out, keep guest data).
- Redirect-back via `?redirect=` (§6). Protected routes: checkout, success,
  profile, orders, admin.
- Profile editing (name, email display, address book) — persisted account-scoped.
- Account switching/logout isolation per §8.3, covered by tests.
- README documents: browser storage is user-editable; mock separation is not a
  security boundary.

---

## 15. Shared UI Components

**Layout:** `AppLayout`, `AuthLayout`, `AdminLayout`, `Navbar`,
`MobileNavigation` (sheet menu), `Footer`, `AnnouncementBar`, `PageTransition`,
`Container`, `Section` (editorial spacing helpers).

**Products:** `ProductCard`, `ProductGrid`, `ProductGallery`, `ProductPrice`,
`RatingDisplay`, `ProductFilters`, `SortSelect`, `Pagination`, `RelatedProducts`,
`QuickViewDialog`, `ProductSkeleton`, `CategoryTile`.

**Cart/checkout:** `CartDrawer` (MUI Drawer), `CartItem`, `CartSummary`,
`CouponInput`, `CheckoutStepper`, `AddressForm`, `ShippingMethodSelector`,
`PaymentMethodSelector`, `OrderSummary`.

**Feedback/states:** `ToastProvider` (aria-live), `ErrorState` (message +
retry), `EmptyState`, `ConfirmDialog` (MUI Dialog), `LoadingButton`,
`InlineValidationError`, `DemoDataNotice` (used anywhere demo data/ops appear).

**Account/admin:** `ProfileForm`, `OrderList`, `OrderTimeline`,
`AdminSidebar`, `AdminMetrics`, `ProductManagementTable`.

Every component has one explicit responsibility and a small, consistent prop
surface. No abstraction without a demonstrated use case.

---

## 16. Tailwind CSS + MUI Coexistence

Tailwind drives layout, grids, responsive utilities, spacing, typography, and
most storefront styling. MUI provides complex a11y primitives (dialogs, drawer,
stepper, form controls, admin table) themed from the shared token map (§17).
Both consume the same CSS custom properties. Rule: **one owner per component** —
a component is either Tailwind-styled or MUI-styled, never both fighting.

---

## 17. Light and Dark Themes

- Theme provider (Context) + toggle in nav; preference persisted
  (`yostore:theme`); `.dark` class on `<html>`; defaults to
  `prefers-color-scheme` on first visit.
- **FOUC prevention:** tiny inline script in `index.html` sets the class before
  first paint.
- Tailwind: CSS vars on `:root`/`.dark` feeding `@theme`; `dark:` utilities via
  §4.1 custom variant. MUI: `createTheme` derived from the same vars; toggled by
  swapping the var set — both systems switch atomically.
- Both themes deliberately designed (contrast-checked surfaces, borders, focus
  rings, image treatment). Correct in dialogs, drawers, toasts, forms, admin.
- No "invert everything" shortcut.

---

## 18. About, Contact, FAQ, 404

- **About:** editorial brand story — large type, timeline or manifesto
  composition, real imagery, values, demo-data disclosure.
- **Contact:** accessible form (RHF + Zod), loading + success states, explicit
  "submissions are simulated and not stored or sent" note, contact-method cards
  linking to real routes.
- **FAQ:** accessible `<details>`-style expandables or MUI accordions with proper
  headings/ARIA, grouped by topic, links to shipping/shop/contact.
- **404:** branded editorial composition; links to Home, Shop, and a search
  field that navigates to `/shop?q=…`. No unfinished-placeholder feel.

---

## 19. Accessibility and Responsive Design

Targets: mobile (360+), tablet, laptop, desktop. Requirements:

- No unintended horizontal overflow at any breakpoint; test 320–1440px.
- Touch targets ≥44px on interactive controls; `touch-action` respected.
- Keyboard: full navigation; skip-to-content link; focus-visible ring everywhere
  (§5); dialogs/drawers trap and restore focus (MUI); Escape closes overlays.
- Semantic landmarks (`header/nav/main/footer`), one `h1` per page, logical
  heading order, meaningful `alt` (empty alt for decorative), labeled controls,
  `aria-live` for toasts and cart-count changes.
- Contrast ≥ 4.5:1 body / 3:1 large text in **both** themes.
- Validation errors: `aria-invalid` + `aria-describedby` + visible text.
- Reduced motion honored (§9); color+icon+text for status; lazy-load noncritical
  imagery; hero image eager with `fetchpriority="high"` and reserved space.

---

## 20. SEO and Performance

- Per-route `document.title` + meta description via a small `usePageMeta` hook;
  OG tags where practical; canonical hints; descriptive headings and links.
  Documented limitation: client-rendered SPA — no SSR-level SEO guarantees.
- Lazy-load all secondary routes; eager Home. Debounce search (350ms); cancel
  obsolete requests; cache with TanStack Query; `keepPreviousData` for pages.
- Motion limited to transform/opacity; rAF-throttled pointer handling; no global
  state updates on pointer events; memoize hot list components.
- Images: DummyJSON CDN URLs, `loading="lazy"` + `decoding="async"` off-hero,
  `aspect-ratio` reserved space to prevent CLS.
- No unnecessary dependencies (§3 list is closed without new justification).
- Performance claims only after actual measurement (Lighthouse/devtools).

---

## 21. Error Handling

Covered states with useful message + retry + recovery path: network failure,
timeout, API 5xx, malformed response shapes, empty results, invalid product ID,
missing/invalid category, invalid URL params, corrupted localStorage, expired
mock session, invalid form data, invalid coupons, empty-cart checkout, duplicate
submissions, unknown order IDs, simulated payment cancellation, unexpected
render errors (error boundary with generic message — **never** stack traces,
secrets, or internals to users).

Centralized: Axios normalization (§7.1) + `ErrorState`/`EmptyState` components +
route/app error boundaries + storage try/catch (§8.4).

---

## 22. Security Boundaries

Demo frontend, stated as such in UI and README: validate all input; treat API
responses, storage, and URL params as untrusted; no `dangerouslySetInnerHTML`;
no secrets in the bundle (env vars are public by definition); no real payment
credentials ever collected (§12.1); client-side "admin gate" explicitly
non-authoritative; no sensitive logging; quantity/ID/order-reference validation;
safe recovery from malformed persisted data. README lists future backend
requirements: secure auth, server authorization, authoritative pricing,
inventory, persistent orders, payment gateway, real carrier tracking,
multi-device sync.

---

## 23. Project Structure

```
src/
  app/            main.jsx, App.jsx, router.jsx, queryClient.js, providers.jsx, ErrorBoundary.jsx
  assets/         images, svgs
  components/
    layout/       AppLayout, AuthLayout, AdminLayout, Container, Section, PageTransition
    navigation/   Navbar, MobileNavigation, Footer, AnnouncementBar, SearchOverlay
    products/     ProductCard, ProductGrid, ProductGallery, ProductPrice, RatingDisplay,
                  ProductFilters, SortSelect, Pagination, RelatedProducts, QuickViewDialog,
                  ProductSkeleton, CategoryTile
    cart/         CartDrawer, CartItem, CartSummary, CouponInput
    checkout/     CheckoutStepper, AddressForm, ShippingMethodSelector, PaymentMethodSelector, OrderSummary
    feedback/     ToastProvider, ErrorState, EmptyState, ConfirmDialog, LoadingButton,
                  InlineValidationError, DemoDataNotice
    forms/        ProfileForm, ContactForm, NewsletterForm
    account/      OrderList, OrderTimeline
    admin/        AdminSidebar, AdminMetrics, ProductManagementTable
  features/       auth/, cart/, wishlist/, checkout/, orders/, profile/, admin/  (logic + hooks + thunks)
  pages/          home/, shop/, product/, about/, contact/, faq/, not-found/,
                  cart/, checkout/, auth/, account/, shipping/, tracking/, admin/
  services/       httpClient.js, productsApi.js, categoriesApi.js, index.js
  repositories/   orderRepository.js, accountRepository.js, adminProductsRepository.js, coupons.js
  hooks/          usePageMeta, useDebouncedValue, useMediaQuery, useReducedMotionSafe,
                  usePointerParallax, useShopQueryParams, useCartTotals, useRecentlyViewed
  store/          index.js, cartSlice.js, wishlistSlice.js, authSlice.js, checkoutSlice.js, adminSlice.js
  providers/      ThemeProvider.jsx
  utils/
    storage/      index.js (versioned envelope, validation, try/catch)
    pricing/      index.js, coupons.js (pure functions)
    formatting/   currency.js, dates.js
    validation/   schemas (zod)
    apiErrors.js
  styles/         main.css, tokens.css
  tests/          setup.js, fixtures/products.js, helpers.jsx (renderWithProviders)
e2e/              Playwright journeys + fixtures
public/           index favicon/og assets
```

Rules: no empty folders; no duplicate business logic; naming consistent; the
structure may thin out where a folder would hold one file — merge rather than
create shells.

---

## 24. Testing Strategy

Network is **mocked everywhere** in automated tests (no reliance on DummyJSON
uptime): API unit tests use Axios custom-adapter injection; component/integration
tests `vi.mock` service modules; Playwright routes `https://dummyjson.com/**`
via `page.route`.

### Vitest (unit + component)

- **API:** fetching, search params, pagination math, failures (500/timeout/
  network), malformed shapes, cancellation (signal propagation).
- **Cart & pricing:** add/update/remove/clear; duplicate merging; subtotal/
  item-discount/coupon/shipping/total math; floors at zero; invalid, expired,
  disabled, below-minimum coupons; corrupted-storage recovery; guest→account
  merge incl. clamps; account switching; logout isolation.
- **Auth:** valid login, invalid form, duplicate registration, protected-route
  redirect + redirect-back, logout clears scoped state.
- **Checkout & orders:** per-step validation; back/forward preserves input;
  empty-cart block; COD order creation; simulated payment success + cancellation;
  duplicate-submission guard; cart cleared only on success; order-history
  isolation; order details; unknown order ID.
- **UI & a11y:** loading/empty/error states; theme switching (class + persisted
  - MUI sync); mobile nav; keyboard interactions; dialog a11y (focus trap,
  Escape); reduced-motion behavior; visible form errors.
- Shared `renderWithProviders` helper (store + router + query client + theme).

### Playwright (E2E, mocked network, desktop-chromium + one mobile project)

1. Landing → explore a category.
2. Search + filter products (URL state).
3. Sort + paginate.
4. Open product → add to cart (badge updates).
5. Add to wishlist.
6. Register/login a mock account.
7. Guest-cart merge verified after login.
8. COD checkout end-to-end → order confirmation.
9. Simulated online checkout (success + cancellation paths).
10. Order details + demo tracking.
11. Logout → other account's data not visible.
12. Invalid URL → 404 → recover to shop.

Scripts: `npm run test` (vitest run), `npm run test:watch`, `npm run test:coverage`,
`npm run e2e` (playwright test; webServer boots `npm run dev`).

---

## 25. Implementation Workflow

**Phase 1 — Foundation:** install deps (§3) · verify versions resolve · Vite +
Tailwind v4 + tokens + fonts · theme system + FOUC script · router skeleton
(all routes, layouts, lazy loading, 404) · providers (Redux, Query, Theme,
Toast) · ErrorBoundary · test harness (Vitest + RTL + Playwright configs).
*Exit:* `npm run dev` + `npm run build` clean; every route renders.

**Phase 2 — Data & discovery:** Axios client + services + validation · Query
keys/caching · shop + category pages (search/filter/sort/pagination/URL state) ·
PDP (gallery, related, recently viewed) · skeletons/errors/empty states.
*Exit:* full discovery flows work against DummyJSON with mocked-test coverage.

**Phase 3 — Shopping state:** Redux slices · storage layer · cart UI (drawer +
page) · pricing module + coupons · wishlist · persistence + guest→account merge.
*Exit:* cart/wishlist tests green; merge verified manually and in tests.

**Phase 4 — Auth & checkout:** mock auth (register/login/logout/session) ·
profile · protected routes + redirect-back · multi-step checkout · COD +
simulated payment · order repository, success page, order history/details.
*Exit:* checkout/order tests green; account isolation verified.

**Phase 5 — Landing page:** full editorial homepage (§9) · hero + pointer
effects + scroll reveals · hover interactions · mobile + reduced-motion pass.
*Exit:* every landing interaction works; static fallback still beautiful.

**Phase 6 — Supporting pages:** shipping · tracking · About · Contact · FAQ ·
404 polish · admin dashboard (§26).
*Exit:* no placeholder surfaces remain.

**Phase 7 — Quality assurance:** run Vitest + coverage of critical rules ·
run Playwright suites · route/refresh sweep · responsive + theme audit ·
a11y pass (keyboard, contrast, reduced motion) · console-error sweep ·
performance measurement (§20) · fix · README · final acceptance-criteria
verification (§27).

---

## 26. Admin Dashboard (`/admin`, protected, demo-labeled)

Frontend-only demo: summary metrics derived from demo data (demo orders count,
revenue sum, demo product count, top category) · product table (search/filter,
create/edit/delete-with-confirm operating on **local demo overlay** state
`adminSlice` persisted to `yostore:admin:products`) · demo orders table with
status updates (writes to the local order repository) · loading/empty/error
states.

Explicit UI notices: DummyJSON products are read-only externally-sourced data —
local edits live only in the demo overlay and never modify the public DummyJSON
dataset; overlays may be shadowed by fresh API data (documented behavior);
React-side gating is not authorization. Metrics labeled as demo-derived.

---

## 27. Acceptance Criteria

1. Installs and starts with documented commands (`npm install`, `npm run dev`,
   `npm run build`, `npm run preview`).
2. No unresolved build errors.
3. All routes work incl. direct navigation and refresh (SPA fallback configured).
4. Landing page has a distinctive editorial design.
5. Mouse, hover, click, and scroll interactions work appropriately.
6. Reduced-motion preferences respected.
7. Light and dark themes work consistently everywhere.
8. Product data fetched through Axios (central instance, normalized errors).
9. Search, filtering, sorting, pagination correct (URL-shareable; price-filter
   semantics per §7.4).
10. Product details handle invalid/missing IDs.
11. Cart updates, quantities, totals, badges consistent (single source of truth).
12. Guest-cart merging works without losing valid products (merge-then-clear).
13. Account switching never exposes another account's demo data.
14. Wishlist and recently viewed behave correctly (incl. unavailable products).
15. Checkout validates all fields and steps; input preserved across steps.
16. COD + simulated online payment work with zero real financial interaction.
17. Demo orders saved locally, scoped to the correct account.
18. Tracking clearly labeled simulated; no invented carrier events.
19. Admin operates on demo data with explicit non-security disclaimers.
20. Every visible primary action has a meaningful result (no dead ends).
21. Loading, empty, error, success, and validation states implemented.
22. Accessibility and responsive behavior tested (keyboard, contrast, 320–1440px).
23. No real payment credentials or secrets collected or exposed.
24. Critical business rules covered by automated tests (all suites green).
25. No unresolved runtime errors or broken imports; console clean.
26. README documents setup, architecture, dependencies, test commands,
    limitations, and future backend integration.

**No criterion may be claimed complete without verification.**

---

## 28. Final Deliverables (at completion)

- Summary of implemented features.
- Final project structure.
- Setup/run commands and test commands with **actual results**.
- Known limitations.
- Any acceptance criteria still incomplete, with reasons.

---

## 29. Out of Scope / Future Backend Requirements

No backend, database, real payments, real auth, real shipping, or SSR/SEO
server. README documents required backend capabilities: secure authentication;
server-side authorization; authoritative pricing; inventory management;
persistent orders; payment gateway integration; real carrier tracking; reliable
multi-device synchronization.
