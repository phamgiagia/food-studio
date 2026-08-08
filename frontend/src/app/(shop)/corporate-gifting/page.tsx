'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { corporateOrderApi, productApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BuildingOffice2Icon, MagnifyingGlassIcon, PlusIcon, TrashIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

type ProductLite = { id: string; name: string; base_price: number; store_name?: string };

type Recipient = {
  name: string; phone: string; line1: string; ward: string; district: string; province: string;
  scheduledDate: string; giftMessage: string;
};

const emptyRecipient: Recipient = {
  name: '', phone: '', line1: '', ward: '', district: '', province: '', scheduledDate: '', giftMessage: '',
};

type CreateResult = { corporateOrderId: string; recipientCount: number; total: number; paymentMethod: string };
type CorpOrderRow = { id: string; product_name: string; recipient_count: number; total: number; status: string; created_at: number };

export default function CorporateGiftingPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ProductLite | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [quantityPerRecipient, setQuantityPerRecipient] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [note, setNote] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ ...emptyRecipient }, { ...emptyRecipient }]);
  const [result, setResult] = useState<CreateResult | null>(null);

  const { data: searchResults } = useQuery({
    queryKey: ['corp-product-search', query],
    queryFn: () => productApi.list({ q: query, limit: 5 }),
    enabled: query.length >= 2,
  });
  const products = ((searchResults as { data?: ProductLite[] } | undefined)?.data ?? []) as ProductLite[];

  const { data: mine } = useQuery({
    queryKey: ['corporate-orders-mine'],
    queryFn: () => corporateOrderApi.mine(),
  });
  const myOrders = ((mine as { data?: CorpOrderRow[] } | undefined)?.data ?? []) as CorpOrderRow[];

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (payload: unknown) => corporateOrderApi.create(payload),
    onSuccess: (res) => {
      setResult((res as { data: CreateResult }).data);
      qc.invalidateQueries({ queryKey: ['corporate-orders-mine'] });
      toast.success('Đã tạo đơn quà tặng doanh nghiệp!');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const addRecipient = () => setRecipients(r => [...r, { ...emptyRecipient }]);
  const removeRecipient = (idx: number) => setRecipients(r => r.filter((_, i) => i !== idx));
  const updateRecipient = (idx: number, field: keyof Recipient, value: string) =>
    setRecipients(r => r.map((rec, i) => (i === idx ? { ...rec, [field]: value } : rec)));

  const totalEstimate = selected ? (selected.base_price * quantityPerRecipient + 30000) * recipients.length : 0;

  const handleSubmit = () => {
    if (!selected) { toast.error('Vui lòng chọn sản phẩm quà tặng'); return; }
    if (recipients.length < 2) { toast.error('Cần ít nhất 2 người nhận'); return; }
    const incomplete = recipients.some(r => !r.name || !r.phone || !r.line1 || !r.district || !r.province);
    if (incomplete) { toast.error('Vui lòng điền đầy đủ tên, SĐT, địa chỉ cho mọi người nhận'); return; }

    submit({
      companyName: companyName || undefined,
      productId: selected.id,
      quantityPerRecipient,
      paymentMethod,
      note: note || undefined,
      recipients: recipients.map(r => ({
        name: r.name,
        phone: r.phone,
        line1: r.line1,
        ward: r.ward || undefined,
        district: r.district,
        province: r.province,
        scheduledDate: r.scheduledDate ? Math.floor(new Date(r.scheduledDate).getTime() / 1000) : undefined,
        giftMessage: r.giftMessage || undefined,
      })),
    });
  };

  return (
    <div className="container-wide py-10 max-w-4xl">
      <div className="text-center mb-8">
        <BuildingOffice2Icon className="w-10 h-10 text-brand-500 mx-auto mb-3" />
        <h1 className="font-display text-3xl font-bold text-earth-900">Quà Tặng Doanh Nghiệp</h1>
        <p className="text-earth-500 mt-2 max-w-xl mx-auto">
          Gửi cùng một món quà đặc sản đến nhiều đồng nghiệp, đối tác — mỗi người một địa chỉ, một ngày giao, một lời nhắn riêng.
        </p>
      </div>

      {result ? (
        <div className="bg-white border border-earth-100 rounded-2xl p-8 text-center">
          <CheckCircleIcon className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-earth-900 mb-2">Đã tạo đơn hàng doanh nghiệp</h2>
          <p className="text-earth-500 mb-4">
            Mã đơn <span className="font-mono font-semibold">{result.corporateOrderId.slice(0, 8)}</span> ·{' '}
            {result.recipientCount} người nhận · Tổng {formatPrice(result.total)}
          </p>
          <div className="bg-earth-50 rounded-xl p-4 text-sm text-earth-600 max-w-md mx-auto">
            {result.paymentMethod === 'bank_transfer'
              ? 'Đội ngũ Food Studio sẽ liên hệ để gửi thông tin chuyển khoản và xác nhận đơn trong 24h.'
              : 'Đơn sẽ được xác nhận và giao hàng thu tiền (COD) đến từng người nhận.'}
          </div>
          <button onClick={() => setResult(null)} className="btn-primary mt-6">Tạo đơn khác</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Product picker */}
          <div className="bg-white border border-earth-100 rounded-2xl p-6">
            <h2 className="font-semibold text-earth-900 mb-4">1. Chọn sản phẩm quà tặng</h2>
            {selected ? (
              <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                <div>
                  <div className="font-medium text-earth-900">{selected.name}</div>
                  <div className="text-sm text-earth-500">{formatPrice(selected.base_price)} / phần</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-sm text-brand-600 hover:underline">Đổi</button>
              </div>
            ) : (
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                {products.length > 0 && (
                  <div className="mt-2 border border-earth-100 rounded-xl divide-y divide-earth-50 overflow-hidden">
                    {products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelected(p); setQuery(''); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-earth-50 flex items-center justify-between text-sm"
                      >
                        <span className="text-earth-800">{p.name}</span>
                        <span className="text-earth-500">{formatPrice(p.base_price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Số lượng / người nhận</label>
                <input
                  type="number" min={1} value={quantityPerRecipient}
                  onChange={e => setQuantityPerRecipient(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Tên công ty (tuỳ chọn)</label>
                <input
                  value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white border border-earth-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-earth-900">2. Danh sách người nhận ({recipients.length})</h2>
              <button onClick={addRecipient} className="flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700">
                <PlusIcon className="w-4 h-4" /> Thêm người nhận
              </button>
            </div>

            <div className="space-y-4">
              {recipients.map((r, idx) => (
                <div key={idx} className="border border-earth-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-earth-700">Người nhận #{idx + 1}</span>
                    {recipients.length > 2 && (
                      <button onClick={() => removeRecipient(idx)} className="text-earth-400 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Họ tên *" value={r.name} onChange={e => updateRecipient(idx, 'name', e.target.value)}
                      className="border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input placeholder="Số điện thoại *" value={r.phone} onChange={e => updateRecipient(idx, 'phone', e.target.value)}
                      className="border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input placeholder="Địa chỉ (số nhà, đường) *" value={r.line1} onChange={e => updateRecipient(idx, 'line1', e.target.value)}
                      className="col-span-2 border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input placeholder="Phường/Xã" value={r.ward} onChange={e => updateRecipient(idx, 'ward', e.target.value)}
                      className="border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input placeholder="Quận/Huyện *" value={r.district} onChange={e => updateRecipient(idx, 'district', e.target.value)}
                      className="border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input placeholder="Tỉnh/Thành phố *" value={r.province} onChange={e => updateRecipient(idx, 'province', e.target.value)}
                      className="border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input type="date" value={r.scheduledDate} onChange={e => updateRecipient(idx, 'scheduledDate', e.target.value)}
                      className="border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input placeholder="Lời nhắn tặng quà (tuỳ chọn)" value={r.giftMessage} onChange={e => updateRecipient(idx, 'giftMessage', e.target.value)}
                      className="col-span-2 border border-earth-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment + submit */}
          <div className="bg-white border border-earth-100 rounded-2xl p-6">
            <h2 className="font-semibold text-earth-900 mb-4">3. Thanh toán</h2>
            <div className="flex gap-3 mb-4">
              {([
                { key: 'bank_transfer', label: 'Chuyển khoản (công ty)' },
                { key: 'cod', label: 'Thu tiền khi giao (COD)' },
              ] as const).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPaymentMethod(opt.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    paymentMethod === opt.key
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-earth-600 border-earth-200 hover:border-brand-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Ghi chú thêm cho đơn hàng (tuỳ chọn)"
              value={note} onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-4"
            />

            <div className="flex items-center justify-between pt-4 border-t border-earth-100">
              <div className="text-sm text-earth-600">
                Tạm tính: <span className="font-bold text-earth-900">{selected ? formatPrice(totalEstimate) : '—'}</span>
                <span className="text-earth-400"> ({recipients.length} người nhận)</span>
              </div>
              <button onClick={handleSubmit} disabled={isPending} className="btn-primary disabled:opacity-60">
                {isPending ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order history */}
      {myOrders.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-earth-900 mb-4">Đơn hàng doanh nghiệp của bạn</h2>
          <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden divide-y divide-earth-50">
            {myOrders.map(o => (
              <div key={o.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-earth-800">{o.product_name} · {o.recipient_count} người nhận</div>
                  <div className="text-xs text-earth-400">{formatDate(o.created_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-earth-800">{formatPrice(o.total)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    o.status === 'confirmed' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                  }`}>
                    {o.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ thanh toán'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
