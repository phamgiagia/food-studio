// Server-side fetch helper for Server Components (no token needed for public endpoints)
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787/v1');

async function serverFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = params
    ? `${BASE}${path}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      )}`
    : `${BASE}${path}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const json = await res.json() as { ok: boolean; data: T };
  return json.data;
}

// Snake_case → camelCase mapping for DB-returned product rows
export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_price?: number;
  province: string;
  rating_avg?: number;
  review_count: number;
  images: { url: string; alt?: string; is_primary: boolean }[];
  variants: { id: string; name: string; price: number; stock: number }[];
  seller?: { store_name: string; slug: string; logo_url?: string; province: string };
};

export type ApiPaginated<T> = {
  products?: T[];
  categories?: T[];
  sellers?: T[];
  total: number;
  page: number;
  limit: number;
};

export const serverProductApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    serverFetch<ApiPaginated<ApiProduct>>('/products', params).catch(() => ({ products: [], total: 0, page: 1, limit: 24 } as ApiPaginated<ApiProduct>)),
  getBySlug: (slug: string) =>
    serverFetch<ApiProduct>(`/products/slug/${slug}`).catch(() => null),
};

export const serverCategoryApi = {
  list: () =>
    serverFetch<{ categories: { id: string; name: string; slug: string; imageUrl?: string }[] }>('/categories')
      .catch(() => ({ categories: [] })),
};

export type ApiSeller = {
  id: string;
  store_name: string;
  slug: string;
  description?: string;
  story?: string;
  tagline?: string;
  logo_url?: string;
  banner_url?: string;
  province: string;
  region: string;
  rating?: number;
  review_count: number;
  verified: boolean;
  owner_name?: string;
  press_mentions?: string; // JSON string: [{source, quote, url}]
  video_url?: string;
};

export const serverSellerApi = {
  getBySlug: (slug: string) =>
    serverFetch<ApiSeller>(`/sellers/slug/${slug}`).catch(() => null),
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    serverFetch<ApiPaginated<ApiSeller>>('/sellers', params).catch(() => ({ sellers: [], total: 0, page: 1, limit: 20 } as ApiPaginated<ApiSeller>)),
};
