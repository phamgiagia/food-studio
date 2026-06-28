# Development Roadmap

## Phase 0 — Foundation (Weeks 1–2)

- [ ] Monorepo setup (Turborepo + pnpm workspaces)
- [ ] Shared packages: `@food-studio/types`, `@food-studio/utils`
- [ ] Cloudflare account + D1/KV/R2/Queues provisioned
- [ ] CI/CD pipelines (GitHub Actions → Vercel + Cloudflare)
- [ ] Local dev environment documented
- [ ] Base D1 schema applied
- [ ] Auth service skeleton (JWT, sessions)
- [ ] API Gateway Worker deployed

## Phase 1 — MVP Core (Weeks 3–8)

### Week 3–4: Auth + Seller Onboarding
- [ ] User registration/login (email + OTP)
- [ ] JWT + refresh token flow
- [ ] Seller application + admin approval flow
- [ ] Basic seller dashboard (product upload)

### Week 5–6: Catalog + Discovery
- [ ] Product CRUD (create, edit, images)
- [ ] Category tree
- [ ] Product listing + filtering
- [ ] Search (D1 FTS initially)
- [ ] Product detail page
- [ ] Seller public page

### Week 7–8: Commerce Core
- [ ] Cart (Durable Objects)
- [ ] Checkout flow (address, shipping selection)
- [ ] VNPay payment integration
- [ ] Order creation + confirmation
- [ ] Basic order status (pending → confirmed → shipped)
- [ ] Email notifications (order confirmation)

## Phase 2 — Complete Commerce (Weeks 9–14)

### Week 9–10: Fulfillment
- [ ] Shipping integration (GHN / GHTK)
- [ ] Shipment tracking
- [ ] Inventory management
- [ ] Low stock alerts

### Week 11–12: Engagement
- [ ] Review system (post-delivery prompt)
- [ ] Wishlist
- [ ] Coupons + promotions engine
- [ ] Loyalty points (earn on purchase)

### Week 13–14: Admin Portal
- [ ] Admin dashboard (revenue, orders, KPIs)
- [ ] Product moderation queue
- [ ] Order management
- [ ] Seller management
- [ ] User management

## Phase 3 — Growth (Weeks 15–20)

### Week 15–16: Mobile App
- [ ] Expo setup + navigation
- [ ] Product discovery feed
- [ ] Cart + checkout
- [ ] Push notifications
- [ ] Order tracking

### Week 17–18: Advanced Features
- [ ] MoMo + ZaloPay payment methods
- [ ] Multi-address checkout
- [ ] Subscription boxes
- [ ] Gift orders + gift messages
- [ ] Scheduled delivery

### Week 19–20: Intelligence + Performance
- [ ] Cloudflare Vectorize search (semantic)
- [ ] Recommendation engine
- [ ] Personalized homepage
- [ ] Analytics dashboard
- [ ] A/B testing framework (feature flags)

## Phase 4 — Scale (Weeks 21–26)

- [ ] Multi-language support (next-intl: vi/en)
- [ ] Affiliate / referral program
- [ ] Fraud monitoring (ML-based scoring)
- [ ] Seller finance dashboard (settlement, payouts)
- [ ] Blog / editorial CMS
- [ ] PWA (offline, install prompt)
- [ ] Full observability (tracing, error tracking, uptime)
- [ ] Load testing + performance tuning
- [ ] Security audit + penetration test
- [ ] App Store + Play Store submission

---

## Milestones

| Date       | Milestone                          |
|------------|------------------------------------|
| Week 2     | Infrastructure ready, auth working |
| Week 8     | MVP: buy a product end-to-end      |
| Week 14    | Full marketplace with admin        |
| Week 20    | Mobile app + growth features       |
| Week 26    | Production-ready, scaled platform  |
