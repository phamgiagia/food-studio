'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

type SellerAnalytics = {
  seller: { storeName: string; slug: string; rating: number | null; reviewCount: number };
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { product_id: string; product_name: string; sold: number; revenue: number }[];
  lowStock: { id: string; name: string; slug: string; base_price: number; quantity: number }[];
  recentOrders: {
    id: string; order_id: string; product_name: string; quantity: number;
    unit_price: number; total_price: number; order_date: number; order_status: string; status: string;
  }[];
  subscriptions: { plan_name: string; status: string; price: number | null }[];
  activeSubscribers: number;
};

function exportToCSV(data: SellerAnalytics) {
  const rows: string[] = ['Tháng,Doanh thu,Đơn hàng'];
  for (const r of data.monthlyRevenue) {
    rows.push(`${r.month},${r.revenue},${r.orders}`);
  }
  rows.push(''); rows.push('Sản phẩm,Đã bán,Doanh thu');
  for (const p of data.topProducts) {
    rows.push(`"${p.product_name}",${p.sold},${p.revenue}`);
  }
  rows.push(''); rows.push('Sản phẩm (tồn kho thấp),Số lượng');
  for (const s of data.lowStock) {
    rows.push(`"${s.name}",${s.quantity}`);
  }
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `food-studio-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ORDER_LABELS: Record<string, string> = {
  pending: 'Chờ XL', confirmed: 'Đã XN', processing: 'Đang Làm',
  shipped: 'Đã Gửi', delivered: 'Đã Giao', cancelled: 'Đã Hủy',
};
const ORDER_COLORS: Record<string, string> = {
  pending: '#fde68a', confirmed: '#bef264', processing: '#93c5fd',
  shipped: '#a5b4fc', delivered: '#86efac', cancelled: '#fca5a5',
};

export default function SellerDashboardPage() {
  const [subTab, setSubTab] = useState<'overview' | 'products' | 'orders'>('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: () => api.get<{ data: SellerAnalytics }>('/v1/sellers/me/analytics'),
  });

  const raw = data as { data: SellerAnalytics } | undefined;
  const analytics: SellerAnalytics | null = raw?.data ?? null;

  if (isLoading) {
    return (
      <div className="container-wide py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-earth-200 rounded-xl w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-earth-100 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-earth-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container-wide py-10 text-center">
        <p className="text-earth-500">Bạn cần đăng nhập với tài khoản seller để xem dashboard này.</p>
      </div>
    );
  }

  const a = analytics;
  const totalRevenue = a.monthlyRevenue.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = a.ordersByStatus.reduce((s, o) => s + o.count, 0);
  const pendingOrders = a.ordersByStatus.find(o => o.status === 'pending')?.count ?? 0;
  const deliveredOrders = a.ordersByStatus.find(o => o.status === 'delivered')?.count ?? 0;
  const maxRevenue = Math.max(...a.monthlyRevenue.map(r => r.revenue), 1);
  const maxTopRevenue = Math.max(...a.topProducts.map(p => p.revenue), 1);

  const chartHeight = 220;
  const barWidth = Math.max(24, Math.min(48, (chartHeight - 40) / Math.max(a.monthlyRevenue.length, 1)));

  return (
    <div className="container-wide py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-earth-900">{a.seller.storeName}</h1>
          <div className="flex items-center gap-3 text-sm text-earth-500 mt-1">
            <span>⭐ {a.seller.rating?.toFixed(1) ?? '—'}</span>
            <span>{a.seller.reviewCount} đánh giá</span>
            <span>{a.activeSubscribers} thuê bao</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(a)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm text-earth-700 hover:bg-earth-50 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
          <a href={`/sellers/${a.seller.slug}`}
            className="text-sm text-brand-600 hover:underline font-medium">Xem trang cửa hàng →</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'products', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              subTab === t ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}>
            {t === 'overview' ? 'Tổng quan' : t === 'products' ? 'Sản phẩm' : 'Đơn hàng'}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Tổng doanh thu', value: formatPrice(totalRevenue), color: 'text-green-600' },
              { label: 'Tổng đơn hàng', value: totalOrders, color: 'text-blue-600' },
              { label: 'Đơn chờ xử lý', value: pendingOrders, color: 'text-amber-600' },
              { label: 'Đã giao', value: deliveredOrders, color: 'text-green-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-earth-100 rounded-2xl p-5">
                <p className="text-sm text-earth-500">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Monthly bar chart */}
          <div className="bg-white border border-earth-100 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-earth-900 mb-4">Doanh thu theo tháng</h2>
            {a.monthlyRevenue.length === 0 ? (
              <p className="text-earth-400 text-sm">Chưa có dữ liệu</p>
            ) : (
              <div className="flex items-end gap-1.5" style={{ height: chartHeight }}>
                {a.monthlyRevenue.map(row => {
                  const pct = (row.revenue / maxRevenue) * 100;
                  return (
                    <div key={row.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[10px] text-earth-400">{formatPrice(row.revenue)}</span>
                      <div className="w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${pct}%`, minHeight: row.revenue > 0 ? 4 : 0 }} title={`${row.month}: ${formatPrice(row.revenue)}`} />
                      <span className="text-[10px] text-earth-500 font-medium">{row.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orders by status donut (simple) + recent orders */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-earth-100 rounded-2xl p-5">
              <h2 className="font-semibold text-earth-900 mb-3">Trạng thái đơn hàng</h2>
              {a.ordersByStatus.length === 0 ? (
                <p className="text-earth-400 text-sm">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {a.ordersByStatus.map(o => {
                    const pct = totalOrders > 0 ? (o.count / totalOrders) * 100 : 0;
                    return (
                      <div key={o.status} className="flex items-center gap-3">
                        <span className="text-xs text-earth-600 w-16">{ORDER_LABELS[o.status] ?? o.status}</span>
                        <div className="flex-1 bg-earth-100 rounded-full h-5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ORDER_COLORS[o.status] ?? '#ddd' }} />
                        </div>
                        <span className="text-sm font-semibold text-earth-700 w-10 text-right">{o.count}</span>
                        <span className="text-xs text-earth-400 w-10">{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-earth-100 rounded-2xl p-5">
              <h2 className="font-semibold text-earth-900 mb-3 flex items-center gap-2">
                Tồn kho thấp
                {a.lowStock.length > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{a.lowStock.length}</span>
                )}
              </h2>
              {a.lowStock.length === 0 ? (
                <p className="text-earth-400 text-sm">Tồn kho ổn định ✅</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {a.lowStock.map(p => (
                    <div key={p.id} className="flex justify-between text-sm py-1 border-b border-earth-50 last:border-0">
                      <span className="text-earth-700 truncate flex-1">{p.name}</span>
                      <span className="text-red-500 font-semibold ml-2">còn {p.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions */}
          {a.subscriptions.length > 0 && (
            <div className="bg-white border border-earth-100 rounded-2xl p-5">
              <h2 className="font-semibold text-earth-900 mb-3">Gói thuê bao đang bán</h2>
              <div className="space-y-1">
                {a.subscriptions.map(s => (
                  <div key={`${s.plan_name}-${s.status}`}
                    className="flex justify-between text-sm py-1.5 border-b border-earth-50 last:border-0">
                    <span className="text-earth-700">{s.plan_name}</span>
                    <span className="text-earth-500">{s.price ? formatPrice(s.price) : 'Giá gốc'}</span>
                    <span className={s.status === 'active' ? 'text-green-600' : 'text-amber-600'}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {subTab === 'products' && (
        <div className="bg-white border border-earth-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-earth-900">Top sản phẩm bán chạy</h2>
            {a.topProducts.length > 0 && (
              <span className="text-xs text-earth-400">{a.topProducts.reduce((s, p) => s + p.sold, 0)} sản phẩm đã bán</span>
            )}
          </div>
          {a.topProducts.length === 0 ? (
            <p className="text-earth-400 text-sm">Chưa có sản phẩm nào được bán</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-earth-500 border-b border-earth-100">
                    <th className="text-left py-2.5 font-medium">Sản phẩm</th>
                    <th className="text-right py-2.5 font-medium">Đã bán</th>
                    <th className="text-right py-2.5 font-medium">Doanh thu</th>
                    <th className="text-right py-2.5 font-medium w-1/3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {a.topProducts.map(p => {
                    const pct = (p.revenue / maxTopRevenue) * 100;
                    return (
                      <tr key={p.product_id} className="border-b border-earth-50">
                        <td className="py-2.5 text-earth-800 font-medium">{p.product_name}</td>
                        <td className="py-2.5 text-right">{p.sold}</td>
                        <td className="py-2.5 text-right font-semibold">{formatPrice(p.revenue)}</td>
                        <td className="py-2.5">
                          <div className="bg-earth-100 rounded-full h-3 w-full ml-auto">
                            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {a.lowStock.length > 0 && (
            <div className="mt-6 pt-4 border-t border-earth-100">
              <h3 className="font-semibold text-earth-800 mb-3 text-sm">⚠️ Sản phẩm cần nhập thêm</h3>
              <div className="space-y-1.5">
                {a.lowStock.map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-earth-700">{p.name}</span>
                    <span className="text-earth-500">{formatPrice(p.base_price)}</span>
                    <span className="text-red-500 font-semibold">còn {p.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'orders' && (
        <div className="bg-white border border-earth-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-earth-900">Đơn hàng gần đây</h2>
            <span className="text-xs text-earth-400">{a.recentOrders.length} đơn gần nhất</span>
          </div>
          {a.recentOrders.length === 0 ? (
            <p className="text-earth-400 text-sm">Chưa có đơn hàng</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-earth-500 border-b border-earth-100">
                    <th className="text-left py-2.5 font-medium">Sản phẩm</th>
                    <th className="text-right py-2.5 font-medium">SL</th>
                    <th className="text-right py-2.5 font-medium">Giá</th>
                    <th className="text-right py-2.5 font-medium">Ngày</th>
                    <th className="text-right py-2.5 font-medium">TT</th>
                  </tr>
                </thead>
                <tbody>
                  {a.recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-earth-50">
                      <td className="py-2.5 text-earth-800 max-w-[200px] truncate">{o.product_name}</td>
                      <td className="py-2.5 text-right">{o.quantity}</td>
                      <td className="py-2.5 text-right font-semibold">{formatPrice(o.total_price)}</td>
                      <td className="py-2.5 text-right text-earth-400 text-xs">{formatDate(o.order_date)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                          o.order_status === 'delivered' ? 'bg-green-100 text-green-700'
                          : o.order_status === 'shipped' ? 'bg-blue-100 text-blue-700'
                          : o.order_status === 'cancelled' ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>{ORDER_LABELS[o.order_status] ?? o.order_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}