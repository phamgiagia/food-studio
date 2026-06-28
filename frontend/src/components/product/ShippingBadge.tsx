import Link from 'next/link';

const BADGES = [
  { icon: '🧊', label: 'Đóng gói bảo quản' },
  { icon: '✈️', label: 'Giao toàn quốc' },
  { icon: '↩️', label: 'Hoàn tiền nếu hỏng' },
];

export function ShippingBadge() {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {BADGES.map(b => (
        <div key={b.label} className="flex items-center gap-1.5 bg-earth-50 border border-earth-100 rounded-lg px-3 py-1.5 text-xs text-earth-600 font-medium">
          <span>{b.icon}</span>
          {b.label}
        </div>
      ))}
      <Link href="/shipping" className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline px-1 py-1.5">
        Xem chính sách vận chuyển →
      </Link>
    </div>
  );
}
