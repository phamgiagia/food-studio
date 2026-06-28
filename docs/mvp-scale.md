# MVP → Scale Plan

## MVP Definition (Week 8)

The MVP is the minimal slice that proves the core marketplace loop works:

**A customer can discover, purchase, and receive a regional specialty product from a local seller.**

### MVP Scope

**In:**
- Email/OTP registration + login
- Browse products by category + region
- Single product detail page
- Add to cart, checkout, pay (VNPay)
- Order confirmation email
- Seller dashboard: add products, see orders
- Admin: approve sellers, see orders

**Out of MVP:**
- Mobile app
- Reviews
- Coupons
- Loyalty points
- Search
- Push notifications
- Multiple payment methods

### MVP Success Criteria

- First 10 sellers onboarded
- First 50 orders placed
- End-to-end order fulfilment working
- 0 critical security vulnerabilities
- P95 API latency < 200ms

---

## Scale Checklist

### From 1K → 10K MAU

- [ ] Full-text search via D1 FTS (already built-in SQLite)
- [ ] Redis-equivalent KV caching on hot product pages
- [ ] Image optimization (Cloudflare Images, WebP, responsive sizes)
- [ ] Email queue (don't send inline; always queue)
- [ ] Basic fraud checks (velocity limits on orders)
- [ ] CDN cache tuning (category pages, product pages)

### From 10K → 100K MAU

- [ ] Cloudflare Vectorize for semantic product search
- [ ] Recommendation engine (collaborative filtering)
- [ ] D1 read replicas per target region
- [ ] Separate analytics pipeline (don't query prod DB for reports)
- [ ] Feature flags for safe deployments
- [ ] A/B testing framework
- [ ] Seller performance dashboard (real-time)
- [ ] WAF rules tuned from real traffic patterns
- [ ] Rate limiting per seller/user tightened

### From 100K → 1M MAU

- [ ] Multi-region Cloudflare Workers (EU, APAC, US)
- [ ] Durable Objects for distributed cart/session state
- [ ] Horizontal sharding strategy for D1 (by region or seller)
- [ ] Full observability: distributed tracing (Cloudflare Trace)
- [ ] SLA-backed uptime monitoring
- [ ] Dedicated fraud ML model
- [ ] Seller finance automation (auto-settlement)
- [ ] Partner API for integrations
- [ ] Enterprise seller features (bulk product import, API access)

---

## Architecture Evolution

### MVP Architecture
```
Vercel (Next.js) → Cloudflare Worker (monolith API) → D1 + KV + R2
```

### Phase 2 Architecture
```
Vercel (Next.js) → Worker API Gateway → Domain Workers → D1 + KV + R2 + Queues
```

### Scale Architecture
```
Vercel (Next.js + Edge Runtime)
→ Cloudflare API Gateway (Worker)
→ Domain Micro-Workers (auth, catalog, orders, etc.)
→ D1 (per-domain, sharded) + KV + R2 + Queues + Durable Objects + Vectorize
→ External: payment gateways, shipping APIs, push providers
→ Observability: Cloudflare Analytics + Axiom + Sentry
```

---

## Risk Mitigation

| Risk                        | Mitigation                                    |
|-----------------------------|-----------------------------------------------|
| D1 write limits at scale    | Shard by region; use Queues to batch writes   |
| Payment gateway downtime    | Multiple providers (VNPay + MoMo fallback)    |
| Seller fraud                | Manual approval → ML scoring at scale         |
| Product quality issues      | Moderation queue + community reports          |
| Cold start latency          | Worker bundling + Cloudflare Smart Placement  |
| Data loss                   | D1 automated backups + R2 versioning          |
| Key person risk             | Architecture docs + onboarding guides         |
