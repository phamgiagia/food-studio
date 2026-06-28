# Implementation TODO

> Ordered by priority. Work through Phase 0 before touching Phase 1.

---

## Phase 0 — Foundation

### Monorepo & Tooling
- [ ] Run `pnpm install` at root
- [ ] Verify `turbo run build` works
- [ ] Set up ESLint + Prettier config (`packages/eslint-config`, `packages/ts-config`)
- [ ] Create shared types package `packages/types`
- [ ] Create shared utils package `packages/utils`

### Cloudflare Setup
- [ ] Create Cloudflare account + add domain `foodstudio.vn`
- [ ] Provision D1 database: `wrangler d1 create food-studio-db-prod`
- [ ] Provision D1 staging: `wrangler d1 create food-studio-db-staging`
- [ ] Create KV namespaces: `SESSIONS`, `CACHE`, `FEATURE_FLAGS`
- [ ] Create R2 bucket: `food-studio-media-prod`
- [ ] Create Queues: `order-events`, `notification-queue`, `search-indexing`
- [ ] Apply initial D1 migration (docs/database.md schema)
- [ ] Set all production secrets via `wrangler secret put`

### CI/CD
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Add Vercel project for `frontend` + get `VERCEL_TOKEN`
- [ ] Add Vercel project for `admin`
- [ ] Add `CLOUDFLARE_API_TOKEN` to GitHub secrets
- [ ] Test staging deploy pipeline end-to-end

---

## Phase 1 — Backend Core

### API Gateway Worker (`backend/src/gateway/`)
- [ ] Hono.js router setup
- [ ] JWT middleware (validate + extract claims)
- [ ] RBAC middleware (check role against route)
- [ ] Rate limiter binding
- [ ] Turnstile validation middleware
- [ ] Request logging (structured JSON to Axiom)
- [ ] Error handling middleware (consistent error shape)
- [ ] Route proxy to domain workers (or direct service-in-worker)
- [ ] OpenAPI spec endpoint (`/docs`)

### Auth Service (`backend/src/services/auth/`)
- [ ] `POST /auth/register` — create user + hash password (bcrypt)
- [ ] `POST /auth/login` — validate credentials → issue JWT + refresh token
- [ ] `POST /auth/refresh` — validate refresh token → new JWT
- [ ] `POST /auth/logout` — invalidate session in KV
- [ ] `POST /auth/otp/send` — generate OTP → store in KV → send via SendGrid
- [ ] `POST /auth/otp/verify` — validate OTP from KV
- [ ] `POST /auth/password/reset` — email reset link
- [ ] `GET /auth/me` — return current user
- [ ] `PATCH /auth/me` — update profile fields

### Catalog Service (`backend/src/services/catalog/`)
- [ ] `GET /products` — list with pagination, filters, sort
- [ ] `GET /products/:id` — single product + images + variants
- [ ] `POST /products` — create (seller role)
- [ ] `PATCH /products/:id` — update (seller owns OR admin)
- [ ] `DELETE /products/:id` — soft delete
- [ ] `POST /products/:id/images` — upload → R2 → save URL
- [ ] `GET /categories` — tree structure
- [ ] `GET /sellers` — list approved sellers
- [ ] `GET /sellers/:id` — seller public profile + products

### Order Service (`backend/src/services/orders/`)
- [ ] Cart (Durable Object): add, remove, update quantity, clear
- [ ] `POST /checkout/validate-cart` — check stock, prices
- [ ] `POST /checkout/calculate-shipping` — GHN API call
- [ ] `POST /checkout/place` — atomic: reserve inventory + create order + init payment
- [ ] `GET /orders` — user's orders
- [ ] `GET /orders/:id` — order detail
- [ ] Order status state machine (pending → confirmed → processing → shipped → delivered)

### Payment Service (`backend/src/services/payments/`)
- [ ] VNPay integration: initiate → redirect URL → webhook
- [ ] Webhook signature validation (HMAC)
- [ ] On payment success: emit `payment.succeeded` event to Queue
- [ ] `GET /payments/:id` — payment status

---

## Phase 1 — Frontend Core

