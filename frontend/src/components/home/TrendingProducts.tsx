import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { serverProductApi } from '@/lib/server-api';

export async function TrendingProducts() {
  const result = await serverProductApi.list({ sort: 'popular', limit: 8 });
  const products = result.products ?? [];

  // Fallback static data when API is unavailable (dev / before seed)
  const fallbackProducts = Array.from({ length: 8 }, (_, i) => ({
    id: `p${i}`, slug: `san-pham-${i}`,
    name: ['Mắm Tôm Huế', 'Bánh Phu Thê', 'Cà Phê Buôn Ma Thuột', 'Nước Mắm Phú Quốc', 'Chả Bò Đà Nẵng', 'Bánh Đậu Xanh', 'Mật Ong Rừng', 'Bánh Cuốn Hà Nội'][i] ?? `Sản phẩm ${i + 1}`,
    base_price: (i + 1) * 45000 + 30000,
    province: ['Thừa Thiên Huế', 'Bắc Ninh', 'Đắk Lắk', 'Kiên Giang', 'Đà Nẵng', 'Hải Dương', 'Gia Lai', 'Hà Nội'][i] ?? 'Việt Nam',
    rating_avg: 4.2 + (i % 4) * 0.2, review_count: 12 + i * 7,
    images: [] as [], variants: [] as [],
  }));

  const items = products.length > 0 ? products : fallbackProducts;

  return (
    <section className="section-padding bg-white">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">
              Đang Được Yêu Thích
            </h2>
            <p className="text-earth-500">Những sản phẩm được mua nhiều nhất tuần này</p>
          </div>
          <Link href="/products?sort=popular" className="text-brand-600 font-semibold hover:text-brand-700 hidden sm:block">
            Xem thêm →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(p => (
            <ProductCard key={p.id} product={{
              id: p.id, name: p.name, slug: p.slug,
              basePrice: p.base_price,
              province: p.province, rating: p.rating_avg, reviewCount: p.review_count,
              images: (p.images ?? []).map((img: { url: string; alt?: string; is_primary: boolean }) => ({
                ...img, isPrimary: img.is_primary, id: img.url, sortOrder: 0,
              })),
              variants: p.variants ?? [],
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
