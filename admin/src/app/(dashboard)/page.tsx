import type { Metadata } from 'next';
import { formatPrice } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

export const metadata: Metadata = { title: 'Dashboard' };

const kpis = [
  { label: 'Doanh thu tháng này', value: formatPrice(128_500_000), change: '+18.2%', up: true },
  { label: 'Đơn hàng', value: '1,284', change: '+12.5%', up: true },
  { label: 'Nhà bán hàng hoạt động', value: '342', change: '+6.3%', up: true },
  { label: 'Khách hàng mới', value: '3,421', change: '-3.1%', up: false },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', total: 285000, status: 'pending', date: '28/06/2025' },
  { id: 'ORD-002', customer: 'Trần Thị B', total: 490000, status: 'confirmed', date: '28/06/2025' },
  { id: 'ORD-003', customer: 'Lê Văn C', total: 175000, status: 'shipped', date: '27/06/2025' },
  { id: 'ORD-004', customer: 'Phạm Thị D', total: 830000, status: 'delivered', date: '27/06/2025' },
  { id: 'ORD-005', customer: 'Hoàng Văn E', total: 320000, status: 'cancelled', date: '26/06/2025' },
];

const statusClass: Record<string, string> = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  shipped: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

const statusLabel: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tổng Quan</h1>
        <p className="text-gray-500 text-sm mt-0.5">Tháng 6, 2025</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="stat-card">
            <div className="text-gray-500 text-xs mb-2">{kpi.label}</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
              {kpi.up ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              {kpi.change} so với tháng trước
            </div>
          </div>
        ))}
      </div>

      {/* Pending sellers alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="text-amber-800 text-sm font-medium">
          ⚠️ Có <strong>12 nhà bán hàng</strong> đang chờ phê duyệt
        </div>
        <a href="/sellers?status=pending" className="text-amber-700 font-semibold text-sm hover:underline">
          Xem ngay →
        </a>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Đơn Hàng Gần Đây</h2>
          <a href="/orders" className="text-orange-600 text-sm hover:underline">Xem tất cả</a>
        </div>
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
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="font-mono text-orange-600 font-medium">{order.id}</td>
                <td>{order.customer}</td>
                <td className="font-medium">{formatPrice(order.total)}</td>
                <td>
                  <span className={statusClass[order.status]}>
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="text-gray-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
