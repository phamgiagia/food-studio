'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eGiftApi, productApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  EnvelopeIcon, MagnifyingGlassIcon, CheckCircleIcon, GiftIcon,
} from '@heroicons/react/24/outline';

type ProductLite = { id: string; name: string; base_price: number };
type SendResult = { code: string; expiresAt: number };

export default function SendGiftPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ProductLite | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hidePrice, setHidePrice] = useState(true);
  const [result, setResult] = useState<SendResult | null>(null);

  const { data: searchResults } = useQuery({
    queryKey: ['egift-product-search', query],
    queryFn: () => productApi.list({ q: query, limit: 5 }),
    enabled: query.length >= 2,
  });
  const products = ((searchResults as { data?: ProductLite[] } | undefined)?.data ?? []) as ProductLite[];

  const { mutate: send, isPending } = useMutation({
    mutationFn: (payload: unknown) => eGiftApi.send(payload),
    onSuccess: (res) => {
      setResult((res as { data: SendResult }).data);
      toast.success('Đã gửi quà tặng!');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const shareUrl = result && typeof window !== 'undefined'
    ? `${window.location.origin}/gift/redeem/${result.code}`
    : '';

  const handleSubmit = () => {
    if (!selected) { toast.error('Vui lòng chọn sản phẩm quà tặng'); return; }
    if (!recipientEmail && !recipientPhone) { toast.error('Nhập email hoặc số điện thoại người nhận'); return; }
    send({
      productId: selected.id,
      quantity,
      recipientEmail: recipientEmail || undefined,
      recipientPhone: recipientPhone || undefined,
      message: message || undefined,
      hidePrice,
    });
  };

  return (
    <div className="container-wide py-10 max-w-2xl">
      <div className="text-center mb-8">
        <EnvelopeIcon className="w-10 h-10 text-brand-500 mx-auto mb-3" />
        <h1 className="font-display text-3xl font-bold text-earth-900">Gửi Quà Qua Email</h1>
        <p className="text-earth-500 mt-2">
          Chọn quà, thanh toán ngay — người nhận sẽ tự chọn địa chỉ và ngày giao phù hợp với họ.
        </p>
      </div>

      {result ? (
        <div className="bg-white border border-earth-100 rounded-2xl p-8 text-center">
          <CheckCircleIcon className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-earth-900 mb-2">Đã gửi quà thành công!</h2>
          <p className="text-earth-500 mb-4">
            {recipientEmail
              ? `Chúng tôi đã gửi email thông báo đến ${recipientEmail}.`
              : 'Hãy gửi liên kết bên dưới cho người nhận qua tin nhắn.'}
          </p>
          <div className="bg-earth-50 rounded-xl p-3 flex items-center gap-3 max-w-md mx-auto">
            <code className="flex-1 text-sm truncate text-left">{shareUrl}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Đã sao chép!'); }}
              className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600"
            >
              Sao chép
            </button>
          </div>
          <button onClick={() => setResult(null)} className="btn-secondary mt-6">Gửi quà khác</button>
        </div>
      ) : (
        <div className="bg-white border border-earth-100 rounded-2xl p-6 space-y-5">
          {/* Product picker */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Sản phẩm quà tặng</label>
            {selected ? (
              <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                <div>
                  <div className="font-medium text-earth-900">{selected.name}</div>
                  <div className="text-sm text-earth-500">{formatPrice(selected.base_price)}</div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Số lượng</label>
            <input
              type="number" min={1} value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-32 border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Email người nhận</label>
              <input
                type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                placeholder="ban@email.com"
                className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Hoặc số điện thoại</label>
              <input
                type="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              Lời nhắn <span className="text-earth-400 font-normal">({message.length}/500)</span>
            </label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Chúc mừng bạn! Đây là món quà đặc biệt..."
              className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={hidePrice} onChange={e => setHidePrice(e.target.checked)}
              className="rounded border-earth-300 text-brand-500"
            />
            <span className="text-sm text-earth-700">Ẩn giá tiền trên hóa đơn</span>
          </label>

          {selected && (
            <div className="pt-4 border-t border-earth-100 flex items-center justify-between">
              <div className="text-sm text-earth-600">
                Tổng: <span className="font-bold text-earth-900">{formatPrice(selected.base_price * quantity)}</span>
              </div>
              <button onClick={handleSubmit} disabled={isPending} className="btn-primary disabled:opacity-60 gap-2">
                <GiftIcon className="w-4 h-4" />
                {isPending ? 'Đang gửi...' : 'Gửi Quà Ngay'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
