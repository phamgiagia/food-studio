import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StarIcon } from '@heroicons/react/20/solid';
import { MapPinIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/product/AddToCartButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  // In production: fetch from API
  // const product = await productApi.getBySlug(slug);
  // if (!product) notFound();

  return (
    <div className="container-wide py-8">
      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-earth-100">
            <div className="w-full h-full bg-earth-200 flex items-center justify-center">
              <span className="text-earth-400">Product image</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <button key={i} className="aspect-square rounded-xl overflow-hidden bg-earth-100 hover:ring-2 hover:ring-brand-400 transition-all">
                <div className="w-full h-full bg-earth-200" />
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <div className="text-sm text-brand-600 font-medium mb-2">Thừa Thiên Huế · Miền Trung</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-3">
            Mắm Tôm Huế Truyền Thống
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400' : 'text-earth-200'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-earth-700">4.8</span>
            <span className="text-sm text-earth-400">(128 đánh giá)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-earth-900">{formatPrice(85000)}</span>
            <span className="text-lg text-earth-400 line-through">{formatPrice(110000)}</span>
            <span className="bg-brand-100 text-brand-700 text-sm font-semibold px-2.5 py-1 rounded-lg">-23%</span>
          </div>

          {/* Variants */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-earth-700 mb-2 block">Khối lượng</label>
            <div className="flex gap-2">
              {['200g', '500g', '1kg'].map(v => (
                <button key={v} className="px-4 py-2 rounded-xl border-2 border-earth-200 hover:border-brand-400 text-sm font-medium transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>

          <AddToCartButton />

          {/* Trust signals */}
          <div className="mt-6 space-y-3 border-t border-earth-100 pt-6">
            {[
              { icon: MapPinIcon, text: 'Xuất xứ: Làng nghề Huế truyền thống' },
              { icon: ClockIcon, text: 'Hạn sử dụng: 12 tháng từ ngày sản xuất' },
              { icon: ShieldCheckIcon, text: 'Đã kiểm định chất lượng ATVSTP' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-earth-600">
                <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Seller card */}
          <div className="mt-6 p-4 rounded-2xl border border-earth-100 bg-earth-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-earth-200" />
              <div>
                <div className="font-semibold text-earth-800">Mắm Huế Bà Lan</div>
                <div className="text-sm text-earth-500">Thừa Thiên Huế · Người bán uy tín ✓</div>
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-earth-900 mb-3">Câu Chuyện Sản Phẩm</h2>
            <p className="text-earth-600 leading-relaxed text-sm">
              Công thức mắm tôm này đã được gia đình bà Lan truyền qua nhiều thế hệ, sử dụng nguyên liệu tươi từ đầm phá Tam Giang - Cầu Hai, được chế biến theo phương pháp lên men tự nhiên truyền thống Huế...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
