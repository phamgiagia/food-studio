# Cost Estimation

## Cloudflare (Backend + Infrastructure)

| Service              | Free Tier               | ~100K MAU Est.     | ~1M MAU Est.       |
|----------------------|-------------------------|--------------------|--------------------|
| Workers              | 100K req/day            | $5–$10/mo          | $50–$100/mo        |
| D1 Database          | 5M rows read/day        | $0–$5/mo           | $20–$50/mo         |
| R2 Storage           | 10GB free               | $5–$15/mo (50GB)   | $30–$80/mo (300GB) |
| KV                   | 100K reads/day          | $0–$5/mo           | $10–$30/mo         |
| Queues               | 1M messages/mo          | $0–$3/mo           | $5–$20/mo          |
| Durable Objects      | 1M req/mo               | $0–$5/mo           | $10–$30/mo         |
| Images               | 5K images free          | $10–$20/mo         | $50–$100/mo        |
| Workers AI           | 10K neurons/day         | $0–$10/mo          | $20–$50/mo         |
| **Subtotal CF**      |                         | **~$25–$73/mo**    | **~$195–$460/mo**  |

## Vercel (Frontend + Admin)

| Plan         | Price       | Suitability               |
|--------------|-------------|---------------------------|
| Hobby        | Free        | Dev only                  |
| Pro          | $20/mo      | MVP / early stage         |
| Enterprise   | Custom      | Scale (>100K MAU)         |

Estimated: $20–$40/mo for frontend + admin (Pro plan, 2 projects).

## Third-Party Services

| Service              | Est. Cost                           |
|----------------------|-------------------------------------|
| VNPay                | 0.55% per transaction               |
| MoMo                 | 0.5% per transaction                |
| ZaloPay              | 0.5% per transaction                |
| GHN (shipping)       | Pay per shipment (seller cost)      |
| GHTK (shipping)      | Pay per shipment (seller cost)      |
| SendGrid (email)     | Free (100/day) → $20/mo (50K/mo)    |
| Firebase (push notif)| Free (FCM)                          |
| Sentry (error track) | Free → $26/mo                       |
| Datadog / Axiom      | $0–$50/mo (observability)           |

## Infrastructure Summary

| Stage     | MAU     | Monthly Cost (est.)  |
|-----------|---------|----------------------|
| MVP       | 0–1K    | ~$20–$40/mo          |
| Early     | 1K–10K  | ~$50–$100/mo         |
| Growth    | 10K–100K| ~$150–$300/mo        |
| Scale     | 100K+   | ~$500–$1,500/mo      |

**Note**: Cloudflare's edge architecture is extremely cost-efficient at scale. A comparable AWS/GCP architecture at 1M MAU would cost 5–10x more.

## Revenue Model

Platform takes 10% commission per transaction (configurable per seller tier).

Break-even at ~$2,500 GMV/month if commission is 10% and infra costs $250/mo.

## Development Cost (if outsourcing)

| Phase        | Duration  | Team               | Est. Cost (VND)     |
|--------------|-----------|--------------------|---------------------|
| Phase 1 MVP  | 8 weeks   | 2 FE + 1 BE + 1 PM | 200–400M            |
| Phase 2      | 6 weeks   | 2 FE + 2 BE        | 200–350M            |
| Phase 3      | 6 weeks   | 1 Mobile + 1 FE    | 150–250M            |
| Phase 4      | 6 weeks   | 2 BE + 1 DevOps    | 200–300M            |
| **Total**    | **~6 mo** |                    | **750M–1.3B VND**   |
