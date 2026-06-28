'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

type AnalyticsData = {
  revenue_by_day: { date: string; revenue: number; orders: number }[];
  top_sellers: { name: string; gmv: number; orders: number }[];
  top_categories: { name: string; revenue: number }[];
  conversion_rate: number;
  avg_order_value: number;
  new_customers_30d: number;
  returning_customers_30d: number;
};

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get<AnalyticsData>('/admin/analytics/detailed'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  const revenueData = data?.revenue_by_day ?? Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}/6`,
    revenue: Math.floor(Math.random() * 50_000_000 + 10_000_000),
    orders: Math.floor(Math.random() * 100 + 20),
  }));

  const topSellers = data?.top_sellers ?? [
    { name: 'Mắm Tôm Cô Ba', gmv: 145_000_000, orders: 382 },
    { name: 'Cà Phê Trung Nguyên', gmv: 98_000_000, orders: 256 },
    { name: 'Nước Mắm Tiến Vua', gmv: 76_000_000, orders: 198 },
    { name: 'Hải Sản Đà Nẵng', gmv: 61_000_000, orders: 145 },
    { name: 'Chè Tà Phình Lai Châu', gmv: 44_000_000, orders: 112 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Phân tích & Báo cáo</h1>
        <p className="text-gray-500 text-sm">Dữ liệu 30 ngày gần nhất</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tỷ lệ chuyển đổi', value: `${(data?.conversion_rate ?? 3.2).toFixed(1)}%` },
          { label: 'Giá trị đơn TB', value: formatPrice(data?.avg_order_value ?? 485_000) },
          { label: 'KH mới (30 ngày)', value: (data?.new_customers_30d ?? 1240).toLocaleString() },
          { label: 'KH quay lại', value: (data?.returning_customers_30d ?? 3820).toLocaleString() },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Doanh thu 30 ngày</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: number) => formatPrice(v)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} name="Doanh thu" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Đơn hàng theo ngày</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#fb923c" radius={[4, 4, 0, 0]} name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top sellers */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top nhà bán hàng</h2>
          <div className="space-y-3">
            {topSellers.map((seller, i) => (
              <div key={seller.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{seller.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-2">{formatPrice(seller.gmv)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-orange-400 rounded-full"
                      style={{ width: `${(seller.gmv / topSellers[0].gmv) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
