'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const REGIONS = [
  { value: 'north', label: 'Miền Bắc' },
  { value: 'central', label: 'Miền Trung' },
  { value: 'south', label: 'Miền Nam' },
  { value: 'highland', label: 'Tây Nguyên' },
];

const PRICE_RANGES = [
  { label: 'Tất cả', min: '', max: '' },
  { label: 'Dưới 100k', min: '', max: '100000' },
  { label: '100k–300k', min: '100000', max: '300000' },
  { label: '300k–500k', min: '300000', max: '500000' },
  { label: 'Trên 500k', min: '500000', max: '' },
];

const RATINGS = [
  { value: '', label: 'Tất cả' },
  { value: '4', label: '4★ trở lên' },
  { value: '4.5', label: '4.5★ trở lên' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const updatePriceRange = useCallback((min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('min_price', min); else params.delete('min_price');
    if (max) params.set('max_price', max); else params.delete('max_price');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const currentRegion = searchParams.get('region') ?? '';
  const currentMin = searchParams.get('min_price') ?? '';
  const currentMax = searchParams.get('max_price') ?? '';
  const currentRating = searchParams.get('min_rating') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';

  const activePriceRange = PRICE_RANGES.find(r => r.min === currentMin && r.max === currentMax) ?? PRICE_RANGES[0];

  const hasFilters = currentRegion || currentMin || currentMax || currentRating;

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-earth-900">Bộ Lọc</h2>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname + (searchParams.get('q') ? `?q=${searchParams.get('q')}` : ''))}
            className="text-xs text-brand-600 hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sắp Xếp">
        <select
          value={currentSort}
          onChange={e => update('sort', e.target.value)}
          className="w-full text-sm border border-earth-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterSection>

      {/* Region */}
      <FilterSection title="Vùng Miền">
        <div className="space-y-1.5">
          <button
            onClick={() => update('region', '')}
            className={`w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${!currentRegion ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-earth-600 hover:text-brand-600'}`}
          >
            Tất cả
          </button>
          {REGIONS.map(r => (
            <button
              key={r.value}
              onClick={() => update('region', r.value === currentRegion ? '' : r.value)}
              className={`w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${currentRegion === r.value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-earth-600 hover:text-brand-600'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Khoảng Giá">
        <div className="space-y-1.5">
          {PRICE_RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => updatePriceRange(r.min, r.max)}
              className={`w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${activePriceRange.label === r.label ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-earth-600 hover:text-brand-600'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Min rating */}
      <FilterSection title="Đánh Giá">
        <div className="space-y-1.5">
          {RATINGS.map(r => (
            <button
              key={r.label}
              onClick={() => update('min_rating', r.value)}
              className={`w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${currentRating === r.value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-earth-600 hover:text-brand-600'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-earth-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}
