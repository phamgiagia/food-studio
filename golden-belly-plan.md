# Food Studio → Goldbelly-Level Plan

## Mục tiêu: 62/100 → 88+/100

Dựa trên phân tích gap so với Goldbelly, đây là roadmap bù gap theo thứ tự ưu tiên.

---

## Trạng thái

| # | Feature | Priority | Status |
|---|---|---|---|
| 1 | Delivery date scheduling | 🔴 Critical | ⬜ TODO |
| 2 | Gift UX (gift note + send-by-email) | 🔴 Critical | ⬜ TODO |
| 3 | Coupon/voucher wired at checkout | 🔴 Critical | ⬜ TODO |
| 4 | Logistics & shipping info page | 🟡 High | ⬜ TODO |
| 5 | Seller storytelling (story, video, press) | 🟡 High | ⬜ TODO |
| 6 | Search nâng cao (filter region/price/rating) | 🟡 High | ⬜ TODO |
| 7 | Social proof section (homepage) | 🟡 High | ⬜ TODO |
| 8 | Wishlist API kết nối thật | 🟢 Medium | ⬜ TODO |
| 9 | Subscription boxes | 🟢 Medium | ⬜ TODO |
| 10 | Gift cards | 🟢 Medium | ⬜ TODO |

---

## Chi tiết từng feature

### 1. Delivery Date Scheduling 🔴

**Lý do**: Đặc sản tươi (hải sản, trái cây, bánh) cần giao đúng ngày. Quan trọng nhất với gift use case.

**Files cần sửa**:
- `frontend/src/app/(shop)/checkout/page.tsx` — thêm `DatePicker` field "Ngày giao hàng mong muốn"
- `frontend/src/hooks/useOrders.ts` — thêm `deliveryDate` vào payload
- `backend/src/routes/checkout.ts` — persist `desired_delivery_date` vào orders table
- `backend/src/routes/orders.ts` — trả về `desired_delivery_date` trong order detail

**UI**: Date picker với `min = today + 1`, `max = today + 14`, highlight những ngày không giao (Chủ nhật). Hiển thị "Giao trong 2–4 ngày làm việc" nếu để trống.

**Schema thêm vào orders**:
```sql
ALTER TABLE orders ADD COLUMN desired_delivery_date TEXT; -- ISO date YYYY-MM-DD
```

---

### 2. Gift UX 🔴

**Lý do**: Gifting là use case lớn nhất của Goldbelly (~40% revenue). Cần gift note + "Gửi qua Email".

**Files cần tạo**:
- `frontend/src/components/checkout/GiftOptions.tsx` — toggle "Đây là quà tặng", gift message textarea, recipient name
- `frontend/src/app/(shop)/checkout/page.tsx` — nhúng GiftOptions vào form

**Files cần sửa**:
- `backend/src/routes/checkout.ts` — persist `is_gift`, `gift_message`, `gift_recipient_name`
- `backend/src/queues/order-events.ts` — khi `is_gift = true`, queue email thông báo cho người nhận

**UI GiftOptions component**:
```
[ ] Đây là quà tặng 🎁
  ├── Tên người nhận: ___________
  ├── Tin nhắn (max 200 ký tự): ___________
  └── [ ] Ẩn giá tiền trên hóa đơn
```

---

### 3. Coupon/Voucher Wired 🔴

**Lý do**: Input đã có ở cart nhưng chưa kết nối backend.

**Files cần sửa**:
- `frontend/src/app/(shop)/cart/page.tsx` — kết nối coupon input với `useCoupon` hook, hiển thị discount
- `frontend/src/hooks/useOrders.ts` — thêm `applyCoupon(code)` mutation
- `frontend/src/app/(shop)/checkout/page.tsx` — truyền `couponCode` vào placeOrder payload
- `backend/src/routes/checkout.ts` — validate coupon: check `promotions` table, apply discount, return error nếu invalid/expired

**Logic backend**:
```
POST /v1/checkout/validate-coupon { code }
→ { valid: true, discount: 50000, type: 'fixed' | 'percent' }
→ { valid: false, reason: 'Mã đã hết hạn' }
```

---

### 4. Logistics & Shipping Info Page 🟡

**Lý do**: Người mua đặc sản cần biết cách ship đảm bảo chất lượng (bảo quản lạnh, đóng gói, thời gian).

**Files cần tạo**:
- `frontend/src/app/(shop)/shipping/page.tsx` — trang "Chúng tôi ship như thế nào"
- `frontend/src/components/product/ShippingBadge.tsx` — badge nhỏ trên product detail

**Nội dung trang shipping**:
- Đóng gói: túi giữ nhiệt, đá khô, hộp carton 3 lớp
- Carrier: GHTK, GHN, ViettelPost cho đơn tiêu chuẩn; J&T Express cho đơn hỏa tốc
- Thời gian: Nội thành 1–2 ngày, liên tỉnh 2–4 ngày
- Cam kết: Hoàn tiền nếu hàng hỏng khi nhận
- FAQ: "Đặc sản có thể ship xa không?", "Mùa hè ship thế nào?"

**ShippingBadge** trên product detail page (dưới AddToCartButton):
```
🧊 Đóng gói bảo quản lạnh  ✈️ Giao toàn quốc  ↩️ Hoàn tiền nếu hỏng
```

---

### 5. Seller Storytelling 🟡

**Lý do**: Goldbelly dùng storytelling để justify giá premium. "Câu chuyện người bán" tăng trust và AOV.

