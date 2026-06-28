'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type Product = {
  id: string; name: string; slug: string; status: string;
  price: number; created_at: number;
  seller_name: string; category_name: string; stock: number;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp', pending: 'Chờ duyệt', active: 'Đang bán', inactive: 'Ngừng bán', rejected: 'Từ chối',
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'gray', pending: 'yellow', active: 'green', inactive: 'gray', rejected: 'red',
};

export default function AdminProductsPage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', statusFilter, page],
    queryFn: () => adminApi.products.list({ status: statusFilter || undefined, page }),
  });

  const { mutate: approve } = useMutation({
    mutationFn: (id: string) => adminApi.products.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => adminApi.products.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const products = (data as { products: Product[] } | undefined)?.products ?? [];
  const total = (data as { total: number } | undefined)?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-500 text-sm">{total} sản phẩm</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'pending', 'active', 'inactive', 'rejected'].map(s => (
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
                <th>Sản phẩm</th>
                <th>Nhà bán</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="font-medium text-gray-900 max-w-[200px] truncate">{product.name}</div>
                    <div className="text-xs text-gray-400">{formatDate(product.created_at)}</div>
                  </td>
                  <td className="text-sm">{product.seller_name}</td>
                  <td className="text-sm text-gray-500">{product.category_name}</td>
                  <td className="font-semibold text-sm">{formatPrice(product.price)}</td>
                  <td className="text-sm">{product.stock}</td>
                  <td>
                    <span className={`badge-${STATUS_COLORS[product.status] === 'green' ? 'success' : STATUS_COLORS[product.status] === 'yellow' ? 'warning' : STATUS_COLORS[product.status] === 'red' ? 'danger' : 'default'}`}>
                      {STATUS_LABELS[product.status] ?? product.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {product.status === 'pending' && (
                        <>
                          <button onClick={() => approve(product.id)}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Duyệt">
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => reject(product.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Từ chối">
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">Không có sản phẩm</td></tr>
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
