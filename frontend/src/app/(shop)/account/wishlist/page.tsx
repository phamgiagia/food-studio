'use client';

import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '@/lib/utils';

// Placeholder — real: fetch from /wishlists/me
const mockWishlist = [
  { id: 'w1', productId: 'p1', productName: 'Trà Shan Tuyết Hà Giang', slug: 'tra-shan-tuyet-ha-giang', price: 180000, province: 'Hà Giang' },
  { id: 'w2', productId: 'p2', productName: 'Mật Ong Rừng Tây Nguyên', slug: 'mat-ong-rung-tay-nguyen', price: 250000, province: 'Đắk Lắk' },
];

export default function WishlistPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Sản Phẩm Yêu Thích</h1>

      {mockWishlist.length === 0 ? (
        <div className="text-center py-16 bg-white border border-earth-100 rounded-2xl">
          <HeartIcon className="w-12 h-12 text-earth-200 mx-auto mb-3" />
          <p className="text-earth-500 mb-4">Chưa có sản phẩm nào trong danh sách</p>
          <Link href="/products" className="btn-primary">Khám Phá Sản Phẩm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockWishlist.map(item => (
            <div key={item.id} className="bg-white border border-earth-100 rounded-2xl p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-earth-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold text-earth-800 hover:text-brand-600 transition-colors line-clamp-2">
                  {item.productName}
                </Link>
                <div className="text-earth-400 text-xs mt-0.5">{item.province}</div>
                <div className="font-bold text-earth-900 mt-1">{formatPrice(item.price)}</div>
              </div>
              <div className="flex flex-col justify-between items-end">
                <button className="text-red-400 hover:text-red-500 transition-colors">
                  <HeartIcon className="w-5 h-5 fill-current" />
                </button>
                <button className="btn-primary text-xs px-3 py-1.5">
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
