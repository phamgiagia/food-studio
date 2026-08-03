'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, CheckCircleIcon, XCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

type SellerProduct = {
  id: string; name: string; slug: string; description: string | null;
  base_price: number; compare_price: number | null; status: string;
  category_name: string | null; region: string; province: string;
  primary_image: string | null; stock: number | null; low_stock_alert: number | null; available: number | null;
  sold_count: number; created_at: number;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp', active: 'Đang bán', paused: 'Tạm ngưng', deleted: 'Đã xóa',
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'gray', active: 'green', paused: 'yellow', deleted: 'red',
};

export default function SellerProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editStockId, setEditStockId] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState(0);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get<{ results: SellerProduct[]; pagination: { total: number } }>('/v1/products/seller'),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/v1/products/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const { mutate: updateStock } = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.patch(`/v1/products/${id}/inventory`, { quantity }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Cập nhật tồn kho thành công');
      setEditStockId(null);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const raw = data as unknown as { results: SellerProduct[]; pagination: { total: number } };
  const products = raw?.results ?? [];
  const total = raw?.pagination?.total ?? 0;

  // Stats
  const activeCount = products.filter(p => p.status === 'active').length;
  const draftCount = products.filter(p => p.status === 'draft').length;
  const totalSold = products.reduce((s, p) => s + p.sold_count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-earth-900">Sản Phẩm Của Tôi</h1>
          <p className="text-earth-500 text-sm">{total} sản phẩm</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <PlusIcon className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Đang bán', value: activeCount, color: 'text-green-600' },
          { label: 'Bản nháp', value: draftCount, color: 'text-gray-600' },
          { label: 'Đã bán', value: totalSold, color: 'text-brand-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-earth-100 rounded-2xl p-4">
            <p className="text-sm text-earth-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Product table */}
      <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-earth-400">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-earth-400">
            <p className="mb-2">Chưa có sản phẩm nào</p>
            <button onClick={() => setShowForm(true)}
              className="text-brand-500 font-medium hover:underline text-sm">
              Thêm sản phẩm đầu tiên →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-earth-500 border-b border-earth-100 bg-earth-50/50">
                <th className="text-left py-3 px-4 font-medium">Sản phẩm</th>
                <th className="text-left py-3 px-4 font-medium">Danh mục</th>
                <th className="text-right py-3 px-4 font-medium">Giá</th>
                <th className="text-right py-3 px-4 font-medium">Tồn kho</th>
                <th className="text-right py-3 px-4 font-medium">Đã bán</th>
                <th className="text-center py-3 px-4 font-medium">Trạng thái</th>
                <th className="text-right py-3 px-4 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-earth-50 hover:bg-earth-50/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {p.primary_image ? (
                        <img src={p.primary_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-earth-100 flex items-center justify-center text-earth-400 text-xs">📦</div>
                      )}
                      <div>
                        <div className="font-medium text-earth-900 max-w-[200px] truncate">{p.name}</div>
                        <div className="text-xs text-earth-400">{p.region} · {p.province}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-earth-500">{p.category_name ?? '—'}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatPrice(p.base_price)}</td>
                  <td className="py-3 px-4 text-right">
                    {editStockId === p.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input type="number" min={0} value={editStockVal}
                          onChange={e => setEditStockVal(Number(e.target.value))}
                          className="w-20 text-right border border-brand-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                          autoFocus />
                        <button onClick={() => updateStock({ id: p.id, quantity: editStockVal })}
                          className="p-1 text-green-600 hover:bg-green-50 rounded" title="Lưu">💾</button>
                        <button onClick={() => setEditStockId(null)}
                          className="p-1 text-red-400 hover:bg-red-50 rounded" title="Hủy">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditStockId(p.id); setEditStockVal(p.stock ?? 0); }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-sm transition-colors ${
                          (p.stock ?? 0) <= (p.low_stock_alert ?? 10)
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'text-earth-600 hover:bg-earth-100'
                        }`} title="Nhấn để sửa">
                        <ArchiveBoxIcon className="w-3.5 h-3.5" />
                        {p.stock ?? 0}{p.available !== null ? ` (sẵn ${p.available})` : ''}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">{p.sold_count}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                      p.status === 'active' ? 'bg-green-100 text-green-700'
                      : p.status === 'draft' ? 'bg-gray-100 text-gray-600'
                      : p.status === 'paused' ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => toggleStatus({
                        id: p.id,
                        status: p.status === 'active' ? 'paused' : 'active',
                      })}
                        className="p-1.5 rounded-lg text-earth-400 hover:bg-earth-100 transition-colors"
                        title={p.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}>
                        {p.status === 'active' ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button className="p-1.5 rounded-lg text-earth-400 hover:bg-earth-100 transition-colors" title="Sửa">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create product form (simplified — redirect to /seller/products/new) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-earth-900 mb-4">Thêm sản phẩm mới</h2>
            <p className="text-sm text-earth-500 mb-4">
              Tính năng thêm sản phẩm đang phát triển. Hiện tại, bạn có thể tạo sản phẩm qua trang quản trị.
            </p>
            <div className="flex gap-2">
              <a href="https://admin.foodstudio.vn/products"
                className="flex-1 px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl text-center hover:bg-brand-600">
                Đến Admin
              </a>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-earth-100 text-earth-700 text-sm font-medium rounded-xl hover:bg-earth-200">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}