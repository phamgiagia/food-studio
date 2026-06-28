import type { Metadata } from 'next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/product/ProductCard';

export const metadata: Metadata = { title: 'Tìm Kiếm' };

interface SearchParams { q?: string; region?: string; category?: string }

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = params.q ?? '';

  // In production: const results = await productApi.list({ q: query, ...params });

  const hasQuery = query.length > 0;

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

      {!hasQuery ? (
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
            Kết quả cho: <span className="font-semibold text-earth-900">"{query}"</span>
          </p>
          {/* Placeholder results */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="product-card animate-pulse">
                <div className="aspect-square bg-earth-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-earth-200 rounded w-1/2" />
                  <div className="h-4 bg-earth-200 rounded" />
                  <div className="h-5 bg-earth-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
