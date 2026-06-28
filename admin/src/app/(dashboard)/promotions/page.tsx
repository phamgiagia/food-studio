'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { PlusIcon } from '@heroicons/react/24/outline';

type Coupon = {
  id: string; code: string; discount_type: 'percent' | 'fixed';
  discount_value: number; min_order_amount: number;
  uses_count: number; max_uses: number;
  expires_at: number; is_active: boolean;
};

export default function AdminPromotionsPage() {
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get<{ coupons: Coupon[] }>('/admin/coupons'),
  });

  const coupons = data?.coupons ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Khuyến mãi</h1>
          <p className="text-gray-500 text-sm">Quản lý mã giảm giá và chương trình khuyến mãi</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Tạo mã giảm giá
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Mã đang hoạt động', value: coupons.filter(c => c.is_active).length },
          { label: 'Tổng lượt dùng', value: coupons.reduce((s, c) => s + c.uses_count, 0) },
          { label: 'Mã hết hạn', value: coupons.filter(c => !c.is_active).length },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
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
                <th>Mã code</th>
                <th>Loại giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Đã dùng</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td>
                    <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-sm">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="font-semibold">
                    {coupon.discount_type === 'percent'
                      ? `${coupon.discount_value}%`
                      : formatPrice(coupon.discount_value)}
                  </td>
                  <td className="text-sm">{formatPrice(coupon.min_order_amount)}</td>
                  <td className="text-sm">
                    {coupon.uses_count}/{coupon.max_uses === 0 ? '∞' : coupon.max_uses}
                  </td>
                  <td className="text-sm text-gray-500">{formatDate(coupon.expires_at)}</td>
                  <td>
                    <span className={coupon.is_active ? 'badge-success' : 'badge-danger'}>
                      {coupon.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Chưa có mã giảm giá nào</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
