'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import { adminApi } from '@/lib/api';

const STATUS_CLASS: Record<string, string> = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

const STATUS_LABEL: Record<string, string> = {
  pending:   'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipped:   'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

interface Overview {
  gmv: number;
  orders: number;
  sellers: number;
  customers: number;
  pendingSellers: number;
  recentOrders: Array<{
    id: string; customer_name: string; total: number; status: string; created_at: string;
  }>;
}

const SKELETON_KPIS = [
  'Doanh thu tháng này', 'Đơn hàng', 'Nhà bán hàng hoạt động', 'Khách hàng mới',
];

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.overview()
      .then(data => setOverview(data as Overview))
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = overview ? [
    { label: 'Doanh thu tháng này', value: formatPrice(overview.gmv),      change: null, up: true  },
    { label: 'Đơn hàng',           value: overview.orders.toLocaleString(), change: null, up: true  },
    { label: 'Nhà bán hàng',        value: overview.sellers.toLocaleString(), change: null, up: true },
    { label: 'Khách hàng',          value: overview.customers.toLocaleString(), change: null, up: true },
  ] : [];

  const recentOrders = overview?.recentOrders ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tổng Quan</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loading
          ? SKELETON_KPIS.map(label => (
              <div key={label} className="stat-card animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))
          : kpis.length === 0
            ? SKELETON_KPIS.map(label => (
                <div key={label} className="stat-card">
                  <div className="text-gray-500 text-xs mb-2">{label}</div>
                  <div className="text-2xl font-bold text-gray-300 mb-2">—</div>
                </div>
              ))
            : kpis.map(kpi => (
                <div key={kpi.label} className="stat-card">
                  <div className="text-gray-500 text-xs mb-2">{kpi.label}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</div>
                  {kpi.change && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                      {kpi.up ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                      {kpi.change} so với tháng trước
                    </div>
                  )}
                </div>
              ))
        }
      </div>

      {/* Pending sellers alert */}
      {overview && overview.pendingSellers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="text-amber-800 text-sm font-medium">
            ⚠️ Có <strong>{overview.pendingSellers} nhà bán hàng</strong> đang chờ phê duyệt
          </div>
          <a href="/sellers?status=pending" className="text-amber-700 font-semibold text-sm hover:underline">
            Xem ngay →
          </a>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Đơn Hàng Gần Đây</h2>
          <a href="/orders" className="text-orange-600 text-sm hover:underline">Xem tất cả</a>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chưa có đơn hàng nào</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="font-mono text-orange-600 font-medium">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td>{order.customer_name}</td>
                  <td className="font-medium">{formatPrice(order.total)}</td>
                  <td>
                    <span className={STATUS_CLASS[order.status] ?? 'badge-gray'}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
