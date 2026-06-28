import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Bộ Sưu Tập' };

const collections = [
  { slug: 'qua-tet-2025', name: 'Quà Tết 2025', description: 'Những đặc sản tuyệt vời để làm quà Tết', productCount: 48, emoji: '🎁' },
  { slug: 'hai-san-mien-trung', name: 'Hải Sản Miền Trung', description: 'Đặc sản biển Miền Trung tươi ngon', productCount: 32, emoji: '🦐' },
  { slug: 'tra-ca-phe-tay-nguyen', name: 'Trà & Cà Phê Tây Nguyên', description: 'Thức uống đặc trưng vùng cao nguyên', productCount: 24, emoji: '☕' },
  { slug: 'mam-dac-san-hue', name: 'Mắm & Đặc Sản Huế', description: 'Hương vị cố đô, đậm đà bản sắc', productCount: 56, emoji: '🫙' },
  { slug: 'banh-ngot-viet-nam', name: 'Bánh Ngọt Việt Nam', description: 'Các loại bánh truyền thống 3 miền', productCount: 38, emoji: '🍡' },
  { slug: 'dac-san-mua-he', name: 'Đặc Sản Mùa Hè', description: 'Giải nhiệt với trái cây và đồ uống mùa hè', productCount: 28, emoji: '🌞' },
];

export default function CollectionsPage() {
  return (
    <div className="container-wide py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">Bộ Sưu Tập</h1>
        <p className="text-earth-500">Các sản phẩm được chọn lọc theo chủ đề và mùa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map(col => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="group bg-white border border-earth-100 rounded-2xl p-6 hover:shadow-md hover:border-brand-200 transition-all"
          >
            <div className="text-4xl mb-4">{col.emoji}</div>
            <h3 className="font-bold text-earth-900 text-lg mb-1 group-hover:text-brand-600 transition-colors">
              {col.name}
            </h3>
            <p className="text-earth-500 text-sm mb-3">{col.description}</p>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              {col.productCount} sản phẩm
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
