'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { CheckCircleIcon, XCircleIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';

type Subscription = {
  id: string;
  user_name: string;
  user_email: string;
  plan_name: string;
  store_name: string;
  status: string;
  total_deliveries: number;
  max_deliveries: number | null;
  auto_renew: boolean;
  current_period_end: number;
  created_at: number;
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'green',
  paused: 'yellow',
  cancelled: 'red',
  expired: 'gray',
};

export default function AdminSubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', statusFilter, page],
    queryFn: () => {
      const q = new URLSearchParams({ page: String(page) });
      if (statusFilter) q.set('status', statusFilter);
      return api.get<{ subscriptions: Subscription[]; total: number }>(`/admin/subscriptions?${q}`);
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/admin/subscriptions/${id}`, { action }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });

  const subs = data?.subscriptions ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đăng ký định kỳ</h1>
          <p className="text-gray-500 text-sm">{total} đăng ký</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'active', 'paused', 'cancelled', 'expired'].map(s => (
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

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Đang hoạt động', value: subs.filter(s => s.status === 'active').length },
          { label: 'Tạm dừng', value: subs.filter(s => s.status === 'paused').length },
          { label: 'Đã hủy', value: subs.filter(s => s.status === 'cancelled').length },
          { label: 'Tự động gia hạn', value: subs.filter(s => s.auto_renew).length },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Gói đăng ký</th>
                <th>Nhà bán</th>
                <th>Đã giao</th>
                <th>Kỳ tiếp</th>
                <th>Tự động</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <div className="font-medium text-gray-900">{sub.user_name}</div>
                    <div className="text-xs text-gray-400">{sub.user_email}</div>
                  </td>
                  <td>
                    <span className="font-semibold text-sm">{sub.plan_name}</span>
                    <div className="text-xs text-gray-400">{formatDate(sub.created_at)}</div>
                  </td>
                  <td className="text-sm">{sub.store_name}</td>
                  <td className="text-sm">{sub.total_deliveries}{sub.max_deliveries ? `/${sub.max_deliveries}` : '+∞'}</td>
                  <td className="text-sm text-gray-500">{formatDate(sub.current_period_end)}</td>
                  <td>
                    <span className={sub.auto_renew ? 'badge-success' : 'badge-warning'}>
                      {sub.auto_renew ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-${STATUS_COLORS[sub.status] ?? 'default'}`}>
                      {STATUS_LABELS[sub.status] ?? sub.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {sub.status === 'active' && (
                        <>
                          <button onClick={() => updateStatus({ id: sub.id, action: 'pause' })}
                            className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors" title="Tạm dừng">
                            <PauseIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus({ id: sub.id, action: 'cancel' })}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Hủy">
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {sub.status === 'paused' && (
                        <button onClick={() => updateStatus({ id: sub.id, action: 'resume' })}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Tiếp tục">
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">Chưa có đăng ký định kỳ nào</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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