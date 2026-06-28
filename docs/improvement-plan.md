# Food Studio — Kế Hoạch Cải Thiện (79 → 90+/100)

> Tạo ngày 2026-06-28. Mục tiêu hoàn thành trong 1 sprint (3–5 ngày làm việc).

## Tổng quan

Sau khi đánh giá dự án ở mức **79/100**, bốn hạng mục sau được xác định cần cải thiện:

| # | Hạng mục | Trạng thái | Ưu tiên |
|---|---|---|---|
| 1 | Kết nối Real API | Mock data khắp nơi | Cao |
| 2 | Test Suite | 0 tests | Cao |
| 3 | Payment Webhooks | VNPay/MoMo chưa có callback | Trung bình |
| 4 | Admin Auth + Mobile Cart | Không bảo vệ, cart rỗng | Trung bình |

---

## Hạng mục 1 — Kết nối Real API

**Vấn đề**: Frontend render skeleton/placeholder thay vì gọi API thật.

**Các file cần sửa**:

| File | Thay đổi |
|------|----------|
| `frontend/src/app/(shop)/products/page.tsx` | Gọi `productApi.list({ ...params, limit: 24 })`, render `<ProductCard>` thật |
| `frontend/src/app/(shop)/search/page.tsx` | Bỏ comment `productApi.list({ q: query })`, hiện kết quả thật |
| `frontend/src/components/home/TrendingProducts.tsx` | Thay `mockProducts` bằng `useProducts({ featured: true, limit: 8 })` |
| `frontend/src/components/home/FeaturedCollections.tsx` | Dùng `categoryApi.list()` với fallback static |
| `frontend/src/app/(shop)/collections/[slug]/page.tsx` | `productApi.list({ category: slug })` |

**Backend đã sẵn sàng**: `products.ts` hỗ trợ `?q=`, `?category=`, `?region=`, `?sort=`, `?featured=true`, `?limit=`, `?page=`.

**Hooks đã có sẵn**: `useProducts`, `useInfiniteProducts`, `useProduct`, `useProductById` trong `frontend/src/hooks/useProducts.ts`.

---

## Hạng mục 2 — Test Suite

**Vấn đề**: Zero test coverage. `pnpm test` chạy nhưng không có gì để test.

### Stack

| Layer | Tool |
|---|---|
| Backend (CF Workers) | `vitest` + `@cloudflare/vitest-pool-workers` |
| Utils package | `vitest` + `jsdom` |
| Frontend stores | `vitest` + `@testing-library/react` |
| E2E | `@playwright/test` |

### Files sẽ tạo

```
backend/
  vitest.config.ts
  src/__tests__/
    auth.test.ts          # signJwt, verifyJwt, register, login
    products.test.ts      # GET /products, filters, slug lookup
    checkout.test.ts      # place order, coupon apply, inventory reservation

packages/utils/
  vitest.config.ts
  src/__tests__/
    utils.test.ts         # formatPrice, slugify, generateId, truncate, chunk

frontend/
  vitest.config.ts
  src/__tests__/
    cart.test.ts          # useCartStore: addItem, merge, remove, totalPrice

e2e/
  playwright.config.ts
  tests/
    auth.spec.ts          # register → login → /account redirect
    cart.spec.ts          # browse product → add to cart → view cart count
    checkout.spec.ts      # fill shipping → COD → place order → order page
```

### Thay đổi package.json

- `backend/package.json`: thêm `vitest`, `@cloudflare/vitest-pool-workers` vào devDependencies
- `packages/utils/package.json`: thêm `vitest`
- `frontend/package.json`: thêm `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
- Root `package.json`: thêm `"test:e2e": "playwright test"`

---

## Hạng mục 3 — Payment Webhooks

**Vấn đề**: VNPay/MoMo được khai báo là payment methods nhưng không có callback handler nào. Order tạo ra mãi ở trạng thái `pending`.

### Luồng thanh toán

```
User checkout → POST /v1/checkout/place (tạo order pending)
  → Redirect tới VNPay/MoMo payment page
  → User thanh toán
  → Provider gọi webhook callback
  → Verify HMAC signature
  → Emit payment.succeeded event → Queue
  → Queue handler: order status → confirmed, email user + seller
