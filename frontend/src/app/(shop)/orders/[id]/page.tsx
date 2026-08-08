'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircleIcon, TruckIcon, MapPinIcon, GiftIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { formatPrice, formatDate } from '@/lib/utils';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';

type OrderItem = {
  id: string; product_name: string; variant_name: string | null;
  quantity: number; unit_price: number; total_price: number; store_name: string;
};

type OrderDetail = {
  id: string; status: string; created_at: number;
  subtotal: number; shipping_fee: number; discount: number; total: number;
  shipping_address: string; note: string | null;
  gift_message: string | null; gift_recipient_name: string | null; hide_price: number;
  scheduled_date: number | null;
  items: OrderItem[];
};

const statusSteps = [
  { key: 'pending', label: 'Chờ xác nhận', icon: '📋' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
  { key: 'processing', label: 'Đang xử lý', icon: '📦' },
  { key: 'shipped', label: 'Đang giao', icon: '🚚' },
  { key: 'delivered', label: 'Đã giao', icon: '🎉' },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOrder(id);
  const cancelOrder = useCancelOrder();

  const order = (data as { data: OrderDetail } | undefined)?.data;

  if (isLoading) {
    return (
      <div className="container-wide py-10 max-w-3xl animate-pulse space-y-6">
        <div className="h-24 bg-earth-100 rounded-2xl" />
        <div className="h-40 bg-earth-100 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container-wide py-16 text-center max-w-md mx-auto">
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-2">Không tìm thấy đơn hàng</h1>
        <p className="text-earth-500 mb-6">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
        <Link href="/account/orders" className="btn-primary">Xem Đơn Hàng Của Tôi</Link>
      </div>
    );
  }

  const address = JSON.parse(order.shipping_address) as {
    fullName: string; phone: string; line1: string; district: string; province: string;
  };

  const isCancelled = order.status === 'cancelled';
  const currentStep = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="container-wide py-10 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-10">
        {isCancelled ? (
          <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-3" />
        ) : (
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
        )}
        <h1 className="font-display text-3xl font-bold text-earth-900 mb-1">
          {isCancelled ? 'Đơn Hàng Đã Hủy' : 'Đặt Hàng Thành Công!'}
        </h1>
        <p className="text-earth-500">
          Mã đơn hàng: <span className="font-mono font-semibold text-earth-800">#{order.id.slice(0, 8).toUpperCase()}</span>
        </p>
        <p className="text-earth-400 text-sm mt-1">{formatDate(order.created_at)}</p>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
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
      )}

      {/* Gift info */}
      {(order.gift_message || order.gift_recipient_name) && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-6 flex gap-3">
          <GiftIcon className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            {order.gift_recipient_name && (
              <div className="font-medium text-earth-800">Tặng cho: {order.gift_recipient_name}</div>
            )}
            {order.gift_message && <div className="text-earth-600 italic mt-1">&ldquo;{order.gift_message}&rdquo;</div>}
            {!!order.hide_price && <div className="text-earth-400 text-xs mt-1.5">Giá tiền được ẩn trên hóa đơn giao hàng</div>}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* Items */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5">
          <h2 className="font-semibold text-earth-900 mb-4">Sản Phẩm</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-earth-700">
                  {item.product_name}
                  {item.variant_name && <span className="text-earth-400"> · {item.variant_name}</span>}
                  <span className="text-earth-400"> ×{item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.total_price)}</span>
              </div>
            ))}
            <div className="border-t border-earth-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-earth-500">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-earth-500">Phí vận chuyển</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-earth-500">Giảm giá</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-earth-900 pt-1 border-t border-earth-100">
                <span>Tổng cộng</span>
                <span className="text-brand-600">{formatPrice(order.total)}</span>
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
            <div className="font-semibold text-earth-800">{address.fullName}</div>
            <div>{address.phone}</div>
            <div>{address.line1}</div>
            <div>{address.district}, {address.province}</div>
          </div>

          <div className="mt-5 p-3 bg-earth-50 rounded-xl flex items-center gap-3">
            <TruckIcon className="w-5 h-5 text-brand-500" />
            <div className="text-sm">
              <div className="font-medium text-earth-800">
                {order.scheduled_date ? 'Ngày giao mong muốn' : 'Dự kiến giao hàng'}
              </div>
              <div className="text-earth-400">
                {order.scheduled_date ? formatDate(order.scheduled_date) : '3–5 ngày làm việc'}
              </div>
            </div>
          </div>

          {order.note && (
            <p className="text-earth-500 text-xs mt-3">Ghi chú: {order.note}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/account/orders" className="btn-secondary flex-1 justify-center">
          Xem Tất Cả Đơn Hàng
        </Link>
        {order.status === 'pending' ? (
          <button
            onClick={() => cancelOrder.mutate(order.id)}
            disabled={cancelOrder.isPending}
            className="btn-secondary flex-1 justify-center text-red-500 disabled:opacity-60"
          >
            {cancelOrder.isPending ? 'Đang hủy...' : 'Hủy Đơn Hàng'}
          </button>
        ) : (
          <Link href="/products" className="btn-primary flex-1 justify-center">
            Tiếp Tục Mua Sắm
          </Link>
        )}
      </div>
    </div>
  );
}
