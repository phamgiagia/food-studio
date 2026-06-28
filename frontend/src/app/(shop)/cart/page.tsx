'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container-wide py-20 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-earth-200 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-earth-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-earth-500 mb-6">Thêm đặc sản vào giỏ hàng để tiến hành thanh toán</p>
        <Link href="/products" className="btn-primary">Khám Phá Sản Phẩm</Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <h1 className="font-display text-3xl font-bold text-earth-900 mb-8">
        Giỏ Hàng <span className="text-earth-400 font-normal text-xl">({totalItems()} sản phẩm)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = item.variant?.price ?? item.product.basePrice;
            const image = item.product.images?.[0];

            return (
              <div key={`${item.productId}-${item.variantId ?? ''}`}
                className="flex gap-4 bg-white border border-earth-100 rounded-2xl p-4">
                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-earth-100">
                    {image ? (
                      <Image src={image.url} alt={item.product.name} width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-earth-200" />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}
                    className="font-semibold text-earth-800 hover:text-brand-600 transition-colors line-clamp-2">
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <div className="text-earth-400 text-xs mt-0.5">{item.variant.name}</div>
                  )}
                  <div className="font-bold text-earth-900 mt-1">{formatPrice(price)}</div>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-earth-400 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div className="flex items-center border border-earth-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-earth-50"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-earth-50"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-semibold text-earth-800 text-sm">
                    {formatPrice(price * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="h-fit bg-white border border-earth-100 rounded-2xl p-6 sticky top-24">
          <h2 className="font-semibold text-earth-900 mb-4">Tóm Tắt Đơn Hàng</h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-earth-500">Tạm tính ({totalItems()} sản phẩm)</span>
              <span className="font-medium">{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-earth-500">Phí vận chuyển</span>
              <span className="text-green-600 font-medium">Tính khi đặt hàng</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mã giảm giá"
                className="flex-1 border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button className="btn-secondary text-sm px-4 py-2">Áp dụng</button>
            </div>
          </div>

          <div className="border-t border-earth-100 pt-4 mb-5">
            <div className="flex justify-between font-bold text-earth-900">
              <span>Tổng cộng</span>
              <span className="text-brand-600">{formatPrice(totalPrice())}</span>
            </div>
          </div>

          <Link href="/checkout" className="btn-primary w-full justify-center py-3.5">
            Tiến Hành Thanh Toán
          </Link>

          <Link href="/products" className="btn-secondary w-full justify-center py-3 mt-2 text-sm">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
