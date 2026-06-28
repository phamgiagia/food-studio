'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

type Customer = {
  id: string; name: string; email: string; created_at: number;
  order_count: number; total_spent: number; status: string;
};

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => {
      const q = new URLSearchParams({ page: String(page), ...(search ? { q: search } : {}) });
      return api.get<{ customers: Customer[]; total: number }>(`/admin/customers?${q}`);
    },
  });

  const customers = data?.customers ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Khách hàng</h1>
          <p className="text-gray-500 text-sm">{total} khách hàng</p>
        </div>
        <input
          type="search"
          placeholder="Tìm theo tên, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-3.5 py-2 rounded-lg border border-gray-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Ngày đăng ký</th>
                <th>Đơn hàng</th>
                <th>Tổng chi tiêu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-400">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{formatDate(customer.created_at)}</td>
                  <td className="font-semibold">{customer.order_count}</td>
                  <td className="font-semibold">{formatPrice(customer.total_spent)}</td>
                  <td>
                    <span className={customer.status === 'active' ? 'badge-success' : 'badge-danger'}>
                      {customer.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">Không có khách hàng</td></tr>
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