**Files cần sửa**:
- `frontend/src/app/(shop)/sellers/[slug]/page.tsx` — thêm sections: story paragraph, featured quote, "Sản phẩm nổi bật", "Được báo chí nhắc đến"
- `frontend/src/components/seller/SellerCard.tsx` — thêm tagline ngắn dưới tên
- `frontend/src/components/home/SellerStories.tsx` — đọc `seller.story` từ API thay vì hardcode

**Backend thêm fields vào sellers**:
- `story` TEXT — câu chuyện người bán (500–1000 chars)
- `tagline` TEXT — slogan ngắn (max 80 chars)
- `press_mentions` JSON — `[{ source, quote, url }]`
- `video_url` TEXT — YouTube/Vimeo embed

---

### 6. Search Nâng Cao 🟡

**Lý do**: Search hiện tại chỉ có `q=`. Cần filter theo vùng miền, khoảng giá, rating, category.

**Files cần sửa**:
- `frontend/src/app/(shop)/search/page.tsx` — thêm sidebar filters: Region, Price range slider, Min rating, Category checkboxes
- `frontend/src/app/(shop)/products/page.tsx` — thêm sort dropdown (Mới nhất, Bán chạy, Giá tăng/giảm)
- `frontend/src/lib/api.ts` — thêm params `minPrice`, `maxPrice`, `minRating`, `region` vào `productApi.list()`
- `backend/src/routes/products.ts` — thêm WHERE clauses cho các params mới (đã có infrastructure)

---

### 7. Social Proof Section (Homepage) 🟡

**Lý do**: Tăng trust ngay trên homepage. Goldbelly dùng "as seen in" + customer count.

**Files cần tạo**:
- `frontend/src/components/home/SocialProof.tsx` — section giữa TrendingProducts và SellerStories

**Nội dung**:
```
"Được tin dùng bởi 10,000+ gia đình Việt"
[Logo báo: VnExpress] [Tuổi Trẻ] [Thanh Niên] [Dân Trí]
★★★★★ "Đặc sản ngon hơn mua ở chợ..." — Chị Lan, Hà Nội
★★★★★ "Giao hàng nhanh, đóng gói cẩn thận..." — Anh Minh, TP.HCM
```

**Files cần sửa**:
- `frontend/src/app/(shop)/page.tsx` — thêm `<SocialProof />` sau `<TrendingProducts />`

---

### 8. Wishlist API Kết Nối 🟢

**Lý do**: Trang wishlist đang dùng mock data.

**Files cần sửa**:
- `frontend/src/app/(shop)/account/wishlist/page.tsx` — convert sang `'use client'`, dùng `useWishlist()` hook
- `frontend/src/hooks/useWishlist.ts` — tạo mới: `useWishlist()`, `addToWishlist(productId)`, `removeFromWishlist(productId)`
- `frontend/src/lib/api.ts` — thêm `wishlistApi.list()`, `wishlistApi.add(productId)`, `wishlistApi.remove(productId)`
- `frontend/src/components/product/AddToCartButton.tsx` — thêm heart icon button gọi `addToWishlist`
- `backend/src/routes/` — tạo `wishlists.ts` route: `GET /v1/wishlists/me`, `POST /v1/wishlists`, `DELETE /v1/wishlists/:productId`

---

### 9. Subscription Boxes 🟢

**Lý do**: Tăng LTV customer, recurring revenue.

**Files cần tạo**:
- `frontend/src/app/(shop)/subscriptions/page.tsx` — trang chọn gói subscription
- `backend/src/routes/subscriptions.ts` — CRUD subscription orders, billing cycle

**Gói dự kiến**:
- Hộp Miền Bắc (hàng tháng): 6 đặc sản từ các tỉnh phía Bắc — 350,000đ/tháng
- Hộp Miền Trung: Hải sản + gia vị Huế/Đà Nẵng — 400,000đ/tháng
- Hộp Miền Nam: Trái cây + đặc sản Nam Bộ — 380,000đ/tháng
- Hộp Tây Nguyên: Cà phê + mật ong + tiêu — 320,000đ/tháng

---

### 10. Gift Cards 🟢

**Files cần tạo**:
- `frontend/src/app/(shop)/gift-cards/page.tsx` — chọn mệnh giá, cá nhân hóa, thanh toán
- `backend/src/routes/gift-cards.ts` — generate unique code, store balance, redeem at checkout

**Mệnh giá**: 100K / 200K / 500K / 1M / Tùy chỉnh

---

## Thứ tự thực hiện

```
Sprint 1 (Critical — ảnh hưởng revenue):
  ├── [3] Coupon wired          ~2h
  ├── [1] Delivery date         ~3h
  └── [2] Gift UX               ~4h

Sprint 2 (High — tăng trust & conversion):
  ├── [4] Logistics page        ~2h
  ├── [7] Social proof          ~1.5h
  ├── [5] Seller storytelling   ~3h
  └── [6] Search nâng cao       ~4h

Sprint 3 (Medium — retention & LTV):
  ├── [8] Wishlist API          ~2h
  ├── [9] Subscription boxes    ~6h
  └── [10] Gift cards           ~5h
```

**Tổng ước tính**: ~32h dev

---

## Kết quả kỳ vọng sau hoàn thành

| Hạng mục | Trước | Sau |
|---|:---:|:---:|
| Gift features | 0 | 8 |
| Delivery scheduling | 0 | 8 |
| Checkout flow | 6 | 9 |
| Trust signals | 3 | 7 |
| Seller storytelling | 4 | 7 |
| Search & filter | 4 | 7 |
| **Tổng** | **62** | **85+** |
