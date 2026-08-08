'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { referralApi } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { GiftIcon, UsersIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

type ReferralData = {
  code: string;
  rewardAmount: number;
  stats: { totalReferred: number; totalRewarded: number; totalEarned: number };
  referrals: Array<{ referredName: string; status: 'pending' | 'rewarded'; createdAt: number; rewardedAt: number | null }>;
};

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['referrals-me'],
    queryFn: () => referralApi.me(),
  });

  const rd = (data as { data: ReferralData } | undefined)?.data;

  const shareUrl = rd && typeof window !== 'undefined'
    ? `${window.location.origin}/auth/register?ref=${rd.code}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Đã sao chép liên kết giới thiệu!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Giới Thiệu Bạn Bè</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-earth-100 rounded-2xl" />
          <div className="h-32 bg-earth-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!rd) {
    return (
      <div className="text-center py-10">
        <p className="text-earth-500">Không thể tải thông tin giới thiệu</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Giới Thiệu Bạn Bè</h1>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <GiftIcon className="w-5 h-5" />
          <span className="text-sm font-medium text-brand-100">Tặng bạn bè, nhận về cho mình</span>
        </div>
        <h2 className="text-xl font-bold mb-1">
          Tặng {formatPrice(rd.rewardAmount)}, nhận {formatPrice(rd.rewardAmount)}
        </h2>
        <p className="text-brand-200 text-sm mb-5">
          Chia sẻ liên kết dưới đây. Khi bạn bè hoàn tất đơn hàng đầu tiên, cả hai đều nhận ngay mã giảm {formatPrice(rd.rewardAmount)}.
        </p>

        <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
          <code className="flex-1 text-sm truncate">{shareUrl}</code>
          <button
            onClick={copyLink}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-white text-brand-700 hover:bg-brand-50 transition-colors"
          >
            {copied ? 'Đã chép!' : 'Sao chép'}
          </button>
        </div>
        <div className="text-brand-200 text-xs mt-2">
          Mã của bạn: <span className="font-mono font-semibold">{rd.code}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: UsersIcon, label: rd.stats.totalReferred, desc: 'Đã giới thiệu' },
          { icon: CheckCircleIcon, label: rd.stats.totalRewarded, desc: 'Đã nhận thưởng' },
          { icon: GiftIcon, label: formatPrice(rd.stats.totalEarned), desc: 'Tổng đã nhận' },
        ].map(s => (
          <div key={s.desc} className="bg-white border border-earth-100 rounded-2xl p-4 text-center">
            <s.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <div className="font-semibold text-earth-800 text-sm">{s.label}</div>
            <div className="text-earth-400 text-xs">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Referral list */}
      <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-earth-100">
          <h2 className="font-semibold text-earth-900">Bạn Bè Đã Giới Thiệu</h2>
        </div>
        {rd.referrals.length === 0 ? (
          <div className="px-5 py-10 text-center text-earth-400 text-sm">
            Chưa có ai đăng ký qua liên kết của bạn
          </div>
        ) : (
          <div className="divide-y divide-earth-50">
            {rd.referrals.map((r, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-earth-800">{r.referredName}</div>
                  <div className="text-xs text-earth-400">Đăng ký {formatDate(r.createdAt)}</div>
                </div>
                {r.status === 'rewarded' ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Đã thưởng
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-earth-500 bg-earth-100 px-2.5 py-1 rounded-full">
                    <ClockIcon className="w-3.5 h-3.5" /> Chờ đơn đầu tiên
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
