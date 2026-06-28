import type { Metadata } from 'next';
import { ProductCard } from '@/components/product/ProductCard';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="container-wide py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-earth-900 mb-2">{title}</h1>
        <p className="text-earth-500">Bộ sưu tập được chọn lọc</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => (
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
  );
}
