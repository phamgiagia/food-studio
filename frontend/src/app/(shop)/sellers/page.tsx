import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPinIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = { title: 'Nhà Bán Hàng' };

const mockSellers = [
  { id: 's1', storeName: 'Mắm Huế Bà Lan', slug: 'mam-hue-ba-lan', province: 'Thừa Thiên Huế', description: 'Hơn 30 năm giữ gìn hương vị mắm tôm Huế cổ truyền của gia đình', rating: 4.9, reviewCount: 328, verified: true },
  { id: 's2', storeName: 'Cà Phê Buôn Ma Thuột', slug: 'ca-phe-buon-ma-thuot', province: 'Đắk Lắk', description: 'Arabica trồng theo phương pháp canh tác tự nhiên từ vùng đất đỏ bazan', rating: 4.8, reviewCount: 512, verified: true },
  { id: 's3', storeName: 'Bánh Truyền Thống Nam Bộ', slug: 'banh-truyen-thong-nam-bo', province: 'Tiền Giang', description: 'Bánh dân gian miền Tây làm thủ công theo công thức truyền thống', rating: 4.7, reviewCount: 186, verified: false },
  { id: 's4', storeName: 'Nước Mắm Phú Quốc Sạch', slug: 'nuoc-mam-phu-quoc-sach', province: 'Kiên Giang', description: 'Nước mắm cá cơm tươi ủ theo phương pháp truyền thống đảo Phú Quốc', rating: 4.9, reviewCount: 741, verified: true },
  { id: 's5', storeName: 'Chả Bò Đà Nẵng', slug: 'cha-bo-da-nang', province: 'Đà Nẵng', description: 'Chả bò chính gốc Đà Nẵng, không phẩm màu, không chất bảo quản', rating: 4.6, reviewCount: 203, verified: false },
  { id: 's6', storeName: 'Trà Shan Tuyết Hà Giang', slug: 'tra-shan-tuyet-ha-giang', province: 'Hà Giang', description: 'Trà shan tuyết cổ thụ từ vùng núi cao Hà Giang, thu hái thủ công', rating: 4.8, reviewCount: 154, verified: true },
];

const regions = [
  { label: 'Tất cả', value: '' },
  { label: 'Miền Bắc', value: 'north' },
  { label: 'Miền Trung', value: 'central' },
  { label: 'Miền Nam', value: 'south' },
  { label: 'Tây Nguyên', value: 'highland' },
];

export default async function SellersPage() {
  return (
    <div className="container-wide py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">Nhà Bán Hàng</h1>
        <p className="text-earth-500">Gặp gỡ những người tạo nên hương vị quê hương</p>
      </div>

      {/* Region filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {regions.map(r => (
          <Link
            key={r.value}
            href={r.value ? `/sellers?region=${r.value}` : '/sellers'}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-earth-200 hover:border-brand-400 hover:text-brand-600 transition-colors"
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Apply CTA */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white">
          <h3 className="font-bold text-lg mb-1">Bạn có sản phẩm muốn bán?</h3>
          <p className="text-brand-100 text-sm">Đăng ký bán hàng ngay hôm nay — miễn phí, dễ dàng</p>
        </div>
        <Link href="/sellers/apply" className="shrink-0 bg-white text-brand-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
          Đăng Ký Bán Hàng
        </Link>
      </div>

      {/* Seller grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockSellers.map(seller => (
          <Link key={seller.id} href={`/sellers/${seller.slug}`} className="group bg-white rounded-2xl border border-earth-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-28 bg-gradient-to-br from-brand-50 to-earth-100 relative">
              {seller.verified && (
                <span className="absolute top-3 right-3 bg-white text-brand-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  ✓ Uy tín
                </span>
              )}
            </div>
            <div className="px-5 pb-5 -mt-8">
              <div className="w-16 h-16 rounded-2xl bg-earth-100 border-4 border-white flex items-center justify-center text-2xl font-bold text-brand-500 mb-3">
                {seller.storeName[0]}
              </div>
              <h3 className="font-bold text-earth-900 group-hover:text-brand-600 transition-colors mb-1">
                {seller.storeName}
              </h3>
              <div className="flex items-center gap-1 text-earth-400 text-xs mb-2">
                <MapPinIcon className="w-3.5 h-3.5" />
                {seller.province}
              </div>
              <div className="flex items-center gap-1 mb-3">
                <span className="text-amber-400 text-sm">★</span>
                <span className="font-semibold text-sm text-earth-700">{seller.rating}</span>
                <span className="text-earth-400 text-xs">({seller.reviewCount})</span>
              </div>
              <p className="text-earth-500 text-xs line-clamp-2">{seller.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
