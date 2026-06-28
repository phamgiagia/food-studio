# Build an Enterprise-Grade Regional Specialty Marketplace (Goldbelly-inspired)

You are a Principal Full-Stack Architect and Senior Product Designer specializing in Next.js, TypeScript, Cloudflare Serverless Architecture, scalable marketplaces, and premium commerce UX.

Design and scaffold a production-grade platform inspired by Goldbelly.com, focused on selling regional specialty products (đặc sản vùng miền).

The platform should feel premium, trusted, emotional, modern, and commerce-first.

Reference inspiration:

* Goldbelly → discovery + storytelling + curated commerce
* Airbnb → marketplace UX and trust patterns
* Apple → visual hierarchy and premium feel
* Muji → clean product presentation
* Shopify Plus → commerce operations

## High-Level Goals

Build a marketplace where:

* Customers discover and buy authentic regional specialties.
* Local sellers can onboard and manage products.
* Admin and staff manage the entire ecosystem.
* Mobile users receive a native-first experience.
* Architecture supports millions of users and global scaling.

---

# Technical Stack

## Frontend (Customer Website)

Separate project.

Folder:

```txt
/frontend
```

Requirements:

* Next.js (latest App Router)
* TypeScript
* Server Components by default
* Tailwind CSS
* Heroicons only
* shadcn/ui
* TanStack Query
* Zustand
* React Hook Form + Zod
* Motion animation
* next-intl
* SEO optimized
* PWA ready

Deploy:

```txt
Vercel
```

Responsibilities:

* Homepage
* Discovery
* Product browsing
* Seller pages
* Checkout
* Account
* Loyalty
* Order tracking
* Search
* Reviews
* Blog
* Landing pages

---

## Admin Portal

Separate project.

Folder:

```txt
/admin
```

Requirements:

* Next.js
* TypeScript
* Internal dashboard optimized
* RBAC
* Analytics
* Multi-tenant support
* Advanced tables
* Bulk actions

Deploy:

```txt
Vercel
```

Modules:

* Dashboard
* Product moderation
* Seller management
* Order operations
* Promotions
* Customer support
* CMS
* Inventory
* Shipping
* Refunds
* Settlement
* Finance
* Fraud monitoring
* Audit logs
* Feature flags
* System monitoring

Roles:

* Super Admin
* Admin
* Staff
* Operations
* Finance
* Support

---

## Backend

Separate project.

Folder:

```txt
/backend
```

Cloudflare-first architecture.

Use:

```txt
Cloudflare Workers
Cloudflare D1
Cloudflare R2
Cloudflare KV
Cloudflare Queues
Cloudflare Durable Objects
Cloudflare Workflows
Cloudflare Images
Cloudflare Cache
Cloudflare Rate Limiting
Cloudflare Turnstile
Cloudflare Analytics
Cloudflare AI (optional)
```

Requirements:

* Domain-driven architecture
* Event-driven architecture
* Edge-first APIs
* REST + internal event bus
* OpenAPI
* Background jobs
* Webhook system

Services:

```txt
auth-service
catalog-service
seller-service
order-service
payment-service
shipping-service
inventory-service
promotion-service
review-service
search-service
notification-service
cms-service
analytics-service
fraud-service
media-service
recommendation-service
```

Infrastructure:

* CI/CD
* IaC
* Feature flags
* Observability
* Logging
* Monitoring
* Error tracking
* Backup strategy

---

## Mobile App

Separate project.

Folder:

```txt
/mobile
```

Requirements:

* Expo (latest)
* Expo Router
* TypeScript
* NativeWind
* React Query
* Zustand
* Offline support
* Push notifications

Deploy:

```txt
iOS
Android
```

Features:

* Discovery
* Purchase
* Seller profile
* Tracking
* Saved items
* Loyalty
* Notifications
* Live support

---

# Product Requirements

## Marketplace Features

### Customer

* Browse regional specialties
* Dynamic categories
* Product collections
* Smart recommendations
* Seasonal campaigns
* Personalized homepage
* Gift orders
* Scheduled delivery
* Multi-address checkout
* Order tracking
* Wishlist
* Reviews
* Rewards

### Seller

* Seller onboarding
* Product upload
* Store management
* Order processing
* Performance dashboard
* Payout management

### Commerce

* Multi-vendor cart
* Split payments
* Promotion engine
* Coupons
* Referral
* Affiliate
* Subscription boxes

---

# UX/UI Requirements

Create an original premium design.

Design principles:

* Apple-grade polish
* Airbnb-level friendliness
* Goldbelly storytelling
* Fast perceived performance

Requirements:

* Responsive
* Elegant motion
* Accessible
* Conversion optimized
* Mobile-first

Use:

* Heroicons
* Large photography
* Editorial layouts
* Card system
* Soft shadows
* Premium typography

Avoid:

* Generic admin templates
* Bootstrap style
* Overuse of gradients

---

# Data Architecture

Generate:

* ERD
* Domain boundaries
* Folder structures
* API contracts
* D1 schema
* Event contracts
* Queue design
* Caching layers

---

# Security

Enterprise requirements:

* Zero Trust
* RBAC
* MFA
* Signed uploads
* CSP
* Rate limiting
* WAF
* Audit logs
* Secrets management
* GDPR readiness

---

# Deliverables

Generate:

1. Full monorepo structure
2. System architecture diagrams
3. Frontend architecture
4. Backend architecture
5. Database schema
6. API specification
7. Mobile architecture
8. Deployment plan
9. Cost estimation
10. Development roadmap
11. MVP → Scale plan
12. docs folder with all documentation
13. implementation TODO list

Output progressively and create documents inside `/docs`.
