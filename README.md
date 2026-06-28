# Food Studio — Đặc Sản Vùng Miền Marketplace

Production-grade regional specialty food marketplace inspired by Goldbelly.com, built for Vietnam. Connects artisan food producers across all 63 provinces with customers nationwide.

## Architecture

Monorepo with pnpm workspaces + Turborepo:

| Package | Stack | Port |
|---------|-------|------|
| `frontend` | Next.js 15 · React 19 · TanStack Query · Zustand | 3000 |
| `admin` | Next.js 15 · Recharts · TanStack Table | 3001 |
| `backend` | Cloudflare Workers · Hono.js · D1 · KV · R2 | 8787 |
| `mobile` | Expo SDK 52 · Expo Router v4 · NativeWind | — |
| `packages/types` | Shared TypeScript entity types | — |
| `packages/utils` | formatPrice · PROVINCES · REGION_MAP · slugify | — |

## Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+, Wrangler CLI

git clone https://github.com/your-org/food-studio
cd food-studio
pnpm install
cp .env.example .env.local   # fill in required secrets

# Run everything in parallel
pnpm dev

# Individual packages
pnpm --filter frontend dev   # http://localhost:3000
pnpm --filter admin dev      # http://localhost:3001
pnpm --filter backend dev    # http://localhost:8787
pnpm --filter mobile start   # Expo dev client
```

## Backend — Cloudflare Workers

```bash
cd backend

# Create D1 database
wrangler d1 create food-studio-db
wrangler d1 execute food-studio-db --file=src/db/migrations/0001_initial_schema.sql

# Create KV namespaces
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CACHE
wrangler kv:namespace create FEATURE_FLAGS

# Create R2 bucket
wrangler r2 bucket create food-studio-media

# Deploy
wrangler deploy
```

## Environment Variables

Copy `.env.example` and fill in all secrets. Key variables:

```
NEXT_PUBLIC_API_URL=https://api.foodstudio.vn
JWT_SECRET=<32-byte random hex>
VNPAY_TMN_CODE=<VNPay terminal code>
VNPAY_SECRET_KEY=<VNPay hash secret>
MOMO_PARTNER_CODE=<MoMo partner code>
GHN_TOKEN=<GHN shipping token>
SENDGRID_API_KEY=<SendGrid API key>
```

## Database

Cloudflare D1 (SQLite-compatible). Schema at `backend/src/db/migrations/0001_initial_schema.sql`.

Key entities: `users` → `orders` → `order_items` → `products` (sold by `seller_profiles`).

See [docs/database.md](docs/database.md) for full ERD.

## Authentication

Custom PBKDF2 password hashing + HMAC-SHA256 JWT — implemented with the Web Crypto API (no Node.js `crypto`) for Cloudflare Workers compatibility. Tokens expire in 7 days.

## Payments

| Provider | Use case |
|----------|----------|
| VNPay | Primary — cards, ATM, QR |
| MoMo | Mobile wallet |
| ZaloPay | Mobile wallet |
| COD | Cash on delivery |

## Shipping

GHN (Giao Hàng Nhanh) primary, GHTK fallback. Real-time fee calculation at checkout.

## CI/CD

GitHub Actions → Vercel (frontend + admin) + Cloudflare Workers (backend).

See [docs/deployment.md](docs/deployment.md) for full pipeline details.

## Documentation

| Doc | Content |
|-----|---------|
| [docs/architecture.md](docs/architecture.md) | System diagram, domain boundaries, event bus |
| [docs/database.md](docs/database.md) | ERD, full SQL schema |
| [docs/api.md](docs/api.md) | All API endpoints + event contracts |
| [docs/frontend.md](docs/frontend.md) | Component structure, rendering strategy |
| [docs/backend.md](docs/backend.md) | Request lifecycle, security, queue design |
| [docs/mobile.md](docs/mobile.md) | Push notifications, EAS build, offline |
| [docs/deployment.md](docs/deployment.md) | Environments, secrets, rollback |
| [docs/cost.md](docs/cost.md) | Cost estimates at 100K / 1M MAU |
| [docs/roadmap.md](docs/roadmap.md) | 26-week phased roadmap |
| [docs/mvp-scale.md](docs/mvp-scale.md) | MVP scope + scale checklists |

## License

Proprietary — all rights reserved.
