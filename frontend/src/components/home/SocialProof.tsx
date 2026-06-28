const TESTIMONIALS = [
  { name: 'Chị Lan Anh, Hà Nội', text: 'Mua mắm tôm Huế cho cả nhà, ngon hơn hẳn loại ngoài chợ. Giao nhanh, đóng gói cẩn thận lắm!', rating: 5 },
  { name: 'Anh Minh Tuấn, TP.HCM', text: 'Đặt trà Shan Tuyết làm quà biếu sếp. Bao bì đẹp, trà thơm đúng vị cao nguyên, sếp khen ngay.', rating: 5 },
  { name: 'Chị Hương, Đà Nẵng', text: 'Mỗi tháng đặt một lần, luôn tươi ngon. Dịch vụ chăm sóc khách hàng nhiệt tình, hỗ trợ rất nhanh.', rating: 5 },
];

const PRESS = [
  { name: 'VnExpress', logo: 'VNE' },
  { name: 'Tuổi Trẻ', logo: 'TT' },
  { name: 'Thanh Niên', logo: 'TN' },
  { name: 'Dân Trí', logo: 'DT' },
];

export function SocialProof() {
  return (
    <section className="section-padding bg-earth-50">
      <div className="container-wide">
        <div className="text-center mb-10">
          <div className="text-3xl font-bold text-earth-900 font-display mb-2">
            Được tin dùng bởi <span className="text-brand-600">10,000+</span> gia đình Việt
          </div>
          <p className="text-earth-500">Hàng nghìn đơn hàng đặc sản được giao mỗi tháng trên khắp cả nước</p>
        </div>

        {/* Press logos */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <span className="text-earth-400 text-sm font-medium shrink-0">Được nhắc đến trên</span>
          <div className="flex items-center gap-6">
            {PRESS.map(p => (
              <div key={p.name} className="bg-white border border-earth-100 rounded-xl px-4 py-2.5 text-earth-500 font-bold text-sm tracking-wide">
                {p.logo}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-earth-100 p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-earth-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-earth-400 text-xs font-medium">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
