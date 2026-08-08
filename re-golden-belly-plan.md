# Reverse-Engineering Plan — Goldbelly.com → Food Studio

> **Lưu ý domain**: `goldenbelly.com` không phải trang thật (DNS timeout khi fetch). Trang gốc mà README/dự án này lấy cảm hứng là **goldbelly.com** (Cloudflare bot-protection nên không fetch trực tiếp được nội dung HTML — dữ liệu dưới đây tổng hợp từ Goldbelly Help Center, blog, trang seller, và các nguồn thứ cấp qua web search). Nếu ý bạn là một domain khác, cho mình biết để điều chỉnh.

## Mục đích tài liệu

Không phải một plan code-first như `golden-belly-plan.md` (đã xong 8/10 mục). Tài liệu này làm **bản đồ tổng quát**: đối chiếu mô hình sản phẩm thật của Goldbelly.com với trạng thái hiện tại của Food Studio, để nhìn ra bức tranh toàn cảnh — cái gì đã "clone" đúng tinh thần, cái gì còn lệch, cái gì chưa đụng tới.

---

## 1. Mô hình Goldbelly.com (reverse-engineered)

### 1.1 Core proposition
Marketplace curated cho **gourmet food & food gifts** — không phải catalog mở, mà "American's most legendary foods" được tuyển chọn thủ công. Mỗi seller (nhà hàng/nghệ nhân) có storefront riêng, không phải chỉ là product listing.

### 1.2 Discovery & catalog
- Category theo **chủ đề cảm xúc** (occasion-based: quà sinh nhật, quà tân gia, lễ hội...) thay vì chỉ theo loại thực phẩm
- Filter theo dietary preference (gluten-free, vegan) và meal type (breakfast, mains, dessert)
- Mỗi seller có trang storefront riêng kể câu chuyện thương hiệu
- "As seen in" — logo báo chí, curation editorial

### 1.3 Gifting (trụ cột doanh thu — ~40%+ theo public reporting)
- **Gift note** kèm đơn hàng thường
- **Send by Email / Send as E-Gift**: người mua chọn sản phẩm + gửi email/SMS thông báo cho người nhận; **người nhận tự chọn địa chỉ giao và ngày giao** (không phải người mua chọn hộ) — đây là điểm khác biệt lớn nhất so với "gift message" thông thường
- Tuỳ chọn gửi thông báo **ngay lập tức hoặc lên lịch** (delayed notification)
- Ẩn giá trên hoá đơn (hide price on invoice)
- **Gift Cards**: e-gift card (gửi ngay/lên lịch qua email hoặc SMS) + physical gift card (ship qua UPS SurePost, có upgrade tốc độ)
- **Corporate/Bulk gifting**: đặt số lượng lớn, mỗi người nhận có địa chỉ + ngày giao riêng, gift message cá nhân hoá theo từng người

### 1.4 Loyalty — "Belly Rewards Points"
- Earn: **5 điểm / $1 chi tiêu**
- Điểm **hết hạn sau 183 ngày không phát sinh đơn hàng**
- Redeem điểm → discount cho đơn tiếp theo
- Referral: "Give $25, Get $25"

### 1.5 Seller / Logistics model
- Seller tự đóng gói và ship từ cơ sở của họ (không qua kho trung tâm)
- **Goldbelly Logistics**: chuẩn hoá bao bì giữ nhiệt, tự động in nhãn, đàm phán giá FedEx/UPS chiết khấu
- Cửa sổ giao hàng 1–3 ngày cho đơn xa
- Bao bì eco-conscious, temperature-controlled

### 1.6 Payment
Amex, Discover, Mastercard, Visa, PayPal, Apple Pay, Android Pay, **Klarna** (BNPL) — đáng chú ý: có buy-now-pay-later, dự án hiện chưa có.

---

## 2. Đối chiếu với Food Studio hiện tại

Nguồn: `roadmap.md`, `golden-belly-plan.md`, source code (`backend/src/routes/*`, `frontend/src/app/(shop)/*`).

