# Food Studio Roadmap

**Cập nhật lần cuối:** 03/08/2026 (Post Sprint 2)

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