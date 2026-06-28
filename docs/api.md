# API Specification

Base URL: `https://api.foodstudio.vn/v1`

All responses follow:
```json
{ "data": {}, "meta": {}, "error": null }
```

Errors:
```json
{ "data": null, "error": { "code": "PRODUCT_NOT_FOUND", "message": "..." } }
```

Authentication: `Authorization: Bearer <jwt>`

---

## Auth Service

```
POST   /auth/register           Register new user
POST   /auth/login              Login (email/phone + password)
POST   /auth/logout             Invalidate session
POST   /auth/refresh            Refresh access token
POST   /auth/otp/send           Send OTP (phone/email)
POST   /auth/otp/verify         Verify OTP
POST   /auth/password/reset     Request password reset
POST   /auth/password/change    Change password
POST   /auth/mfa/enable         Enable MFA (TOTP)
POST   /auth/mfa/verify         Verify TOTP code
GET    /auth/me                 Get current user
PATCH  /auth/me                 Update profile
```

---

## Catalog Service

### Products
```
GET    /products                     List products (filterable)
GET    /products/:id                 Product detail
GET    /products/slug/:slug          Product by slug
POST   /products                     Create product (seller/admin)
PATCH  /products/:id                 Update product
DELETE /products/:id                 Delete product
POST   /products/:id/images          Upload images
DELETE /products/:id/images/:imgId   Remove image
GET    /products/:id/reviews         Product reviews
GET    /products/:id/related         Related products
```

Query params (GET /products):
- `category` — category slug
- `region` — province/region filter
- `seller` — seller_id
- `q` — full-text search
- `min_price`, `max_price`
- `sort` — `popular`, `newest`, `price_asc`, `price_desc`, `rating`
- `page`, `limit` (default 20, max 100)
- `featured` — boolean

### Categories
```
GET    /categories                   List all categories (tree)
GET    /categories/:id               Category detail
POST   /categories                   Create (admin)
PATCH  /categories/:id               Update (admin)
DELETE /categories/:id               Delete (admin)
GET    /categories/:id/products      Products in category
```

### Collections
```
GET    /collections                  List collections
GET    /collections/:slug            Collection + products
POST   /collections                  Create (admin)
PATCH  /collections/:id              Update (admin)
POST   /collections/:id/products     Add product
DELETE /collections/:id/products/:pid Remove product
```

---

## Seller Service

```
GET    /sellers                      List approved sellers
GET    /sellers/:id                  Seller public profile
GET    /sellers/slug/:slug           Seller by slug
POST   /sellers/apply                Apply to become seller
GET    /sellers/me                   My seller profile (authenticated)
PATCH  /sellers/me                   Update my seller profile
GET    /sellers/me/products          My products
GET    /sellers/me/orders            My orders
GET    /sellers/me/stats             Dashboard stats
GET    /sellers/me/payouts           Payout history
POST   /sellers/me/payouts/request   Request payout

# Admin
GET    /admin/sellers                List all sellers
PATCH  /admin/sellers/:id/approve    Approve seller
PATCH  /admin/sellers/:id/suspend    Suspend seller
```

---

## Order Service

```
GET    /orders                       My orders
POST   /orders                       Create order
GET    /orders/:id                   Order detail
DELETE /orders/:id                   Cancel order (if pending)
POST   /orders/:id/reorder           Reorder

# Checkout flow
POST   /checkout/validate-cart       Validate cart before order
POST   /checkout/calculate-shipping  Get shipping options + cost
POST   /checkout/apply-coupon        Validate + apply coupon
POST   /checkout/place               Place order (atomic)

# Admin
GET    /admin/orders                 All orders
PATCH  /admin/orders/:id/status      Update order status
POST   /admin/orders/:id/refund      Issue refund
```

---

## Payment Service

```
POST   /payments/initiate            Initiate payment session
POST   /payments/webhook/:provider   Payment provider webhook
GET    /payments/:id                 Payment status
POST   /payments/:id/refund          Refund (admin)
```

Supported providers: `vnpay`, `momo`, `zalopay`, `stripe`

---

## Shipping Service

```
GET    /shipping/methods             Available shipping methods
POST   /shipping/calculate           Calculate shipping cost
POST   /shipping/create              Create shipment (admin/seller)
GET    /shipments/:id                Shipment detail
GET    /shipments/:id/tracking       Tracking events
POST   /shipments/:id/events         Add tracking event (webhook)
```

---

## Search Service

```
GET    /search                       Full-text search (products, sellers)
GET    /search/suggestions           Autocomplete suggestions
GET    /search/popular               Trending searches
```

Query: `?q=bún bò&type=products&region=Hue&page=1`

---

## Review Service

```
GET    /reviews                      List reviews (product or seller)
POST   /reviews                      Create review
PATCH  /reviews/:id                  Edit review (author)
DELETE /reviews/:id                  Delete review (author/admin)
POST   /reviews/:id/helpful          Mark helpful
POST   /reviews/:id/report           Report review
```

---

## Promotion Service

```
GET    /promotions                   Active promotions
GET    /coupons/:code/validate       Validate coupon
POST   /coupons                      Create coupon (admin)
PATCH  /coupons/:id                  Update coupon (admin)
GET    /admin/coupons                List all coupons (admin)
```

---

## Notification Service

```
GET    /notifications                My notifications
PATCH  /notifications/:id/read       Mark read
PATCH  /notifications/read-all       Mark all read
POST   /notifications/push/register  Register device token
DELETE /notifications/push/:token    Unregister device
```

---

## CMS Service

```
GET    /cms/pages/:slug              Page content
GET    /cms/blog                     Blog list
GET    /cms/blog/:slug               Blog post
POST   /admin/cms/pages              Create page
PATCH  /admin/cms/pages/:id          Update page
POST   /admin/cms/blog               Create blog post
PATCH  /admin/cms/blog/:id           Update blog post
```

---

## Analytics Service (Admin)

```
GET    /admin/analytics/overview     Dashboard KPIs
GET    /admin/analytics/revenue      Revenue chart (date range)
GET    /admin/analytics/products     Top products
GET    /admin/analytics/sellers      Top sellers
GET    /admin/analytics/regions      Sales by region
GET    /admin/analytics/funnel       Conversion funnel
```

---

## Media Service

```
POST   /media/upload                 Upload file (returns R2 URL)
DELETE /media/:key                   Delete file
GET    /media/signed-url             Get signed upload URL (direct upload)
```

---

## Event Contracts

```typescript
// order.created
interface OrderCreatedEvent {
  eventId: string;
  type: 'order.created';
  orderId: string;
  userId: string;
  sellerId: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  createdAt: number;
}

// payment.succeeded
interface PaymentSucceededEvent {
  eventId: string;
  type: 'payment.succeeded';
  orderId: string;
  paymentId: string;
  amount: number;
  method: string;
  paidAt: number;
}

// seller.approved
interface SellerApprovedEvent {
  eventId: string;
  type: 'seller.approved';
  sellerId: string;
  userId: string;
  storeName: string;
  approvedAt: number;
}
```
