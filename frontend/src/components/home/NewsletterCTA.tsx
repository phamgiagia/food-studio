'use client';

import { useState } from 'react';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="section-padding bg-brand-50">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-3">
            Đừng Bỏ Lỡ Đặc Sản Mới
          </h2>
          <p className="text-earth-600 text-lg mb-8">
            Đăng ký nhận bản tin để cập nhật đặc sản mới, ưu đãi độc quyền và câu chuyện từ các nhà sản xuất địa phương.
          </p>
          {submitted ? (
            <div className="bg-brand-100 text-brand-700 rounded-xl py-4 px-6 font-semibold">
              Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi email xác nhận sớm.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Đăng Ký
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
