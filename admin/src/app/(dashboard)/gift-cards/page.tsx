'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/outline';

type GiftCardTemplate = {
  id: string; name: string; slug: string; description: string | null;
  denominations_json: string | null; min_amount: number; max_amount: number;
  message_label: string | null; active: boolean;
};

type GiftCard = {
  id: string; code: string; buyer_name: string; template_name: string | null;
  recipient_name: string; amount: number; balance: number; status: string;
  expires_at: number | null; created_at: number;
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Còn hiệu lực',
  partially_used: 'Đã dùng một phần',
  exhausted: 'Đã hết',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'green', partially_used: 'yellow', exhausted: 'gray', expired: 'red', cancelled: 'red',
};

export default function AdminGiftCardsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showIssue, setShowIssue] = useState(false);
  const qc = useQueryClient();

  // Issue form state
  const [form, setForm] = useState({
    recipientName: '', recipientEmail: '', amount: 100000,
    message: '', templateId: '',
  });

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['giftcard-templates'],
    queryFn: () => api.get<{ data: GiftCardTemplate[] }>('/v1/gift-cards/templates'),
  });
  const templates = (templatesData as unknown as { data: GiftCardTemplate[] })?.data ?? [];

  // Fetch gift cards
  const { data: gcData, isLoading } = useQuery({
    queryKey: ['admin-gift-cards', statusFilter, page],
    queryFn: () => {
      const q = new URLSearchParams({ page: String(page) });
      if (statusFilter) q.set('status', statusFilter);
      return api.get<{ results: GiftCard[]; pagination: { total: number } }>(`/admin/gift-cards?${q}`);
    },
  });

  const raw = gcData as unknown as { results: GiftCard[]; pagination: { total: number } };
  const cards = raw?.results ?? [];
  const total = raw?.pagination?.total ?? 0;

  // Issue gift card mutation
  const { mutate: issueCard, isPending } = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/v1/gift-cards/buy', {
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail || undefined,
        amount: data.amount,
        message: data.message || undefined,
        templateId: data.templateId || undefined,
      }),
    onSuccess: (res) => {
      const resp = res as unknown as { data: { code: string; amount: number } };
      toast.success(`Đã tạo gift card! Mã: ${resp.data.code}`);
      qc.invalidateQueries({ queryKey: ['admin-gift-cards'] });
      setShowIssue(false);
      setForm({ recipientName: '', recipientEmail: '', amount: 100000, message: '', templateId: '' });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quà tặng (Gift Card)</h1>
          <p className="text-gray-500 text-sm">{total} thẻ quà tặng</p>
        </div>
        <button onClick={() => setShowIssue(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <PlusIcon className="w-4 h-4" />
          Tạo Gift Card
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'active', 'partially_used', 'exhausted', 'expired', 'cancelled'].map(s => (
          <button key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === '' ? 'Tất cả' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Đang hiệu lực', value: cards.filter(c => c.status === 'active' || c.status === 'partially_used').length },
          { label: 'Đã hết/dùng', value: cards.filter(c => c.status === 'exhausted').length },
          { label: 'Tổng giá trị', value: formatPrice(cards.reduce((s, c) => s + c.amount, 0)) },
          { label: 'Dư dùng được', value: formatPrice(cards.reduce((s, c) => s + c.balance, 0)) },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : cards.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Chưa có thẻ quà tặng nào</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã quà tặng</th>
                <th>Người mua</th>
                <th>Người nhận</th>
                <th>Mệnh giá</th>
                <th>Còn lại</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id}>
                  <td>
                    <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-sm">{card.code}</span>
                    {card.template_name && <div className="text-xs text-gray-400 mt-0.5">{card.template_name}</div>}
                  </td>
                  <td className="text-sm font-medium">{card.buyer_name}</td>
                  <td className="text-sm text-gray-600">{card.recipient_name}</td>
                  <td className="font-semibold text-sm">{formatPrice(card.amount)}</td>
                  <td className="text-sm">
                    <span className={`font-semibold ${card.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>{formatPrice(card.balance)}</span>
                  </td>
                  <td className="text-sm text-gray-500">{card.expires_at ? formatDate(card.expires_at) : '—'}</td>
                  <td>
                    <span className={`badge-${STATUS_COLORS[card.status] ?? 'default'}`}>{STATUS_LABELS[card.status] ?? card.status}</span>
                  </td>
                </tr>
              ))}
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

      {/* Issue Gift Card Modal */}
      {showIssue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowIssue(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tạo Gift Card</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận *</label>
                <input value={form.recipientName}
                  onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Tên người nhận" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email người nhận</label>
                <input value={form.recipientEmail}
                  onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="email@example.com (để gửi thông báo)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mệnh giá *</label>
                <input type="number" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  min={50000} step={50000} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lời chúc</label>
                <textarea value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Lời chúc kèm theo..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu thiệp</label>
                <select value={form.templateId}
                  onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="">Không chọn mẫu</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowIssue(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl">
                Hủy
              </button>
              <button onClick={() => issueCard(form)}
                disabled={isPending || !form.recipientName || form.amount < 50000}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:opacity-40">
                {isPending ? 'Đang tạo...' : `Tạo ${formatPrice(form.amount)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}