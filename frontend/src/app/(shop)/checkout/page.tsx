'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PROVINCES } from '@food-studio/utils';
import { useCartStore } from '@/store/cart';
import { usePlaceOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh thành'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  line1: z.string().min(5, 'Vui lòng nhập địa chỉ cụ thể'),
  note: z.string().optional(),
  paymentMethod: z.enum(['vnpay', 'momo', 'zalopay', 'cod']),
});

type ShippingForm = z.infer<typeof shippingSchema>;

const paymentMethods = [
  { id: 'vnpay', label: 'VNPay', description: 'Thanh toán qua VNPay' },
  { id: 'momo', label: 'MoMo', description: 'Ví điện tử MoMo' },
  { id: 'zalopay', label: 'ZaloPay', description: 'Ví điện tử ZaloPay' },
  { id: 'cod', label: 'COD', description: 'Thanh toán khi nhận hàng' },
] as const;

export default function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCartStore();
  const placeOrder = usePlaceOrder();
  const [selectedPayment, setSelectedPayment] = useState<'vnpay' | 'momo' | 'zalopay' | 'cod'>('vnpay');

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { paymentMethod: 'vnpay' },
  });

  const shippingFee = 30000;
  const subtotal = totalPrice();
  const total = subtotal + shippingFee;

  const onSubmit = async (data: ShippingForm) => {
    await placeOrder.mutateAsync({
      items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      shippingAddressId: 'inline',
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        district: data.district,
        province: data.province,
        country: 'VN',
      },
      shippingMethod: 'standard',
      paymentMethod: selectedPayment,
      note: data.note,
    });
  };

  return (
    <div className="container-wide py-10 max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-earth-900 mb-8">Thanh Toán</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping info */}
            <section className="bg-white border border-earth-100 rounded-2xl p-6">
              <h2 className="font-semibold text-earth-900 mb-4">Thông Tin Giao Hàng</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Họ và tên *" error={errors.fullName?.message} className="col-span-2 sm:col-span-1">
                  <input {...register('fullName')} className={inputCls} placeholder="Nguyễn Văn A" />
                </FormField>
                <FormField label="Số điện thoại *" error={errors.phone?.message} className="col-span-2 sm:col-span-1">
                  <input {...register('phone')} type="tel" className={inputCls} placeholder="0901234567" />
                </FormField>
                <FormField label="Tỉnh / Thành phố *" error={errors.province?.message} className="col-span-2 sm:col-span-1">
                  <select {...register('province')} className={inputCls}>
                    <option value="">Chọn tỉnh thành</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FormField>
                <FormField label="Quận / Huyện *" error={errors.district?.message} className="col-span-2 sm:col-span-1">
                  <input {...register('district')} className={inputCls} placeholder="Quận Hoàn Kiếm" />
                </FormField>
                <FormField label="Địa chỉ cụ thể *" error={errors.line1?.message} className="col-span-2">
                  <input {...register('line1')} className={inputCls} placeholder="Số nhà, tên đường, phường/xã" />
                </FormField>
                <FormField label="Ghi chú đơn hàng" className="col-span-2">
                  <textarea {...register('note')} rows={2} className={inputCls} placeholder="Giao hàng giờ hành chính, gọi trước khi giao..." />
                </FormField>
              </div>
            </section>

            {/* Payment method */}
            <section className="bg-white border border-earth-100 rounded-2xl p-6">
              <h2 className="font-semibold text-earth-900 mb-4">Phương Thức Thanh Toán</h2>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedPayment(m.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${selectedPayment === m.id ? 'border-brand-500 bg-brand-50' : 'border-earth-200 hover:border-earth-300'}`}
                  >
                    <div className="font-semibold text-earth-800 text-sm">{m.label}</div>
                    <div className="text-earth-400 text-xs">{m.description}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-earth-100 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-earth-900 mb-4">
                Đơn Hàng ({totalItems()} sản phẩm)
              </h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-earth-600 line-clamp-1 flex-1">
                      {item.product.name}
                      {item.variant && <span className="text-earth-400"> · {item.variant.name}</span>}
                      <span className="text-earth-400"> ×{item.quantity}</span>
                    </span>
                    <span className="font-medium ml-2 shrink-0">
                      {formatPrice((item.variant?.price ?? item.product.basePrice) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-earth-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-earth-500">Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-earth-500">Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-earth-900 pt-2 border-t border-earth-100">
                  <span>Tổng cộng</span>
                  <span className="text-brand-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placeOrder.isPending || items.length === 0}
                className="btn-primary w-full justify-center py-3.5 gap-2"
              >
                <LockClosedIcon className="w-4 h-4" />
                {placeOrder.isPending ? 'Đang xử lý...' : 'Đặt Hàng'}
              </button>

              <p className="text-earth-400 text-xs text-center mt-3">
                Đơn hàng được bảo vệ bởi mã hoá SSL 256-bit
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white';

function FormField({ label, children, error, className }: { label: string; children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-earth-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
