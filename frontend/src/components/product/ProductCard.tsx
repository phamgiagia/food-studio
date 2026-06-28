import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@food-studio/types';

type CardProduct = Pick<Product, 'id' | 'name' | 'slug' | 'basePrice' | 'province' | 'rating' | 'reviewCount' | 'images' | 'variants'> & {
  comparePrice?: number;
  seller?: { storeName: string; slug: string };
};

export function ProductCard({ product }: { product: CardProduct }) {
  const primaryImage = product.images.find(i => i.isPrimary) ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : null;

  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">
      <div className="relative aspect-square overflow-hidden bg-earth-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-earth-200 flex items-center justify-center">
            <span className="text-earth-400 text-sm">No image</span>
          </div>
        )}
        {discount && (
          <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        {product.seller && (
          <div className="text-earth-400 text-xs mb-1 truncate">{product.seller.storeName}</div>
        )}
        <h3 className="font-semibold text-earth-800 mb-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        <div className="text-earth-400 text-xs mb-2">{product.province}</div>

        <div className="flex items-center gap-1 mb-2">
          <StarIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-earth-600 font-medium">{product.rating?.toFixed(1) ?? '—'}</span>
          <span className="text-xs text-earth-400">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-earth-900">{formatPrice(product.basePrice)}</span>
          {product.comparePrice && (
            <span className="text-earth-400 text-sm line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
