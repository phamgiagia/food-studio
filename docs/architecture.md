# System Architecture

## Overview

Food Studio is a multi-tenant regional specialty marketplace (đặc sản vùng miền) built on a Cloudflare-first, edge-native architecture. The platform consists of four independent deployable units sharing a common backend.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
│                                                                      │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │  /frontend   │  │   /admin     │  │   /mobile    │             │
│   │  Next.js     │  │  Next.js     │  │    Expo      │             │
│   │  Vercel      │  │  Vercel      │  │ iOS/Android  │             │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└──────────┼────────────────┼────────────────┼────────────────────────┘
           │                │                │
           └────────────────┼────────────────┘
                            │ HTTPS / REST
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                                    │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │    WAF      │  │  Turnstile  │  │ Rate Limit  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              API Gateway (Worker)                              │  │
│  │  JWT validation · RBAC · Request routing · Versioning         │  │
│  └──────────────────────────┬────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────▼────────────────────────────────────┐  │
│  │                    Service Workers                             │  │
│  │                                                               │  │
│  │  auth     catalog   seller   order    payment  shipping      │  │
│  │  search   promo     review   notif    media    recommend     │  │
│  │  cms      analytics fraud    inventory                       │  │
│  └──────────────────────────┬────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────▼────────────────────────────────────┐  │
│  │                    Data Layer                                  │  │
│  │                                                               │  │
│  │   D1 (relational)    KV (cache/session)   R2 (media/blobs)  │  │
│  │   Durable Objects    Queues (async jobs)   Vectorize (search)│  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Domain Boundaries

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Identity      │    │    Catalog      │    │    Commerce     │
│                 │    │                 │    │                 │
│  auth-service   │    │ catalog-service │    │  order-service  │
│  User accounts  │    │ product-service │    │ payment-service │
│  Sessions       │◄──►│ seller-service  │◄──►│ promo-service   │
│  RBAC           │    │ search-service  │    │ loyalty-service │
│  MFA            │    │ media-service   │    │ cart (KV+DO)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Fulfillment   │    │   Engagement    │    │   Operations    │
│                 │    │                 │    │                 │
│ shipping-svc    │    │ review-service  │    │ analytics-svc   │
│ inventory-svc   │◄──►│ notif-service   │◄──►│ fraud-service   │
│ tracking        │    │ recommend-svc   │    │ cms-service     │
│ returns         │    │ email/push      │    │ audit-service   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Event Bus Architecture

All inter-service communication uses a typed event contract over Cloudflare Queues.

```
Producer ──► Queue ──► Consumer Worker ──► Side effects

Events:
  order.created     → payment-service, inventory-service, notification-service
  order.paid        → order-service (confirm), shipping-service, seller-service
  order.shipped     → notification-service, tracking
  order.delivered   → review-service (trigger prompt), loyalty-service
  product.created   → search-service (index), catalog-service
  seller.approved   → notification-service, seller-service
  user.registered   → notification-service (welcome), recommendation-service
  payment.failed    → notification-service, fraud-service
```

## Caching Strategy

```
Layer 1 — Cloudflare Cache (CDN)
  Static assets: 1 year
  Product pages: 5 min (stale-while-revalidate)
  Category pages: 10 min
  Homepage: 2 min

Layer 2 — KV (Edge cache)
  User sessions: 24h
  Product detail: 5 min
  Search results: 2 min
  Feature flags: 1 min

Layer 3 — Application cache (TanStack Query)
  Client-side stale times per route
```

## Security Architecture

```
Zero Trust Model:
  - All inter-service calls require signed JWT (service tokens)
  - No implicit trust between services
  - All secrets in Cloudflare Secrets (never in code)

Request flow:
  Client → Turnstile challenge (bot protection)
         → WAF (OWASP rules)
         → Rate limiter (per IP, per user, per seller)
         → API Gateway (JWT validation)
         → Service Worker (RBAC check)
         → Data layer
```

## Scalability

- Workers scale to millions of requests automatically (Cloudflare edge)
- D1 supports read replicas per region
- R2 serves media globally via CDN
- Durable Objects handle stateful operations (cart, live inventory)
- Queues decouple heavy async workloads
