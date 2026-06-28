import Link from 'next/link';

const regions = [
  { name: 'Miền Bắc', provinces: ['Hà Nội', 'Ninh Bình', 'Sơn La', 'Lào Cai'], image: '/images/regions/north.jpg', href: '/products?region=north' },
  { name: 'Miền Trung', provinces: ['Huế', 'Đà Nẵng', 'Hội An', 'Quảng Nam'], image: '/images/regions/central.jpg', href: '/products?region=central' },
  { name: 'Miền Nam', provinces: ['TP.HCM', 'Cần Thơ', 'Tiền Giang', 'Bến Tre'], image: '/images/regions/south.jpg', href: '/products?region=south' },
  { name: 'Tây Nguyên', provinces: ['Đắk Lắk', 'Gia Lai', 'Kon Tum', 'Lâm Đồng'], image: '/images/regions/highland.jpg', href: '/products?region=highland' },
];

export function RegionalDiscovery() {
  return (
    <section className="section-padding bg-earth-50">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-3">
            Khám Phá Theo Vùng
          </h2>
          <p className="text-earth-500 text-lg max-w-xl mx-auto">
            Mỗi vùng đất có những hương vị đặc trưng riêng, phản ánh văn hóa và con người nơi đó.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {regions.map((region) => (
            <Link
              key={region.name}
              href={region.href}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-earth-200"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-earth-900/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-earth-300 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                <h3 className="font-display text-xl font-bold text-white mb-1">{region.name}</h3>
                <p className="text-earth-300 text-xs">
                  {region.provinces.join(' · ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
