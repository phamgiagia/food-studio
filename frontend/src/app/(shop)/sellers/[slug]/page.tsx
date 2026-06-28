import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPinIcon, ShieldCheckIcon, StarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/20/solid';
import { ProductCard } from '@/components/product/ProductCard';
import { serverSellerApi, serverProductApi, type ApiSeller } from '@/lib/server-api';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seller = await serverSellerApi.getBySlug(slug);
  if (!seller) return { title: 'Cửa hàng không tồn tại' };
  return {
    title: `${seller.store_name} - Food Studio`,
    description: seller.description ?? `Đặc sản từ ${seller.province}`,
  };
}

function parsePressMentions(raw?: string): Array<{ source: string; quote: string; url?: string }> {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default async function SellerPage({ params }: Props) {
  const { slug } = await params;

  const [seller, productsResult] = await Promise.all([
    serverSellerApi.getBySlug(slug),
    serverProductApi.list({ seller: slug, limit: 12 }),
  ]);

  if (!seller) notFound();

  const products = productsResult.products ?? [];
  const press = parsePressMentions(seller.press_mentions);
  const memberYear = seller.id?.slice(0, 4) ?? '2024';

  return (
    <div>
      {/* Banner */}
      <div className="h-56 md:h-80 bg-gradient-to-br from-earth-700 to-earth-900 relative overflow-hidden">
        {seller.banner_url && (
          <Image src={seller.banner_url} alt={seller.store_name} fill className="object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {seller.tagline && (
          <div className="absolute bottom-6 left-0 right-0 container-wide">
            <p className="text-white/90 text-lg md:text-xl italic font-light">"{seller.tagline}"</p>
          </div>
        )}
      </div>

      <div className="container-wide">
        {/* Profile header */}
        <div className="-mt-16 mb-10 flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-brand-500 shrink-0 overflow-hidden">
            {seller.logo_url
              ? <Image src={seller.logo_url} alt={seller.store_name} width={112} height={112} className="object-cover" />
              : seller.store_name[0]}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-earth-900">{seller.store_name}</h1>
              {seller.verified && (
                <span className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Người bán uy tín
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-earth-500">
              <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{seller.province}</span>
              {(seller.review_count ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <StarSolid className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-earth-700">{(seller.rating ?? 0).toFixed(1)}</span>
                  <span>({seller.review_count} đánh giá)</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4" />Thành viên từ {memberYear}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 mb-14">
          {/* Story */}
          <div className="lg:col-span-2 space-y-6">
            {seller.description && (
              <div>
                <h2 className="font-display text-xl font-bold text-earth-900 mb-3">Về Cửa Hàng</h2>
                <p className="text-earth-600 leading-relaxed text-base">{seller.description}</p>
              </div>
            )}

            {seller.story && (
              <>
                {/* Story callout */}
                <blockquote className="border-l-4 border-brand-400 pl-5 py-1">
                  <p className="text-earth-700 leading-relaxed italic text-base">
                    {seller.story.slice(0, 300)}{seller.story.length > 300 ? '...' : ''}
                  </p>
                </blockquote>
                {seller.story.length > 300 && (
                  <p className="text-earth-600 leading-relaxed">{seller.story.slice(300)}</p>
                )}
              </>
            )}

            {/* Press mentions */}
            {press.length > 0 && (
              <div>
                <h3 className="font-semibold text-earth-800 mb-3 text-sm uppercase tracking-wide">Được báo chí nhắc đến</h3>
                <div className="space-y-3">
                  {press.map((p, i) => (
                    <div key={i} className="bg-earth-50 rounded-xl p-4">
                      <p className="text-earth-700 text-sm italic mb-1">"{p.quote}"</p>
                      <p className="text-brand-600 text-xs font-semibold">— {p.source}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {seller.video_url && (
              <div>
                <h3 className="font-semibold text-earth-800 mb-3">Video giới thiệu</h3>
                <div className="aspect-video rounded-2xl overflow-hidden bg-earth-100">
                  <iframe
                    src={seller.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4 h-fit">
            <div className="bg-earth-50 rounded-2xl p-5">
              <h3 className="font-semibold text-earth-800 mb-4">Thông tin cửa hàng</h3>
              <div className="space-y-3">
                {[
                  { label: 'Tỉnh thành', value: seller.province },
                  { label: 'Vùng miền', value: { north: 'Miền Bắc', central: 'Miền Trung', south: 'Miền Nam', highland: 'Tây Nguyên' }[seller.region] ?? seller.region },
                  ...(seller.review_count > 0 ? [{ label: 'Đánh giá', value: `${(seller.rating ?? 0).toFixed(1)}/5 (${seller.review_count})` }] : []),
                  { label: 'Số sản phẩm', value: String(products.length) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-earth-500">{item.label}</span>
                    <span className="font-medium text-earth-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating breakdown */}
            {(seller.review_count ?? 0) > 0 && (
              <div className="bg-white border border-earth-100 rounded-2xl p-5 text-center">
                <div className="text-5xl font-bold text-earth-900 mb-1">{(seller.rating ?? 0).toFixed(1)}</div>
                <div className="flex justify-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarSolid key={i} className={`w-4 h-4 ${i < Math.round(seller.rating ?? 0) ? 'text-amber-400' : 'text-earth-200'}`} />
                  ))}
                </div>
                <p className="text-earth-400 text-xs">{seller.review_count} đánh giá từ khách hàng</p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-earth-900">Sản Phẩm Của Cửa Hàng</h2>
            {products.length >= 12 && (
              <a href={`/products?seller=${slug}`} className="text-brand-600 text-sm hover:underline">Xem tất cả →</a>
            )}
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12 text-earth-400">Cửa hàng chưa có sản phẩm nào</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={{
                  id: p.id, name: p.name, slug: p.slug,
                  basePrice: p.base_price, comparePrice: p.compare_price,
                  province: p.province, rating: p.rating_avg, reviewCount: p.review_count,
                  images: (p.images ?? []).map(img => ({ ...img, isPrimary: img.is_primary, id: img.url, sortOrder: 0 })),
                  variants: (p.variants ?? []).map(v => ({ ...v, active: true })),
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
