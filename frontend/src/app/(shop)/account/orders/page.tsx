'use client';

import Link from 'next/link';
import { useOrders, useCancelOrder } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const statusLabel: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function AccountOrdersPage() {
  const { data, isLoading, refetch } = useOrders();
  const cancelOrder = useCancelOrder();
  const orders = (data as { data?: Record<string, unknown>[] } | null)?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-earth-900">Đơn Hàng Của Tôi</h1>
        <button onClick={() => refetch()} className="text-earth-400 hover:text-earth-600 transition-colors">
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-24 bg-earth-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-earth-100 rounded-2xl">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-earth-500 mb-4">Bạn chưa có đơn hàng nào</p>
          <Link href="/products" className="btn-primary">Mua Sắm Ngay</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order['id'] as string} className="bg-white border border-earth-100 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-sm font-semibold text-earth-800">
                    #{(order['id'] as string).slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-earth-400 text-xs ml-2">
                    {formatDate(order['created_at'] as number)}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order['status'] as string] ?? 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[order['status'] as string] ?? order['status'] as string}
                </span>
              </div>

              <div className="text-sm text-earth-500 mb-3">
                {order['item_count'] as number} sản phẩm · Tổng{' '}
                <span className="font-semibold text-earth-800">{formatPrice(order['total'] as number)}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/orders/${order['id']}`} className="btn-secondary text-sm px-4 py-2">
                  Xem Chi Tiết
                </Link>
                {order['status'] === 'pending' && (
                  <button
                    onClick={() => cancelOrder.mutate(order['id'] as string)}
                    disabled={cancelOrder.isPending}
                    className="text-red-500 hover:text-red-600 text-sm font-medium px-4 py-2"
                  >
                    Hủy Đơn
                  </button>
                )}
                {order['status'] === 'delivered' && (
                  <Link href={`/products`} className="text-brand-600 hover:text-brand-700 text-sm font-medium px-4 py-2">
                    Mua Lại
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
