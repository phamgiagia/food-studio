# Backend Architecture

## Stack

- **Runtime**: Cloudflare Workers (V8 isolates, 0ms cold start)
- **Framework**: Hono.js (ultra-lightweight, typed routing)
- **Database**: Cloudflare D1 (SQLite at edge)
- **Cache**: Cloudflare KV
- **Storage**: Cloudflare R2
- **Queues**: Cloudflare Queues
- **Stateful**: Cloudflare Durable Objects
- **Language**: TypeScript

## Folder Structure

```
backend/
├── src/
│   ├── index.ts              # Worker entry point, route mounting
│   ├── types/
│   │   └── env.ts            # Cloudflare bindings type
│   ├── middleware/
│   │   ├── auth.ts           # JWT verify, RBAC helpers
│   │   └── error.ts          # Error handler, AppError class
│   ├── routes/
│   │   ├── auth.ts           # POST /auth/*
│   │   ├── products.ts       # GET|POST|PATCH /products
│   │   ├── categories.ts     # GET /categories
│   │   ├── sellers.ts        # GET|POST /sellers
│   │   ├── orders.ts         # GET|DELETE /orders
│   │   ├── checkout.ts       # POST /checkout/*
│   │   ├── reviews.ts        # GET|POST /reviews
│   │   ├── media.ts          # POST /media/upload
│   │   └── admin.ts          # /admin/* (all roles)
│   ├── durable-objects/
│   │   ├── cart.ts           # CartDO — per-user cart
│   │   └── inventory-reservation.ts  # Atomic stock lock
│   ├── queues/
│   │   └── order-events.ts   # Queue consumer handlers
│   └── db/
│       └── migrations/
│           └── 0001_initial_schema.sql
├── wrangler.toml
└── package.json
```

## Request Lifecycle

```
Client Request
  → Cloudflare WAF (block malicious patterns)
  → Cloudflare Rate Limiter (per IP, per user)
  → Cloudflare Turnstile (bot check on sensitive endpoints)
  → Worker (Hono router)
      → CORS middleware
      → Auth middleware (JWT verify → set userId/role in context)
      → RBAC check (requireRole)
      → Route handler
          → D1 query / KV get / Queue send
      → JSON response
```

## Security Patterns

```typescript
// Always validate input with Zod
app.post('/products', zValidator('json', createProductSchema), handler);

// Never expose raw DB errors to client
app.onError(errorHandler); // returns generic 500

// RBAC at route level
app.use('/admin/*', requireRole('admin', 'super_admin'));

// Row-level security in queries (always bind userId)
db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
  .bind(id, userId);
```

## D1 Best Practices

- Use `db.batch()` for multi-statement atomic operations
- All IDs are `hex(randomblob(16))` (URL-safe UUID equivalent)
- Timestamps are Unix seconds (`unixepoch()`)
- JSON stored as `TEXT` columns suffixed `_json`
- Soft deletes only (status = 'deleted', never `DELETE`)

## Queue Design

```
ORDER_EVENTS queue
  Producer: checkout route (order.created, payment events)
  Consumer: handleOrderEvents()
    → order.created → send confirmation email
    → payment.succeeded → confirm order, notify seller
    → order.delivered → trigger review prompt

NOTIFICATION_QUEUE queue
  Producer: any service needing comms
  Consumer: notification worker
    → email: SendGrid template API
    → push: Firebase FCM
    → in-app: D1 insert

SEARCH_INDEXING queue
  Producer: product create/update
  Consumer: search indexer
    → D1 FTS update (Phase 1)
    → Vectorize upsert (Phase 4)
```

## Service Expansion

Currently the backend is a single multi-route Worker. As scale demands:

1. Split into domain Workers (auth-worker, catalog-worker, order-worker)
2. Each Worker routes to its own D1 database
3. API Gateway Worker routes by domain prefix
4. Service-to-service calls use signed service tokens (Workers Service Bindings)
