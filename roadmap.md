# Food Studio Roadmap

**Cập nhật lần cuối:** 08/08/2026 (Post Sprint 2 + Referral + Corporate Gifting + E-Gift + Hide Price + GHN thật + fix order detail mock)

---

## Sprint 1 (✅ Hoàn thành)
- [x] Auth system (register, login, JWT)
- [x] Seller profiles + apply flow
- [x] Product CRUD + categories
- [x] Search (D1 FTS)
- [x] Cart (Durable Objects)
- [x] Checkout + Order management
- [x] Payment integration (VNPay, MoMo, ZaloPay, COD)
- [x] Shipping info page
- [x] Review system (basic CRUD)
- [x] Wishlist
- [x] Loyalty accounts (basic)
- [x] Admin dashboard (basic)

## Sprint 2 (✅ Hoàn thành)
- [x] Gift UX (gift message, hide price, gift recipient)
- [x] Delivery Date Scheduling
- [x] Coupon System (percent + fixed)
- [x] Social Proof (reviews display + ratings)
- [x] Seller Storytelling (story, press, video)
- [x] Search + Wishlist backend thật
- [x] Seed demo data (5 sellers, 16 products)
- [x] **Subscription Box** (plans, offers, subscriptions, deliveries)
- [x] **Gift Card** (templates, buy, redeem, admin)
- [x] **Monitoring** (structured logger, Sentry, feature flags)
- [x] **Review System nâng cao** (post-purchase prompts, user UI)
- [x] **Seller Dashboard** (analytics, inventory, top products)
- [x] Post-mortem Sprint 2

## Sprint 4 — Reverse-engineering Goldbelly gaps (🎯 Đang triển khai)
- [x] **Referral Program** ("Tặng 50K, nhận 50K") — `referral_codes`/`referrals` tables, `/v1/referrals` routes, hook vào register + payment.succeeded, UI `/account/referrals`, mã ref qua `?ref=` ở trang đăng ký
- [x] Fix bug: `password_hash` không được lưu khi đăng ký (auth.ts) — phát hiện khi sửa route register
- [x] **Corporate/Bulk gifting** — 1 sản phẩm gửi tới N người nhận, mỗi người 1 địa chỉ + ngày giao + lời nhắn riêng; thanh toán bank_transfer/COD xác nhận thủ công qua admin
- [x] **E-Gift / Send-by-Email** — người mua trả tiền ngay (`e_gifts`, giữ chỗ tồn kho), người nhận tự chọn địa chỉ + ngày giao khi redeem qua `/gift/redeem/[code]`, tạo order thật lúc đó
- [x] **Hide price on invoice** — fix bug: frontend checkout đã gửi `giftRecipient`/`hidePrice` từ Sprint 2 nhưng `checkout.ts` âm thầm drop (không có trong zod schema, không có cột DB); nay đã có `orders.gift_recipient_name` + `orders.hide_price`, áp dụng cho cả checkout thường, corporate gifting và e-gift
- [x] **GHN API thật** — `backend/src/lib/ghn.ts`: resolve tên tỉnh/huyện/xã (free-text) sang mã GHN qua master-data, gọi `shipping-order/fee` thật; tự động fallback về phí phẳng 30.000đ nếu thiếu `GHN_TOKEN`/`GHN_SHOP_ID`/`GHN_FROM_DISTRICT_ID` hoặc API lỗi — dùng chung cho `checkout.ts`, `corporate-orders.ts` (phí riêng từng người nhận), `e-gifts.ts`. **Chưa test với tài khoản GHN thật** (không có credentials) — xem lưu ý ⚠️ dưới
- [x] Fix: `frontend/src/app/(shop)/orders/[id]/page.tsx` (trang xác nhận đơn hàng) từng render **toàn bộ dữ liệu giả** (`mockOrder` hardcode) — nay đã nối `orderApi.get(id)` thật, hiển thị đúng gift info/hide price/ngày giao vừa thêm ở trên, có nút hủy đơn
- [ ] ⚠️ GHN chưa verify với tài khoản thật; và frontend checkout vẫn hiển thị phí ship ước tính 30.000đ trước khi submit (số cuối cùng tính ở backend có thể khác một khi GHN được cấu hình thật) — cần gọi `calculate-shipping` từ frontend trước khi submit để khớp số hiển thị

Chi tiết xem [re-golden-belly-plan.md](re-golden-belly-plan.md).

## Sprint 3 (🎯 Đang lên kế hoạch)

### Must-have (tuần 1-2)
- [ ] Pilot 20-30 seller thật — onboarding flow + KPI tracking
- [ ] Seller product management UI (CRUD từ frontend)
- [ ] Loyalty Program (points, tiers, rewards)
- [ ] Post-purchase email/SMS tracking (GHN webhook)

### Should-have (tuần 3-4)
- [ ] Seller analytics nâng cao (biểu đồ, export CSV)
- [ ] Admin — gift card issuance UI
- [ ] Mobile app — push notification + order tracking
- [ ] Inventory management UI (seller)
- [ ] Review images upload (R2)

### Nice-to-have
- [ ] Meilisearch / Vectorize integration
- [ ] Offline mode (mobile)
- [ ] Multi-language (EN)
- [ ] Affiliate program

## Sprint 4 (Phác thảo)
- [ ] Subscription auto-billing (recurring payment)
- [ ] Gift card marketplace (resell/trade)
- [ ] Seller subscription management dashboard
- [ ] Analytics + BI dashboard (admin)
- [ ] A/B testing framework
- [ ] Cost alerting automation (Cloudflare + payment gateway)
- [ ] 500+ seller onboard target Q3

---

## KPI Targets Q3 2026

| KPI | Target | Hiện tại |
|---|---|---|
| Seller onboard | 500+ | 5 (seed) |
| Products | 2,000+ | 16 (seed) |
| Completed orders | 10,000+ | 6 (seed) |
| AOV | >650,000đ | ~280,000đ |
| NPS (gift segment) | >70 | — |
| Active subscriptions | 100+ | 0 |
| Gift cards issued | 500+ | 4 (seed) |

---

## Technical Debt Backlog
- [ ] Unit tests cho routes mới (subscriptions, gift-cards)
- [ ] End-to-end tests (Playwright)
- [ ] Cost alerting automation (CF Workers + notification)
- [ ] D1 → connection pooling khi scale
- [ ] Observability: Sentry performance tracing
- [ ] Rate limiting (DDoS protection)
- [ ] CI/CD: auto-migrate D1 staging trên PR