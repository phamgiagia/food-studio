'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useState } from 'react';

type Order = {
  id: string; order_number: string; status: string;
  total_amount: number; created_at: number;
  user_name: string; user_email: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', processing: 'Đang xử lý',
  shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy', refunded: 'Hoàn tiền',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-danger',
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered',
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => adminApi.orders.list({ status: statusFilter || undefined, page }),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.orders.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const orders = (data as { orders: Order[] } | undefined)?.orders ?? [];
  const total = (data as { total: number } | undefined)?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-gray-500 text-sm">{total} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === '' ? 'Tất cả' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-sm font-semibold">{order.order_number}</td>
                  <td>
                    <div className="font-medium text-gray-900">{order.user_name}</div>
                    <div className="text-xs text-gray-400">{order.user_email}</div>
                  </td>
                  <td>
                    <span className={`badge-${STATUS_COLORS[order.status]?.replace('badge-', '') ?? 'info'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="font-semibold">{formatPrice(order.total_amount)}</td>
                  <td className="text-gray-500 text-sm">{formatDate(order.created_at)}</td>
                  <td>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => updateStatus({ id: order.id, status: NEXT_STATUS[order.status] })}
                        className="text-xs text-orange-600 font-medium hover:text-orange-700"
                      >
                        → {STATUS_LABELS[NEXT_STATUS[order.status]]}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Không có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-40">← Trước</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Trang {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm disabled:opacity-40">Sau →</button>
        </div>
      )}
    </div>
  );
}
