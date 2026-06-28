import Link from 'next/link';

const collections = [
  { name: 'Quà Tết 2025', slug: 'qua-tet-2025', productCount: 48 },
  { name: 'Hải Sản Miền Trung', slug: 'hai-san-mien-trung', productCount: 32 },
  { name: 'Trà & Cà Phê Tây Nguyên', slug: 'tra-ca-phe-tay-nguyen', productCount: 24 },
  { name: 'Mắm & Đặc Sản Huế', slug: 'mam-dac-san-hue', productCount: 56 },
];

export function FeaturedCollections() {
  return (
    <section className="section-padding bg-white">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">
              Bộ Sưu Tập
            </h2>
            <p className="text-earth-500">Các bộ sưu tập được chọn lọc theo mùa và chủ đề</p>
          </div>
          <Link href="/collections" className="text-brand-600 font-semibold hover:text-brand-700 hidden sm:block">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-earth-100 p-6 hover:bg-brand-50 transition-colors"
            >
              <div className="w-12 h-12 bg-brand-100 rounded-xl mb-4 group-hover:bg-brand-200 transition-colors" />
              <h3 className="font-semibold text-earth-800 mb-1">{col.name}</h3>
              <p className="text-earth-400 text-sm">{col.productCount} sản phẩm</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
