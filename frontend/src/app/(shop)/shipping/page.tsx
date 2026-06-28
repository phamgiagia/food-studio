import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính Sách Vận Chuyển - Food Studio',
  description: 'Cách chúng tôi đảm bảo đặc sản đến tay bạn tươi ngon, an toàn',
};

const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Tiêu Chuẩn',
    fee: '30.000đ',
    time: '2–4 ngày làm việc',
    carrier: 'GHTK / GHN',
    note: 'Phù hợp với đặc sản khô, trà, cà phê, gia vị',
  },
  {
    id: 'express',
    name: 'Hỏa Tốc',
    fee: '55.000đ',
    time: '1–2 ngày làm việc',
    carrier: 'J&T Express / Viettel Post',
    note: 'Khuyến nghị cho hải sản, trái cây, bánh tươi',
  },
];

const FAQS = [
  {
    q: 'Đặc sản tươi có ship xa được không?',
    a: 'Có. Chúng tôi sử dụng túi giữ nhiệt và đá khô để bảo quản trong suốt hành trình. Sản phẩm tươi như hải sản, trái cây sẽ được đề xuất gói Hỏa Tốc để đảm bảo chất lượng tốt nhất.',
  },
  {
    q: 'Mùa hè ship thế nào để không bị hỏng?',
    a: 'Các đơn có sản phẩm nhạy nhiệt được đóng gói thêm lớp xốp cách nhiệt và gel làm lạnh. Chúng tôi ưu tiên giao vào buổi sáng sớm hoặc tối để tránh nắng gắt.',
  },
  {
    q: 'Nếu hàng hỏng khi nhận thì xử lý thế nào?',
    a: 'Chụp ảnh tình trạng hàng khi mở hộp và liên hệ với chúng tôi trong vòng 24 giờ. Chúng tôi sẽ hoàn tiền 100% hoặc gửi lại hàng tùy trường hợp.',
  },
  {
    q: 'Có thể chọn ngày giao hàng không?',
    a: 'Có. Khi thanh toán, bạn có thể chọn ngày mong muốn nhận hàng (trong vòng 14 ngày từ ngày đặt). Tính năng này đặc biệt hữu ích khi mua quà tặng.',
  },
];

export default function ShippingPage() {
  return (
    <div className="container-wide py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-earth-900 mb-3">Chúng tôi ship như thế nào?</h1>
        <p className="text-earth-500 text-lg">Mỗi đơn hàng được chúng tôi chuẩn bị và đóng gói thủ công để đặc sản đến tay bạn đúng như khi còn ở quê.</p>
      </div>

      {/* Packaging steps */}
      <section className="mb-12">
        <h2 className="font-semibold text-earth-900 text-xl mb-6">Quy trình đóng gói</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { step: '01', icon: '🧹', title: 'Kiểm tra chất lượng', desc: 'Nhà bán hàng kiểm tra từng sản phẩm trước khi đóng gói' },
            { step: '02', icon: '📦', title: 'Đóng gói tiêu chuẩn', desc: 'Hộp carton 3 lớp, túi giữ nhiệt, đá khô (nếu cần)' },
            { step: '03', icon: '🏷️', title: 'Dán nhãn & QR', desc: 'Mã QR truy xuất nguồn gốc in trên mỗi kiện hàng' },
            { step: '04', icon: '🚚', title: 'Giao vận tin cậy', desc: 'Bàn giao cho GHTK / GHN / J&T theo tuyến tối ưu' },
          ].map(s => (
            <div key={s.step} className="bg-earth-50 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-brand-600 font-bold text-xs mb-1">Bước {s.step}</div>
              <div className="font-semibold text-earth-800 text-sm mb-1">{s.title}</div>
              <div className="text-earth-500 text-xs">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping methods */}
      <section className="mb-12">
        <h2 className="font-semibold text-earth-900 text-xl mb-6">Phương thức vận chuyển</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SHIPPING_METHODS.map(m => (
            <div key={m.id} className="bg-white border border-earth-100 rounded-2xl p-6">
              <div className="font-bold text-earth-900 text-lg mb-1">{m.name}</div>
              <div className="text-brand-600 font-semibold text-xl mb-3">{m.fee}</div>
              <div className="space-y-1.5 text-sm text-earth-600">
                <div>⏱ Thời gian: <span className="font-medium text-earth-800">{m.time}</span></div>
                <div>🚚 Đơn vị: <span className="font-medium text-earth-800">{m.carrier}</span></div>
                <div className="text-earth-400 text-xs mt-2 italic">{m.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Commitment */}
      <section className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-12">
        <h2 className="font-semibold text-earth-900 text-xl mb-4">Cam kết của chúng tôi</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '✅', title: 'Hoàn tiền 100%', desc: 'Nếu hàng hỏng, hết hạn, hoặc không đúng mô tả khi nhận' },
            { icon: '📍', title: 'Theo dõi đơn hàng', desc: 'Link tracking thực thời gian gửi qua SMS và email ngay sau khi giao vận nhận hàng' },
            { icon: '🔒', title: 'Nguồn gốc rõ ràng', desc: 'Mỗi sản phẩm có mã QR truy xuất đến tận hộ sản xuất' },
          ].map(c => (
            <div key={c.title} className="text-center">
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="font-semibold text-earth-800 text-sm mb-1">{c.title}</div>
              <div className="text-earth-500 text-xs">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-semibold text-earth-900 text-xl mb-6">Câu hỏi thường gặp</h2>
        <div className="space-y-4">
          {FAQS.map(faq => (
            <div key={faq.q} className="bg-white border border-earth-100 rounded-2xl p-5">
              <div className="font-semibold text-earth-800 mb-2">{faq.q}</div>
              <div className="text-earth-600 text-sm leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
