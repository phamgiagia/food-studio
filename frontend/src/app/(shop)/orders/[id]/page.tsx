import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatPrice, formatDate } from '@/lib/utils';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Đơn hàng #${id.slice(0, 8).toUpperCase()}` };
}

const statusSteps = [
  { key: 'pending', label: 'Chờ xác nhận', icon: '📋' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
  { key: 'processing', label: 'Đang xử lý', icon: '📦' },
  { key: 'shipped', label: 'Đang giao', icon: '🚚' },
  { key: 'delivered', label: 'Đã giao', icon: '🎉' },
];

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  // In production: const order = await orderApi.get(id);

  const mockOrder = {
    id,
    status: 'confirmed' as const,
    createdAt: Math.floor(Date.now() / 1000),
    subtotal: 285000,
    shippingFee: 30000,
    discount: 0,
    total: 315000,
    shippingAddress: { fullName: 'Nguyễn Văn A', phone: '0901234567', line1: '123 Đường ABC', district: 'Quận 1', province: 'TP. Hồ Chí Minh' },
    items: [
      { id: 'i1', productName: 'Mắm Tôm Huế Truyền Thống', variantName: '200g', quantity: 2, unitPrice: 85000, totalPrice: 170000 },
      { id: 'i2', productName: 'Nước Mắm Phú Quốc Sạch', quantity: 1, unitPrice: 115000, totalPrice: 115000 },
    ],
  };

  const currentStep = statusSteps.findIndex(s => s.key === mockOrder.status);

  return (
    <div className="container-wide py-10 max-w-3xl">
      {/* Success header */}
      <div className="text-center mb-10">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
        <h1 className="font-display text-3xl font-bold text-earth-900 mb-1">Đặt Hàng Thành Công!</h1>
        <p className="text-earth-500">
          Mã đơn hàng: <span className="font-mono font-semibold text-earth-800">#{id.slice(0, 8).toUpperCase()}</span>
        </p>
        <p className="text-earth-400 text-sm mt-1">{formatDate(mockOrder.createdAt)}</p>
      </div>

      {/* Status tracker */}
      <div className="bg-white border border-earth-100 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-earth-900 mb-5">Trạng Thái Đơn Hàng</h2>
        <div className="flex items-center">
          {statusSteps.map((step, idx) => (
            <div key={step.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1.5 transition-all ${
                  idx <= currentStep ? 'bg-brand-100' : 'bg-earth-100'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs text-center font-medium ${idx <= currentStep ? 'text-brand-600' : 'text-earth-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 ${idx < currentStep ? 'bg-brand-300' : 'bg-earth-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* Items */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5">
          <h2 className="font-semibold text-earth-900 mb-4">Sản Phẩm</h2>
          <div className="space-y-3">
            {mockOrder.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-earth-700">
                  {item.productName}
                  {item.variantName && <span className="text-earth-400"> · {item.variantName}</span>}
                  <span className="text-earth-400"> ×{item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            <div className="border-t border-earth-100 pt-3 space-y-1.5">
              {[
                ['Tạm tính', mockOrder.subtotal],
                ['Phí vận chuyển', mockOrder.shippingFee],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-earth-500">{label}</span>
                  <span>{formatPrice(val as number)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-earth-900 pt-1 border-t border-earth-100">
                <span>Tổng cộng</span>
                <span className="text-brand-600">{formatPrice(mockOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5">
          <h2 className="font-semibold text-earth-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" /> Địa Chỉ Giao Hàng
          </h2>
          <div className="text-sm text-earth-600 space-y-1">
            <div className="font-semibold text-earth-800">{mockOrder.shippingAddress.fullName}</div>
            <div>{mockOrder.shippingAddress.phone}</div>
            <div>{mockOrder.shippingAddress.line1}</div>
            <div>{mockOrder.shippingAddress.district}, {mockOrder.shippingAddress.province}</div>
          </div>

          <div className="mt-5 p-3 bg-earth-50 rounded-xl flex items-center gap-3">
            <TruckIcon className="w-5 h-5 text-brand-500" />
            <div className="text-sm">
              <div className="font-medium text-earth-800">Dự kiến giao hàng</div>
              <div className="text-earth-400">3–5 ngày làm việc</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/account/orders" className="btn-secondary flex-1 justify-center">
          Xem Tất Cả Đơn Hàng
        </Link>
        <Link href="/products" className="btn-primary flex-1 justify-center">
          Tiếp Tục Mua Sắm
        </Link>
      </div>
    </div>
  );
}
