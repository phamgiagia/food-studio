import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-earth-900">
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-gradient-to-r from-earth-900/90 via-earth-900/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />

      <div className="relative z-20 container-wide h-full flex items-center">
        <div className="max-w-2xl">
          <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Hương vị quê hương
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Đặc Sản Vùng Miền
            <span className="text-brand-400"> Chính Gốc</span>
          </h1>
          <p className="text-earth-300 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
            Khám phá hàng ngàn đặc sản từ khắp mọi miền đất nước, được chọn lọc kỹ càng từ các hộ sản xuất địa phương uy tín.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="btn-primary text-base px-8 py-4">
              Khám Phá Ngay
            </Link>
            <Link href="/sellers" className="btn-secondary text-base px-8 py-4 bg-white/10 text-white hover:bg-white/20 border-0">
              Gặp Gỡ Nhà Bán Hàng
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-8">
            {[
              { value: '1,200+', label: 'Sản phẩm' },
              { value: '63', label: 'Tỉnh thành' },
              { value: '500+', label: 'Nhà bán hàng' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-earth-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
