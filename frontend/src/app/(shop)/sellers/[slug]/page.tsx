import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPinIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/product/ProductCard';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function SellerPage({ params }: Props) {
  const { slug } = await params;
  // In production: const seller = await sellerApi.getBySlug(slug); if (!seller) notFound();

  const seller = {
    storeName: 'Mắm Huế Bà Lan',
    slug,
    description: 'Hơn 30 năm giữ gìn hương vị mắm tôm Huế cổ truyền của gia đình. Mỗi mẻ mắm là cả tình yêu với vùng đất cố đô.',
    story: 'Được thành lập vào năm 1993, cơ sở của chúng tôi chuyên sản xuất các loại mắm truyền thống Huế theo phương pháp ủ tự nhiên không có chất bảo quản. Nguyên liệu được chọn lọc kỹ càng từ đầm phá Tam Giang – một trong những đầm phá lớn nhất Đông Nam Á.',
    province: 'Thừa Thiên Huế',
    region: 'Miền Trung',
    rating: 4.9,
    reviewCount: 328,
    verified: true,
    productCount: 12,
    memberSince: '2023',
  };

  const mockProducts = Array.from({ length: 6 }, (_, i) => ({
    id: `p${i}`,
    name: ['Mắm Tôm Huế', 'Mắm Ruốc Huế', 'Mắm Cua Đồng', 'Mắm Cá Thu', 'Mắm Nêm', 'Ruốc Tôm'][i] ?? 'Sản phẩm',
    slug: `san-pham-${i}`,
    basePrice: [85000, 95000, 120000, 145000, 75000, 65000][i] ?? 90000,
    province: 'Thừa Thiên Huế',
    rating: 4.7 + i * 0.05,
    reviewCount: 20 + i * 15,
    images: [],
    variants: [],
  }));

  return (
    <div>
      {/* Banner */}
      <div className="h-56 md:h-72 bg-gradient-to-br from-earth-700 to-earth-900 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container-wide">
        {/* Profile header */}
        <div className="-mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-brand-500 shrink-0">
            {seller.storeName[0]}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-earth-900">{seller.storeName}</h1>
              {seller.verified && (
                <span className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Người bán uy tín
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-earth-500">
              <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{seller.province}</span>
              <span className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-amber-400" />
                {seller.rating} ({seller.reviewCount} đánh giá)
              </span>
              <span>{seller.productCount} sản phẩm</span>
              <span>Thành viên từ {seller.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Story */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-earth-900 mb-3">Về Cửa Hàng</h2>
            <p className="text-earth-600 leading-relaxed mb-4">{seller.description}</p>
            <p className="text-earth-600 leading-relaxed">{seller.story}</p>
          </div>

          {/* Stats */}
          <div className="bg-earth-50 rounded-2xl p-5 space-y-4 h-fit">
            <h3 className="font-semibold text-earth-800">Thông tin cửa hàng</h3>
            {[
              { label: 'Tỉnh thành', value: seller.province },
              { label: 'Vùng miền', value: seller.region },
              { label: 'Đánh giá', value: `${seller.rating}/5` },
              { label: 'Số đánh giá', value: seller.reviewCount.toString() },
              { label: 'Sản phẩm', value: seller.productCount.toString() },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-earth-500">{item.label}</span>
                <span className="font-medium text-earth-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-earth-900 mb-6">Sản Phẩm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {mockProducts.map(p => (
              <ProductCard key={p.id} product={p as Parameters<typeof ProductCard>[0]['product']} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