```

### Endpoints mới (`backend/src/routes/payments.ts`)

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/v1/payments/vnpay/return` | VNPay redirect user về sau khi thanh toán |
| `POST` | `/v1/payments/vnpay/ipn` | VNPay server-to-server IPN |
| `POST` | `/v1/payments/momo/ipn` | MoMo server-to-server IPN |

**Lưu ý**: Các routes này **không có authMiddleware** vì là public webhook endpoints.

### Signature verification (`backend/src/lib/payment-verify.ts`)

Dùng Web Crypto API (`crypto.subtle`) để tương thích Cloudflare Workers:

```typescript
// VNPay: sort params alphabetically → join as key=value& → HMAC-SHA512
verifyVnpaySignature(params: Record<string, string>, secretKey: string): Promise<boolean>

// MoMo: build rawSignature string theo thứ tự cố định → HMAC-SHA256
verifyMomoSignature(body: MomoIpnBody, secretKey: string): Promise<boolean>
```

### Env variables cần thêm vào `.env.example`

```
VNPAY_TMN_CODE=
VNPAY_SECRET_KEY=
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
```

---

## Hạng mục 4 — Admin Auth Guard + Mobile Cart

### Admin Auth Guard

**Vấn đề**: Dashboard không check token — ai biết URL cũng vào được.

**Giải pháp**: Next.js `middleware.ts` (server-side, không flash content)

```
admin/src/middleware.ts
  - Matcher: tất cả routes trừ /login, /_next/*, /favicon.ico
  - Check cookie `admin_token`
  - Không có cookie → redirect /login
  - admin/src/app/login/page.tsx đã set cookie khi login thành công
```

**Lưu ý**: Admin hiện dùng `localStorage` (client-side). Cần chuyển login sang **set cookie** (`httpOnly: false` để JS đọc được, hoặc dùng cookie để middleware check).

### Mobile Cart Store

**Vấn đề**: `mobile/app/(tabs)/cart.tsx` chỉ hiện empty state, không có store.

**Giải pháp**: Zustand + AsyncStorage persistence

```
mobile/src/store/cart.ts
  - State: items: CartItem[], addItem, removeItem, updateQuantity, clearCart
  - Persistence: AsyncStorage với key 'food-studio-mobile-cart'
  - CartItem type từ @food-studio/types

mobile/app/(tabs)/cart.tsx
  - Dùng useCartStore, render FlatList items
  - Swipe to delete, quantity controls
  - Tổng tiền + nút Checkout → router.push('/checkout')

mobile/app/product/[slug].tsx
  - Nút "Thêm vào giỏ" gọi useCartStore.getState().addItem(...)
  - Cập nhật cart badge trên tab bar
```

---

## Thứ tự thực hiện

```
✅ Bước 0: Tạo file này (docs/improvement-plan.md)
⬜ Bước 1: Admin middleware + Mobile cart store
⬜ Bước 2: Kết nối real API (frontend pages)
⬜ Bước 3: Payment webhook routes + signature verification
⬜ Bước 4: Test suite (Vitest + Playwright)
⬜ Bước 5: git commit + push
```

---

## Tiêu chí hoàn thành (Definition of Done)

- [ ] `admin/` dashboard redirect về `/login` khi chưa có token
- [ ] Mobile cart hiện đúng items sau khi addItem từ product detail
- [ ] `/products` và `/search` render sản phẩm thật từ API
- [ ] `TrendingProducts` và `FeaturedCollections` dùng real data
- [ ] `pnpm --filter backend test` chạy và pass ≥ 15 test cases
- [ ] `pnpm --filter @food-studio/utils test` chạy và pass
- [ ] `POST /v1/payments/vnpay/ipn` với HMAC đúng → order status cập nhật
- [ ] `POST /v1/payments/momo/ipn` với signature đúng → order status cập nhật
- [ ] E2E auth flow pass (register → login → redirect)
