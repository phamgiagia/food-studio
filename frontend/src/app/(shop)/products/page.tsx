import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { serverProductApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Tất Cả Sản Phẩm' };

const sortOptions = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Phổ biến nhất', value: 'popular' },
  { label: 'Giá thấp → cao', value: 'price_asc' },
  { label: 'Giá cao → thấp', value: 'price_desc' },
  { label: 'Đánh giá cao nhất', value: 'rating' },
];

interface SearchParams {
  category?: string;
  region?: string;
  sort?: string;
  page?: string;
  q?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const result = await serverProductApi.list({
    category: params.category,
    region: params.region,
    sort: params.sort,
    q: params.q,
    page,
    limit: 24,
  });

  const products = result.products ?? [];
  const total = result.total ?? 0;

  return (
    <div className="container-wide py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <h2 className="font-semibold text-earth-900 mb-4">Bộ Lọc</h2>
          <div className="space-y-6">
            <FilterSection title="Danh Mục">
              {['Bánh & Kẹo', 'Mắm & Gia Vị', 'Trái Cây Sấy', 'Hải Sản Khô', 'Trà & Cà Phê'].map(cat => (
                <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}${params.sort ? `&sort=${params.sort}` : ''}`}
                  className={`flex items-center gap-2 text-sm py-0.5 transition-colors ${params.category === cat ? 'text-brand-600 font-semibold' : 'text-earth-700 hover:text-brand-500'}`}>
                  {cat}
                </Link>
              ))}
            </FilterSection>

            <FilterSection title="Vùng Miền">
              {['north', 'central', 'south', 'highland'].map((r, i) => {
                const labels = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];
                return (
                  <Link key={r} href={`/products?region=${r}${params.sort ? `&sort=${params.sort}` : ''}`}
                    className={`flex items-center gap-2 text-sm py-0.5 transition-colors ${params.region === r ? 'text-brand-600 font-semibold' : 'text-earth-700 hover:text-brand-500'}`}>
                    {labels[i]}
                  </Link>
                );
              })}
            </FilterSection>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-earth-500 text-sm">
              {params.q ? <>Kết quả cho "<span className="font-semibold text-earth-800">{params.q}</span>": </> : ''}
              <span className="font-semibold text-earth-800">{total}</span> sản phẩm
            </p>
            <form>
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.region && <input type="hidden" name="region" value={params.region} />}
              {params.q && <input type="hidden" name="q" value={params.q} />}
              <select name="sort" defaultValue={params.sort ?? 'newest'}
                onChange={(e) => { (e.currentTarget.closest('form') as HTMLFormElement)?.requestSubmit(); }}
                className="text-sm border border-earth-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-earth-400">
              <p className="text-lg mb-2">Không tìm thấy sản phẩm</p>
              <Link href="/products" className="text-brand-500 text-sm hover:underline">Xem tất cả sản phẩm</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={{
                  id: p.id, name: p.name, slug: p.slug,
                  basePrice: p.base_price, comparePrice: p.compare_price,
                  province: p.province, rating: p.rating_avg, reviewCount: p.review_count,
                  images: (p.images ?? []).map(img => ({ ...img, isPrimary: img.is_primary, id: img.url, sortOrder: 0 })),
                  variants: (p.variants ?? []).map(v => ({ ...v, active: true })),
                  seller: p.seller ? { storeName: p.seller.store_name, slug: p.seller.slug } : undefined,
                }} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 24 && (
            <div className="flex justify-center gap-2 mt-10">
              {page > 1 && (
                <Link href={`/products?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                  className="px-4 py-2 rounded-lg border border-earth-200 text-sm hover:bg-earth-50">← Trước</Link>
              )}
              <span className="px-4 py-2 text-sm text-earth-500">Trang {page}</span>
              {page * 24 < total && (
                <Link href={`/products?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                  className="px-4 py-2 rounded-lg border border-earth-200 text-sm hover:bg-earth-50">Sau →</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-earth-700 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
