# Deployment Plan

## Environments

| Environment | Frontend / Admin         | Backend              | Database      |
|-------------|--------------------------|----------------------|---------------|
| local       | `next dev` (localhost)   | `wrangler dev`       | D1 local      |
| staging     | Vercel preview (branch)  | CF Workers (staging) | D1 staging    |
| production  | Vercel (main branch)     | CF Workers (prod)    | D1 production |

---

## Cloudflare Resources

```
Account
├── Workers
│   ├── food-studio-api-gateway      # Request routing, auth, rate limiting
│   ├── food-studio-auth             # Auth domain service
│   ├── food-studio-catalog          # Products, categories, collections
│   ├── food-studio-orders           # Orders, checkout
│   ├── food-studio-payments         # Payment orchestration
│   ├── food-studio-shipping         # Shipping + tracking
│   ├── food-studio-notifications    # Push, email, in-app
│   ├── food-studio-search           # Full-text + semantic search
│   ├── food-studio-media            # Upload signing, image transforms
│   └── food-studio-analytics        # Reporting aggregations
│
├── D1 Databases
│   ├── food-studio-db-prod
│   └── food-studio-db-staging
│
├── KV Namespaces
│   ├── SESSIONS
│   ├── CACHE
│   └── FEATURE_FLAGS
│
├── R2 Buckets
│   ├── food-studio-media-prod        # Product images, seller logos
│   └── food-studio-media-staging
│
├── Queues
│   ├── order-events
│   ├── notification-queue
│   ├── search-indexing
│   └── analytics-events
│
├── Durable Objects
│   ├── CartDO                        # Per-user cart state
│   └── InventoryReservationDO        # Atomic stock reservation
│
└── Pages (optional CDN for static assets)
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

Triggers:
  push to main     → deploy to production
  push to staging  → deploy to staging
  pull_request     → lint + type-check + unit tests + preview deploy

Jobs:
  1. lint-and-typecheck
     - pnpm install
     - turbo run lint type-check

  2. test
     - turbo run test
     - Upload coverage to Codecov

  3. build
     - turbo run build
     - Cache .next and dist

  4. deploy-backend (depends on build)
     - wrangler deploy --env production (or staging)
     - Run D1 migrations

  5. deploy-frontend (depends on build)
     - vercel deploy --prod (or --prebuilt for preview)

  6. deploy-admin (depends on build)
     - vercel deploy --prod (separate project)
```

### Database Migrations

```
backend/src/db/migrations/
  0001_initial_schema.sql
  0002_add_loyalty.sql
  0003_add_affiliate.sql
  ...

Migration command:
  wrangler d1 migrations apply food-studio-db-prod
```

---

## Domain Setup

```
foodstudio.vn          → Vercel (frontend)
admin.foodstudio.vn    → Vercel (admin portal)
api.foodstudio.vn      → Cloudflare Workers (API gateway)
media.foodstudio.vn    → Cloudflare R2 + CDN
```

---

## Secrets Management

All secrets stored in Cloudflare Workers secrets (never in code or `.env` in CI).

```bash
# Set secrets per worker
wrangler secret put JWT_SECRET --env production
wrangler secret put VNPAY_SECRET --env production
wrangler secret put MOMO_KEY --env production
wrangler secret put SENDGRID_KEY --env production
```

For local dev, use `.dev.vars` (gitignored).

---

## Observability Stack

| Tool            | Purpose                          | Integration          |
|-----------------|----------------------------------|----------------------|
| Cloudflare Logs | Worker request logs              | Native               |
| Axiom           | Structured log aggregation       | Worker log drain     |
| Sentry          | Error tracking + source maps     | SDK in all services  |
| Cloudflare AI   | Anomaly detection (optional)     | CF Analytics         |
| UptimeRobot     | External uptime monitoring       | Status page          |

---

## Rollback Strategy

1. **Frontend**: Vercel instant rollback (previous deployment 1-click restore)
2. **Workers**: `wrangler rollback` to previous version
3. **Database**: No automatic rollback — migrations are additive only; use compensating migrations
4. **Feature flags**: Disable new feature via KV flag without redeployment

---

## Production Checklist

Before first production deploy:

- [ ] Domain DNS configured
- [ ] SSL certificates active
- [ ] Cloudflare WAF enabled
- [ ] Rate limiting rules set
- [ ] D1 migrations run
- [ ] All secrets set in Workers
- [ ] Vercel environment variables set
- [ ] Payment gateway webhooks configured
- [ ] Email provider (SendGrid) domain verified
- [ ] Error monitoring (Sentry) project created
- [ ] Uptime monitoring enabled
- [ ] Backup schedule confirmed (D1 automated)
- [ ] Load test run (k6 or Artillery)
- [ ] Security scan complete
