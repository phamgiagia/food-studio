'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  StarIcon as StarSolid, GiftIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

type LoyaltyData = {
  account: { points: number; tier: string; tierLabel: string; earnRate: number; redeemRate: number };
  nextTier: { key: string; label: string; pointsNeeded: number } | null;
  transactions: Array<{ id: string; type: string; points: number; balance: number; note: string; created_at: number }>;
  rewards: Array<{ id: string; name: string; description: string | null; points_required: number; type: string; stock: number | null }>;
  tiers: Array<{ key: string; label: string; min: number }>;
};

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-orange-600 bg-orange-50',
  silver: 'text-gray-600 bg-gray-100',
  gold: 'text-amber-600 bg-amber-50',
  platinum: 'text-purple-600 bg-purple-50',
};

export default function LoyaltyPage() {
  const [tab, setTab] = useState<'points' | 'rewards'>('points');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-account'],
    queryFn: () => api.get<{ data: LoyaltyData }>('/v1/loyalty/account'),
  });

  const { mutate: redeem } = useMutation({
    mutationFn: (rewardId: string) => api.post('/v1/loyalty/redeem', { rewardId }),
    onSuccess: () => {
      toast.success('Đổi thưởng thành công!');
      qc.invalidateQueries({ queryKey: ['loyalty-account'] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Điểm Thưởng</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-earth-100 rounded-2xl" />
          <div className="h-32 bg-earth-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const raw = data as { data: LoyaltyData } | undefined;
  const ld: LoyaltyData | undefined = raw?.data;
  if (!ld) {
    return (
      <div className="text-center py-10">
        <p className="text-earth-500">Không thể tải thông tin điểm thưởng</p>
      </div>
    );
  }

  const { account, nextTier, transactions, rewards } = ld;
  const currentTier = ld.tiers.find(t => t.key === account.tier)!;

  const progressPct = nextTier
    ? Math.min(100, ((account.points - currentTier.min) / nextTier.pointsNeeded) * 100)
    : 100;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Điểm Thưởng</h1>

      {/* Points card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <StarSolid className="w-5 h-5" />
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_COLORS[account.tier] ?? 'text-gray-600 bg-gray-100'}`}>
            Hạng {account.tierLabel}
          </span>
        </div>
        <div className="text-4xl font-bold mb-1">{account.points.toLocaleString()}</div>
        <div className="text-brand-200 text-sm">điểm tích lũy</div>
        <div className="text-brand-200 text-xs mt-1">
          Tích {account.earnRate}x điểm mỗi đơn · Đổi {account.redeemRate}đ/điểm
        </div>

        {nextTier && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-brand-200 mb-1.5">
              <span>{account.points.toLocaleString()} điểm</span>
              <span>{nextTier.pointsNeeded.toLocaleString()} điểm để lên hạng {nextTier.label}</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${Math.max(progressPct, 2)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['points', 'rewards'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}>
            {t === 'points' ? 'Lịch sử' : 'Đổi thưởng'}
          </button>
        ))}
      </div>

      {/* Points History */}
      {tab === 'points' && (
        <>
          {/* Benefits grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: StarSolid, label: `${account.earnRate}x điểm`, desc: 'Mỗi đơn hàng' },
              { icon: GiftIcon, label: `${formatPrice(account.redeemRate)} / 1 điểm`, desc: 'Khi đổi điểm' },
              { icon: ArrowTrendingUpIcon, label: 'Ưu đãi đặc biệt', desc: 'Hạng Vàng trở lên' },
            ].map(b => (
              <div key={b.label} className="bg-white border border-earth-100 rounded-2xl p-4 text-center">
                <b.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                <div className="font-semibold text-earth-800 text-sm">{b.label}</div>
                <div className="text-earth-400 text-xs">{b.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-earth-100">
              <h2 className="font-semibold text-earth-900">Lịch Sử Giao Dịch</h2>
            </div>
            {transactions.length === 0 ? (
              <div className="px-5 py-10 text-center text-earth-400 text-sm">Chưa có giao dịch nào</div>
            ) : (
              <div className="divide-y divide-earth-50">
                {transactions.map(tx => (
                  <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-earth-800">{tx.note}</div>
                      <div className="text-xs text-earth-400">{formatDate(tx.created_at)}</div>
                    </div>
                    <span className={`font-bold text-sm ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()} điểm
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Rewards */}
      {tab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.length === 0 ? (
            <div className="col-span-2 bg-white border border-earth-100 rounded-2xl p-10 text-center">
              <p className="text-earth-500">Chưa có phần thưởng nào</p>
            </div>
          ) : (
            rewards.map(r => {
              const canAfford = account.points >= r.points_required;
              const isOutOfStock = r.stock !== null && r.stock <= 0;
              return (
                <div key={r.id} className="bg-white border border-earth-100 rounded-2xl p-5 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-semibold text-earth-900">{r.name}</h3>
                    {r.description && (
                      <p className="text-sm text-earth-500 mt-1">{r.description}</p>
                    )}
                    {r.stock !== null && (
                      <p className="text-xs text-earth-400 mt-1">Còn {r.stock} phần</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-earth-50">
                    <span className="font-bold text-brand-600">{r.points_required.toLocaleString()} điểm</span>
                    <button
                      onClick={() => redeem(r.id)}
                      disabled={!canAfford || isOutOfStock}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        canAfford && !isOutOfStock
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : 'bg-earth-100 text-earth-400 cursor-not-allowed'
                      }`}
                    >
                      {isOutOfStock ? 'Hết' : canAfford ? 'Đổi ngay' : 'Thiếu điểm'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}