| Trụ cột Goldbelly | Trạng thái Food Studio | Ghi chú lệch pha |
|---|---|---|
| Curated storefront/category cảm xúc | 🟡 Có `collections`, `sellers/[slug]` với story/press/video (đã làm Sprint 2) | Category vẫn nghiêng về vùng miền (63 tỉnh) hơn occasion-based; chưa có dietary/meal-type filter |
| Gift note đơn giản | ✅ `checkout.ts` có `giftMessage` field | — |
| **Send by Email / E-Gift** (người nhận tự chọn ngày+địa chỉ) | ✅ Có (08/08/2026) | `e-gifts.ts` — người mua trả tiền theo giá chốt, người nhận tự nhập địa chỉ + ngày giao khi redeem |
| Hide price on invoice | ✅ Có (08/08/2026) | Fix bug: frontend đã gửi field này từ Sprint 2 nhưng backend âm thầm bỏ qua — nay đã nối `orders.hide_price` |
| Gift Cards (e-gift + physical) | 🟡 Có `gift-cards.ts` khá đầy đủ (buy, validate, apply, redeem, admin list) | Chưa có gửi qua SMS; chưa có physical card + shipping; chưa có UI issuance ở admin (roadmap Sprint 3 "should-have" còn TODO) |
| Corporate/Bulk gifting | ✅ Có (08/08/2026) | `corporate-orders.ts` — 1 sản phẩm/đơn, nhập tay người nhận, thanh toán bank_transfer/COD xác nhận thủ công qua admin |
| Loyalty — Belly Rewards (5đ/$1, expire 183 ngày) | ✅ Có `loyalty.ts` — nhưng model khác: 4-tier (Đồng/Bạc/Vàng/Bạch Kim) theo lifetime points, earn rate 0.001 điểm/VND × tier multiplier, **không có expiry** | Model tier phức tạp hơn Goldbelly (tốt cho retention) nhưng thiếu điểm hết hạn — có thể là chủ đích khác, không phải gap |
| Referral "Give $25 Get $25" | ✅ Có (08/08/2026) | "Tặng 50K, nhận 50K" — `referrals.ts` + UI `/account/referrals` |
| Seller tự ship, chuẩn hoá bao bì | 🟡 Có `shipping/page.tsx` mô tả quy trình; phí ship nay gọi GHN thật qua `lib/ghn.ts` (fallback an toàn nếu chưa có credentials) | "Post-purchase email/SMS tracking (GHN webhook)" ở roadmap Sprint 3 vẫn còn TODO — đây là bước khác (theo dõi đơn), không phải tính phí |
| Payment (đa dạng, có BNPL) | ✅ VNPay/MoMo/ZaloPay/COD | Không có BNPL — hợp lý vì thị trường VN chưa phổ biến Klarna-style, nhưng có thể xét Kredivo/Fundiin nếu muốn bám sát |
| Subscription box | ✅ Có `subscriptions.ts` khá đầy đủ (plans, seller offers, seed 4 gói vùng miền) | Goldbelly không có subscription box chính thức nổi bật — đây là tính năng dự án **tự thêm**, không phải clone |
| Review + social proof | ✅ Có `reviews.ts`, review prompts (Sprint 2), rating hiển thị trang chủ | Ảnh review (`0005_review_prompts.sql`) — Sprint 3 "Review images upload (R2)" còn TODO |

---

## 3. Điểm tổng quan hiện tại

Dựa trên gap thật (không chỉ theo golden-belly-plan.md cũ — file đó tự chấm 62→85+ dựa trên 10 mục nội bộ, chưa tính các mục reverse-engineer mới ở trên):

| Trụ cột | Trạng thái |
|---|---|
| Core marketplace (catalog, cart, checkout, order) | ✅ Hoàn chỉnh (trừ trang xác nhận đơn hàng — xem ⚠️ bên dưới) |
| Gift note cơ bản | ✅ |
| **E-Gift / Send-by-Email (người nhận tự chọn)** | ✅ (08/08/2026) |
| Hide price on invoice (checkout thường) | ✅ (08/08/2026) |
| Corporate/bulk gifting | ✅ (08/08/2026, scope rút gọn) |
| Referral program | ✅ (08/08/2026) |
| Gift card (single recipient) | ✅ |
| Loyalty program | ✅ (model riêng, không sao chép 1:1) |
| Logistics thật (GHN/GHTK API) | ✅ Code xong (08/08/2026), chưa verify với tài khoản GHN thật — an toàn vì tự fallback |
| Seller storefront storytelling | ✅ |
| Subscription box | ✅ (tính năng mở rộng ngoài Goldbelly) |
| Review system + ảnh | 🟡 Text review xong, ảnh chưa |

