import type { Metadata } from 'next';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@food-studio/types';

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
  // In production: fetch from API
  // const { data, meta } = await productApi.list({ ...params, limit: 24 });

  return (
    <div className="container-wide py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <h2 className="font-semibold text-earth-900 mb-4">Bộ Lọc</h2>

          <div className="space-y-6">
            <FilterSection title="Danh Mục">
              {['Bánh & Kẹo', 'Mắm & Gia Vị', 'Trái Cây Sấy', 'Hải Sản Khô', 'Trà & Cà Phê'].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-earth-300 text-brand-500" />
                  <span className="text-sm text-earth-700">{cat}</span>
                </label>
              ))}
            </FilterSection>

            <FilterSection title="Vùng Miền">
              {['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'].map(region => (
                <label key={region} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-earth-300 text-brand-500" />
                  <span className="text-sm text-earth-700">{region}</span>
                </label>
              ))}
            </FilterSection>

            <FilterSection title="Giá">
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Từ" className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg" />
                <span className="text-earth-400">–</span>
                <input type="number" placeholder="Đến" className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg" />
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-earth-500 text-sm">Đang hiển thị 24 sản phẩm</p>
            <select className="text-sm border border-earth-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Placeholder cards */}
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="product-card animate-pulse">
                <div className="aspect-square bg-earth-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-earth-200 rounded w-1/2" />
                  <div className="h-4 bg-earth-200 rounded" />
                  <div className="h-4 bg-earth-200 rounded w-3/4" />
                  <div className="h-5 bg-earth-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
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
