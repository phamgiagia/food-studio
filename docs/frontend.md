# Frontend Architecture

## Stack

- **Framework**: Next.js 15 (App Router, Server Components by default)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Heroicons only
- **State**: Zustand (cart, auth) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod
- **Animation**: Motion (Framer Motion successor)
- **i18n**: next-intl (vi/en)
- **Deploy**: Vercel

## Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (shop)/           # Customer-facing routes
│   │   │   ├── layout.tsx    # Header + Footer
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product listing
│   │   │   │   └── [slug]/page.tsx   # Product detail
│   │   │   ├── sellers/
│   │   │   │   ├── page.tsx          # Seller directory
│   │   │   │   └── [slug]/page.tsx   # Seller profile
│   │   │   ├── collections/
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── account/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── orders/
│   │   │   │   ├── addresses/
│   │   │   │   └── wishlist/
│   │   │   └── orders/[id]/page.tsx  # Order confirmation
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── layout.tsx        # Root layout (fonts, providers)
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── home/             # Homepage sections
│   │   ├── layout/           # Header, Footer, Nav
│   │   ├── product/          # ProductCard, Gallery, AddToCart
│   │   ├── seller/           # SellerCard, SellerHeader
│   │   ├── checkout/         # CheckoutForm, PaymentSelector
│   │   ├── reviews/          # ReviewList, ReviewForm, StarRating
│   │   ├── search/           # SearchBar, Filters
│   │   └── ui/               # shadcn/ui primitives
│   │
│   ├── lib/
│   │   ├── api.ts            # Typed API client
│   │   └── utils.ts          # cn(), formatPrice(), etc.
│   │
│   ├── store/
│   │   ├── auth.ts           # Zustand auth store
│   │   └── cart.ts           # Zustand cart store
│   │
│   ├── hooks/
│   │   ├── useProducts.ts    # TanStack Query hooks
│   │   ├── useSellers.ts
│   │   ├── useCart.ts
│   │   └── useAuth.ts
│   │
│   └── types/
│       └── index.ts          # Re-export from @food-studio/types
```

## Data Fetching Strategy

```
Server Components (RSC)          → Initial page data (SEO, no loading state)
  app/(shop)/products/page.tsx
  app/(shop)/products/[slug]/page.tsx
  app/sellers/[slug]/page.tsx

TanStack Query (Client)          → Interactive/mutable data
  Cart, Checkout, Reviews, Auth
  Infinite scroll on listing pages
  Wishlist toggle, loyalty points

Zustand                          → Client UI state
  Cart items (persisted localStorage)
  Auth tokens (persisted localStorage)
  UI flags (modal open, etc.)
```

## Rendering Modes

| Route              | Strategy      | Reason                        |
|--------------------|---------------|-------------------------------|
| Homepage           | ISR (2 min)   | Dynamic content, SEO          |
| Product listing    | RSC + stream  | Filters = dynamic             |
| Product detail     | ISR (5 min)   | High traffic, SEO critical    |
| Seller page        | ISR (10 min)  | Moderate traffic, SEO         |
| Cart / Checkout    | Client-only   | Auth required, real-time      |
| Blog               | Static        | Rarely changes                |
| Account pages      | Client-only   | Auth required                 |

## Design System

Brand colors: `brand-500` (#f97316 — Tailwind orange-500)
Earth palette: `earth-*` (warm stone for backgrounds/text)

Typography:
- Display: Playfair Display (headings, product names)
- Body: Inter (all UI)

Component library: shadcn/ui (Radix-based, fully customized)
Motion: subtle scale/fade — never distracting

## Performance Targets

- LCP < 2.5s (product images above fold: priority={true})
- CLS < 0.1 (image dimensions always specified)
- FID < 100ms (minimal JS on server-rendered pages)
- Lighthouse score: 90+ all categories