---

## 4. Đề xuất bổ sung theo thứ tự ưu tiên

### 🔴 Critical — đúng bản chất "gifting marketplace" của Goldbelly

**4.1 E-Gift flow (Send by Email) — ✅ DONE (08/08/2026)**
- Migration `0010_egift.sql`: bảng `e_gifts` (code, sender_id, product, quantity, recipient_email/phone, message, hide_price, status, redeemed_order_id, expires_at 90 ngày)
- `backend/src/routes/e-gifts.ts`: `POST /v1/e-gifts` (sender chọn sản phẩm + trả tiền ngay theo giá chốt, giữ chỗ tồn kho, gửi email — theo đúng convention "trust the request" mà `gift-cards.ts POST /buy` đã dùng, không thêm cổng thanh toán riêng), `GET /v1/e-gifts/validate/:code` (public preview), `POST /v1/e-gifts/:code/redeem` (auth — recipient nhập địa chỉ + ngày giao riêng, tạo order thật lúc này)
- UI: `frontend/src/app/(shop)/gift/send/page.tsx` (gửi) + `frontend/src/app/(shop)/gift/redeem/[code]/page.tsx` (nhận — yêu cầu đăng nhập trước khi nhập địa chỉ)

**4.2 Hide price on invoice — ✅ DONE (08/08/2026)**
- Phát hiện bug: `frontend/checkout/page.tsx` đã có sẵn state `giftRecipient`/`hidePrice` và gửi trong payload từ trước, nhưng `checkout.ts` không khai báo 2 field này trong zod schema nên bị Zod âm thầm strip — **tính năng tưởng đã xong nhưng chưa bao giờ hoạt động**
- Fix: thêm `orders.gift_recipient_name` + `orders.hide_price` (migration `0009_gift_fields.sql`), nối vào `placeOrderSchema` + INSERT của `checkout.ts`, và áp dụng luôn cho `corporate-orders.ts` (hide_price theo cả lô) + `e-gifts.ts` (hide_price theo từng gift)

### 🟡 High — tăng AOV & giữ chân

**4.3 Referral program — ✅ DONE (08/08/2026)**
- Bảng `referral_codes` + `referrals` (migration `0007_referral.sql`)
- `backend/src/routes/referrals.ts`: `GET /v1/referrals/me` (code + stats + danh sách bạn bè), `GET /v1/referrals/validate` (public, hiện tên người giới thiệu ở trang đăng ký)
- Nối vào `auth.ts` (nhận `referralCode` lúc đăng ký) và `order-events.ts` (`onPaymentSucceeded` → thưởng 2 chiều khi đơn đầu tiên của người được giới thiệu thanh toán thành công)
- Reward: sinh 2 coupon fixed 50.000đ (60 ngày), tái dùng bảng `coupons` có sẵn
- UI: `frontend/src/app/(shop)/account/referrals/page.tsx` (mã, link chia sẻ, thống kê, danh sách bạn bè + trạng thái) + banner ở trang đăng ký khi có `?ref=`
- Fix kèm: bug `password_hash` không được lưu khi đăng ký ở `auth.ts` (tài khoản tạo xong không đăng nhập lại được) — phát hiện khi sửa cùng đoạn code

