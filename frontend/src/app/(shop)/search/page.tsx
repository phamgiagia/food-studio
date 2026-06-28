import type { Metadata } from 'next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/product/ProductCard';
import { serverProductApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Tìm Kiếm' };

interface SearchParams { q?: string; region?: string; category?: string }

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  const result = query
    ? await serverProductApi.list({ q: query, region: params.region, category: params.category, limit: 20 })
    : null;

  const products = result?.products ?? [];
  const total = result?.total ?? 0;

  return (
    <div className="container-wide py-10">
      {/* Search box */}
      <div className="max-w-2xl mx-auto mb-10">
        <form>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
            <input
              name="q"
              defaultValue={query}
              type="search"
              placeholder="Tìm đặc sản, vùng miền, nhà bán hàng..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-earth-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              autoFocus
            />
          </div>
        </form>
      </div>

      {!query ? (
        <div>
          <h2 className="font-semibold text-earth-700 mb-4 text-center">Tìm Kiếm Phổ Biến</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Mắm tôm Huế', 'Cà phê Đắk Lắk', 'Bánh tráng Tây Ninh', 'Nước mắm Phú Quốc', 'Chả bò Đà Nẵng', 'Mật ong rừng', 'Trà shan tuyết', 'Bánh phu thê'].map(term => (
              <a key={term} href={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 rounded-full bg-earth-100 text-earth-700 text-sm hover:bg-brand-50 hover:text-brand-600 transition-colors">
                {term}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-earth-500 mb-6">
            <span className="font-semibold text-earth-900">{total}</span> kết quả cho{' '}
            "<span className="font-semibold text-earth-900">{query}</span>"
          </p>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-earth-400 text-lg mb-2">Không tìm thấy sản phẩm nào</p>
              <p className="text-earth-400 text-sm">Thử tìm với từ khóa khác hoặc xem <a href="/products" className="text-brand-500 hover:underline">tất cả sản phẩm</a></p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
        </div>
      )}
    </div>
  );
}