### Setup (`frontend/`)
- [ ] `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Install: `shadcn/ui`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `motion`, `next-intl`
- [ ] Configure `next.config.ts` (images domains, i18n)
- [ ] Set up Tailwind custom tokens (brand colors, typography)
- [ ] Set up shadcn/ui components
- [ ] API client (`src/lib/api.ts`) with fetch wrapper + TanStack Query
- [ ] Zustand cart store (`src/store/cart.ts`)

### Layout
- [ ] Root layout (`app/layout.tsx`) — fonts, providers, metadata
- [ ] Header component — logo, search bar, cart, auth nav
- [ ] Footer component — links, social, newsletter signup
- [ ] Mobile bottom nav bar

### Pages
- [ ] **Homepage** (`app/page.tsx`)
  - Hero section (editorial, large photography)
  - Featured collections row
  - Regional discovery section (map or grid by province)
  - Trending products carousel
  - Seller stories section
  - Newsletter CTA

- [ ] **Products listing** (`app/products/page.tsx`)
  - Sidebar filters (category, region, price, rating)
  - Product grid (card: image, name, seller, price, rating)
  - Sort dropdown
  - Pagination / infinite scroll

- [ ] **Product detail** (`app/products/[slug]/page.tsx`)
  - Image gallery (main + thumbnails)
  - Product info (name, story, origin, price)
  - Variant selector
  - Quantity picker + Add to cart
  - Seller card (link to seller page)
  - Reviews section
  - Related products

- [ ] **Seller page** (`app/sellers/[slug]/page.tsx`)
  - Seller hero (banner, logo, name, region badge)
  - Story section
  - Product grid

- [ ] **Cart** (`app/cart/page.tsx`)
  - Line items (image, name, variant, qty, price)
  - Cart total
  - Checkout CTA

- [ ] **Checkout** (`app/checkout/page.tsx`)
  - Address form / select saved address
  - Shipping method picker
  - Coupon input
  - Order summary
  - Payment method selection
  - Place order button

- [ ] **Order confirmation** (`app/orders/[id]/page.tsx`)
- [ ] **Account pages** (`app/account/`)
  - Profile
  - Orders
  - Addresses
  - Wishlist

### Auth
- [ ] Login modal / page
- [ ] Register modal / page
- [ ] OTP verification flow
- [ ] Auth state (Zustand + cookie JWT)

---

## Phase 1 — Admin Portal Core

### Setup (`admin/`)
- [ ] Next.js setup (same stack as frontend)
- [ ] Auth (admin login only — no public registration)
- [ ] Sidebar layout (collapsible, icon + label)
- [ ] RBAC guard (wrap all routes with role check)

### Pages
- [ ] Dashboard — KPI cards (GMV, orders, sellers, users) + revenue chart
- [ ] Products — table (search, filter, status badge, approve/reject actions)
- [ ] Sellers — table + approve/suspend actions
- [ ] Orders — table + status filter + manual status update
- [ ] Users — table + suspend/view actions
- [ ] Coupons — create + list + toggle active

---

## Phase 2

### Shipping
- [ ] GHN API integration (ship order → get tracking number)
- [ ] GHTK fallback
- [ ] Tracking events webhook receiver
- [ ] Tracking page (real-time status timeline)

### Inventory
- [ ] Stock tracking per variant
- [ ] Atomic reservation on checkout (Durable Object)
- [ ] Low stock email alert to seller

### Reviews
- [ ] Create review (only if order is delivered)
- [ ] Review list on product page (paginated, sortable)
- [ ] Rating summary (star distribution bar chart)
- [ ] Report review (admin moderation queue)

### Promotions
- [ ] Coupon CRUD (admin)
- [ ] Apply coupon at checkout
- [ ] Validate per-user usage limit
- [ ] Seasonal campaign banners (CMS)

### Loyalty
- [ ] Earn points on order (X points per 1000 VND)
- [ ] Points balance on account page
- [ ] Tier display (bronze/silver/gold/platinum)
- [ ] Redeem points at checkout

---

## Phase 3 — Mobile App

### Setup (`mobile/`)
- [ ] `npx create-expo-app@latest mobile --template blank-typescript`
- [ ] Install: Expo Router, NativeWind, React Query, Zustand
- [ ] Configure app.json (bundle ID, icons, splash screen)

### Screens
- [ ] Tab navigator (Home, Search, Cart, Account)
- [ ] Home feed (featured products + sellers)
- [ ] Search + filter
- [ ] Product detail
- [ ] Cart + checkout
- [ ] Order list + tracking
- [ ] Account + settings

### Push Notifications
- [ ] Firebase Cloud Messaging setup
- [ ] Register device token on login
- [ ] Receive: order update, promotion, review prompt

---

## Phase 4 — Scale & Polish

- [ ] Vectorize search (embed products at create/update, query on search)
- [ ] Recommendation engine (similar products, "customers also bought")
- [ ] Multi-language (vi/en) with next-intl
- [ ] PWA manifest + service worker (offline cart, install prompt)
- [ ] Full audit log (every admin action recorded)
- [ ] Fraud scoring (velocity checks, device fingerprint)
- [ ] Seller settlement automation (weekly payout via bank transfer API)
- [ ] Affiliate program (referral links, commission tracking)
- [ ] Performance budget (Core Web Vitals all green)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security penetration test
- [ ] Load test: 10K concurrent users baseline
