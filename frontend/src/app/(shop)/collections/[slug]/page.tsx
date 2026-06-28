import type { Metadata } from 'next';
import { ProductCard } from '@/components/product/ProductCard';
import { serverProductApi } from '@/lib/server-api';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const result = await serverProductApi.list({ category: slug, limit: 24 });
  const products = result.products ?? [];

  return (
    <div className="container-wide py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-earth-900 mb-2">{title}</h1>
        <p className="text-earth-500">{result.total ?? 0} sản phẩm trong bộ sưu tập này</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-earth-400">
          <p className="text-lg mb-2">Chưa có sản phẩm trong bộ sưu tập này</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
  );
}