**4.4 Corporate/Bulk gifting — ✅ DONE (08/08/2026), scope rút gọn**
- Migration `0008_corporate_gifting.sql`: `corporate_orders` (1 sản phẩm, số lượng/người nhận, tổng tiền) + `corporate_order_recipients` (địa chỉ + ngày giao + message riêng từng người, link tới `order_id` thật)
- `backend/src/routes/corporate-orders.ts`: `POST /` tạo đơn cha + fan-out N đơn `orders` thật (validate tồn kho theo tổng số lượng, giữ chỗ inventory 1 lần), `GET /mine`, `GET /:id`
- Thanh toán: **bank_transfer** (mặc định, phù hợp B2B VN — công ty chuyển khoản) hoặc **cod**; xác nhận qua `PATCH /v1/admin/corporate-orders/:id/confirm-payment` (role admin/super_admin/finance) thay vì tích hợp cổng thanh toán online — chưa cần webhook VNPay/MoMo cho use case này
- UI: `frontend/src/app/(shop)/corporate-gifting/page.tsx` — chọn 1 sản phẩm, nhập tay danh sách người nhận (thêm/xoá dòng), lịch sử đơn đã đặt
- **Cắt scope so với đề xuất gốc**: chỉ 1 sản phẩm/đơn (không multi-product), nhập tay người nhận (chưa có CSV upload) — đủ cho nhu cầu "gửi 1 hộp quà Tết cho cả phòng ban"; multi-product + CSV để lại cho v2 nếu cần

**4.5 Logistics thật — ✅ DONE (08/08/2026), có giới hạn**
- `backend/src/lib/ghn.ts`: resolve tên tỉnh/huyện/xã tự do (dữ liệu hiện có) sang mã số GHN qua `master-data/province|district|ward`, sau đó gọi `shipping-order/fee` thật — tự động fallback về 30.000đ nếu chưa cấu hình `GHN_TOKEN`/`GHN_SHOP_ID`/`GHN_FROM_DISTRICT_ID` hoặc bất kỳ bước nào lỗi (không match tên, API down...)
- Dùng chung cho `checkout.ts` (đơn thường), `corporate-orders.ts` (tính riêng từng người nhận, không còn 1 mức phí chung), `e-gifts.ts` (tính lúc redeem)
- **Giới hạn cần biết**:
  1. Chưa test với tài khoản GHN thật (không có credentials trong môi trường này) — code đúng theo doc API GHN v2 nhưng chưa verify end-to-end
  2. Trong môi trường hiện tại (chưa set `GHN_TOKEN`) hành vi **không đổi gì cả** — vẫn dùng fallback 30.000đ y hệt trước đây, an toàn 100%
  3. Frontend checkout vẫn hiển thị "phí ship 30.000đ" hardcode trước khi submit (chưa gọi `calculate-shipping`) — một khi GHN thật được bật, số hiển thị trước submit có thể lệch với số thực tính ở backend lúc đặt hàng. Cần việc riêng: gọi API tính phí trước khi hiển thị tổng tiền ở checkout/corporate-gifting/gift-send

### 🟢 Medium — polish, hoàn thiện phần đã có dở

**4.6 Review images (R2)** — đã note trong roadmap Sprint 3, chưa làm
**4.7 Admin gift card issuance UI** — đã note trong roadmap Sprint 3, chưa làm
**4.8 Dietary/meal-type filter** trong search nâng cao (bổ sung cho mục 6 cũ trong `golden-belly-plan.md`)

---

## 5. Việc cần làm tiếp theo

1. Xác nhận lại domain thật cần soi (`goldenbelly.com` vs `goldbelly.com`) — nếu là một sản phẩm khác hoàn toàn, phần Mục 1 ở trên cần làm lại từ đầu bằng cách truy cập trực tiếp (browser tool hiện đang mất kết nối, cần thử lại).
2. ~~Gap: trang xác nhận đơn hàng render mock data~~ — ✅ đã fix (08/08/2026), xem Mục 4.5.
3. ~~GHN API thật~~ — ✅ code xong (08/08/2026), còn 2 việc phụ thuộc bên ngoài không tự làm được trong môi trường này:
   - Cần tài khoản GHN thật (`GHN_TOKEN`/`GHN_SHOP_ID`/`GHN_FROM_DISTRICT_ID`) để verify end-to-end
   - Nối `calculate-shipping` vào frontend (checkout/corporate-gifting/gift-send) để số tiền hiển thị trước khi submit khớp với số backend tính khi đặt hàng thật
