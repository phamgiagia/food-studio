import { StarIcon, GiftIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

const mockAccount = { points: 1250, tier: 'silver' as const };
const mockTransactions = [
  { id: 't1', type: 'earn', points: 200, note: 'Đơn hàng #ABC12345', createdAt: Math.floor(Date.now() / 1000) - 86400 },
  { id: 't2', type: 'earn', points: 500, note: 'Đơn hàng #DEF67890', createdAt: Math.floor(Date.now() / 1000) - 172800 },
  { id: 't3', type: 'redeem', points: -300, note: 'Đổi điểm giảm giá 30.000đ', createdAt: Math.floor(Date.now() / 1000) - 259200 },
];

const tiers = [
  { key: 'bronze', label: 'Đồng', min: 0, max: 1000, color: 'text-orange-600 bg-orange-50' },
  { key: 'silver', label: 'Bạc', min: 1000, max: 5000, color: 'text-gray-600 bg-gray-100' },
  { key: 'gold', label: 'Vàng', min: 5000, max: 15000, color: 'text-amber-600 bg-amber-50' },
  { key: 'platinum', label: 'Bạch Kim', min: 15000, max: Infinity, color: 'text-purple-600 bg-purple-50' },
];

export default function LoyaltyPage() {
  const currentTier = tiers.find(t => t.key === mockAccount.tier)!;
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressPct = nextTier
    ? Math.min(100, ((mockAccount.points - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Điểm Thưởng</h1>

      {/* Points card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <StarIcon className="w-5 h-5" />
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${currentTier.color}`}>
            Hạng {currentTier.label}
          </span>
        </div>
        <div className="text-4xl font-bold mb-1">{mockAccount.points.toLocaleString()}</div>
        <div className="text-brand-200 text-sm">điểm tích lũy</div>

        {nextTier && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-brand-200 mb-1.5">
              <span>{mockAccount.points.toLocaleString()} điểm</span>
              <span>{nextTier.min.toLocaleString()} điểm để lên hạng {nextTier.label}</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: StarIcon, label: '1 điểm / 1.000đ', desc: 'Mỗi đơn hàng' },
          { icon: GiftIcon, label: '100đ / 1 điểm', desc: 'Khi đổi điểm' },
          { icon: ArrowTrendingUpIcon, label: 'Ưu đãi đặc biệt', desc: 'Hạng Vàng trở lên' },
        ].map(b => (
          <div key={b.label} className="bg-white border border-earth-100 rounded-2xl p-4 text-center">
            <b.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <div className="font-semibold text-earth-800 text-sm">{b.label}</div>
            <div className="text-earth-400 text-xs">{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-earth-100">
          <h2 className="font-semibold text-earth-900">Lịch Sử Giao Dịch</h2>
        </div>
        <div className="divide-y divide-earth-50">
          {mockTransactions.map(tx => (
            <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-earth-800">{tx.note}</div>
                <div className="text-xs text-earth-400">{formatDate(tx.createdAt)}</div>
              </div>
              <span className={`font-bold text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                {tx.type === 'earn' ? '+' : ''}{tx.points.toLocaleString()} điểm
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
