# YoStore

Modern editorial e-commerce frontend (demo) built with React, Vite, Tailwind CSS v4, MUI, Redux Toolkit, TanStack Query, React Hook Form, Zod, Axios, Motion for React, and Playwright/Vitest for testing. Data comes from DummyJSON; all auth, orders, cart persistence, and dashboard state are local to the browser.

## Quick start

```bash
npm install
npm run dev
```

Build and preview:
```bash
npm run build
npm run preview
```

Tests:
```bash
npm run lint
npm run test
npm run test:coverage
npm run e2e
```

## Tech stack

- Vite + React 19
- React Router 8
- Tailwind CSS v4 (CSS-first)
- MUI 9 (dialogs, drawers, stepper, tables)
- Redux Toolkit 2 (cart/wishlist/auth/checkout/ui)
- TanStack Query 5 (DummyJSON data, caching, retries)
- React Hook Form 7 + Zod 4
- Axios + Motion + lucide-react
- Vitest + React Testing Library + Playwright

## Architecture

Feature-oriented structure with layouts (`AppLayout`, `AuthLayout`, `AdminLayout`), shared UI components, repositories for local/demo state, and service layer for DummyJSON.

Key features: editorial landing page with Motion interactions, shop/category/search/filters/sort/pagination, product details with gallery/related/reviews (demo), guest cart with account merge, multi-step checkout (COD + simulated online payment), local orders + demo tracking timeline, mock auth + account-scoped persistence, wishlist + recently viewed, frontend-only admin dashboard with local product overlay.

See `SPEC.md` for complete spec and `CONVENTIONS.md` for engineering conventions.

## Deployment

SPA rewrites provided for Vercel (`vercel.json`) and Netlify (`netlify.toml`). Any static host supporting SPA fallback works.

## Limitations (demo)

- Frontend-only; no backend/security (mock auth).
- DummyJSON is read-only; admin edits persist locally in `localStorage` (never sent to DummyJSON) — resettable from admin panel.
- Payments are simulated (no real charges). Tracking is demo-only (no live carrier).
- All data stays in your browser. Treat storage as untrusted.
