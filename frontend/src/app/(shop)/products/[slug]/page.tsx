import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StarIcon, MapPinIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/20/solid';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { ReviewList } from '@/components/reviews/ReviewList';
import { serverProductApi } from '@/lib/server-api';
import Image from 'next/image';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverProductApi.getBySlug(slug);
  if (!product) return { title: 'Sản phẩm không tồn tại' };
  return {
    title: `${product.name} - Food Studio`,
    description: `Mua ${product.name} chính hãng từ ${product.province}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const p = await serverProductApi.getBySlug(slug);
  if (!p) notFound();

  const primaryImage = p.images?.find(img => img.is_primary) ?? p.images?.[0];
  const rating = p.rating_avg ?? 0;
  const reviewCount = p.review_count ?? 0;
  const discount = p.compare_price && p.compare_price > p.base_price
    ? Math.round((1 - p.base_price / p.compare_price) * 100)
    : null;

  const cartProduct = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.base_price,
    images: (p.images ?? []).map(img => ({
      id: img.url,
      url: img.url,
      alt: img.alt,
      isPrimary: img.is_primary,
      sortOrder: 0,
    })),
  };

  return (
    <div className="container-wide py-8">
      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-earth-100">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt ?? p.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-earth-200 flex items-center justify-center">
                <span className="text-earth-400 text-sm">Chưa có ảnh</span>
              </div>
            )}
          </div>
          {p.images && p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {p.images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-earth-100">
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${p.name} ${i + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div className="text-sm text-brand-600 font-medium mb-2">
            {p.province}
            {p.seller && ` · ${p.seller.store_name}`}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-3">
            {p.name}
          </h1>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarSolid key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-earth-200'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-earth-700">{rating.toFixed(1)}</span>
              <span className="text-sm text-earth-400">({reviewCount} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-earth-900">{formatPrice(p.base_price)}</span>
            {p.compare_price && p.compare_price > p.base_price && (
              <>
                <span className="text-lg text-earth-400 line-through">{formatPrice(p.compare_price)}</span>
                {discount && (
                  <span className="bg-brand-100 text-brand-700 text-sm font-semibold px-2.5 py-1 rounded-lg">
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Variants */}
          {p.variants && p.variants.length > 0 && (
            <div className="mb-6">
              <label className="text-sm font-semibold text-earth-700 mb-2 block">Phân loại</label>
              <div className="flex flex-wrap gap-2">
                {p.variants.map(v => (
                  <button key={v.id} className="px-4 py-2 rounded-xl border-2 border-earth-200 hover:border-brand-400 text-sm font-medium transition-colors">
                    {v.name}
                    {v.price !== p.base_price && (
                      <span className="ml-1 text-earth-500">· {formatPrice(v.price)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AddToCartButton product={cartProduct} />

          {/* Trust signals */}
          <div className="mt-6 space-y-3 border-t border-earth-100 pt-6">
            {[
              { icon: MapPinIcon, text: `Xuất xứ: ${p.province}` },
              { icon: ClockIcon,  text: 'Hạn sử dụng ghi trên bao bì' },
              { icon: ShieldCheckIcon, text: 'Đã kiểm định chất lượng ATVSTP' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-earth-600">
                <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Seller card */}
          {p.seller && (
            <div className="mt-6 p-4 rounded-2xl border border-earth-100 bg-earth-50">
              <div className="flex items-center gap-3">
                {p.seller.logo_url ? (
                  <Image src={p.seller.logo_url} alt={p.seller.store_name} width={48} height={48} className="rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
                    {p.seller.store_name[0]}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-earth-800">{p.seller.store_name}</div>
                  <div className="text-sm text-earth-500">{p.seller.province} · Người bán uy tín ✓</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <ReviewList productId={p.id} rating={rating} reviewCount={reviewCount} />
      </div>
    </div>
  );
}
