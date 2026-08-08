'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { PROVINCES } from '@food-studio/utils';
import { eGiftApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { GiftIcon, LockClosedIcon } from '@heroicons/react/24/outline';

type GiftPreview = {
  valid: boolean;
  status?: string;
  productName?: string;
  quantity?: number;
  senderName?: string;
  message?: string | null;
  hidePrice?: boolean;
};

const inputCls = 'w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400';

export default function RedeemGiftPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['egift-validate', code],
    queryFn: () => eGiftApi.validate(code),
  });
  const gift = (data as { data: GiftPreview } | undefined)?.data;

  const { mutate: redeem, isPending } = useMutation({
    mutationFn: (payload: unknown) => eGiftApi.redeem(code, payload),
    onSuccess: (res) => {
      const { orderId } = (res as { data: { orderId: string } }).data;
      toast.success('Đã nhận quà! Đơn hàng đang được xử lý.');
      router.push(`/orders/${orderId}`);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const handleSubmit = () => {
    if (!name || !phone || !line1 || !district || !province) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    redeem({
      recipientName: name,
      phone,
      line1,
      district,
      province,
      ...(scheduledDate && { scheduledDate: Math.floor(new Date(scheduledDate).getTime() / 1000) }),
    });
  };

  if (isLoading) {
    return <div className="container-wide py-16 text-center text-earth-400">Đang tải quà tặng...</div>;
  }

  if (!gift?.valid) {
    return (
      <div className="container-wide py-16 text-center max-w-md mx-auto">
        <GiftIcon className="w-14 h-14 text-earth-300 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-2">Liên kết không hợp lệ</h1>
        <p className="text-earth-500">
          {gift?.status === 'redeemed' ? 'Quà tặng này đã được nhận trước đó.'
            : gift?.status === 'expired' ? 'Quà tặng này đã hết hạn.'
            : 'Không tìm thấy quà tặng với mã này.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container-wide py-10 max-w-lg">
      <div className="text-center mb-8">
        <GiftIcon className="w-10 h-10 text-brand-500 mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold text-earth-900">Bạn Có Một Món Quà!</h1>
        <p className="text-earth-500 mt-2">
          <strong>{gift.senderName}</strong> đã gửi tặng bạn <strong>{gift.productName}</strong>
          {gift.quantity && gift.quantity > 1 ? ` ×${gift.quantity}` : ''}
        </p>
        {gift.message && (
          <p className="mt-3 italic text-earth-600 bg-earth-50 rounded-xl px-4 py-3">&ldquo;{gift.message}&rdquo;</p>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="bg-white border border-earth-100 rounded-2xl p-6 text-center">
          <LockClosedIcon className="w-8 h-8 text-earth-400 mx-auto mb-3" />
          <p className="text-earth-600 mb-4">Đăng nhập hoặc tạo tài khoản để chọn địa chỉ và nhận quà.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/login" className="btn-primary">Đăng Nhập</Link>
            <Link href="/auth/register" className="btn-secondary">Tạo Tài Khoản</Link>
          </div>
          <p className="text-earth-400 text-xs mt-4">Sau khi đăng nhập, quay lại đường link này để tiếp tục nhận quà.</p>
        </div>
      ) : (
        <div className="bg-white border border-earth-100 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-earth-900">Địa Chỉ Nhận Quà</h2>
          <div className="grid grid-cols-2 gap-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Họ và tên *" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại *" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <select value={province} onChange={e => setProvince(e.target.value)} className={`col-span-2 sm:col-span-1 ${inputCls}`}>
              <option value="">Chọn tỉnh thành *</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Quận/Huyện *" className={`col-span-2 sm:col-span-1 ${inputCls}`} />
            <input value={line1} onChange={e => setLine1(e.target.value)} placeholder="Số nhà, tên đường *" className={`col-span-2 ${inputCls}`} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Ngày giao mong muốn (tuỳ chọn)</label>
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isPending} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {isPending ? 'Đang xử lý...' : 'Nhận Quà'}
          </button>
        </div>
      )}
    </div>
  );
}
