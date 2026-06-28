import Link from 'next/link';
import { UserIcon, ShoppingBagIcon, MapPinIcon, HeartIcon, StarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const accountNav = [
  { href: '/account', label: 'Hồ Sơ', icon: UserIcon },
  { href: '/account/orders', label: 'Đơn Hàng', icon: ShoppingBagIcon },
  { href: '/account/addresses', label: 'Địa Chỉ', icon: MapPinIcon },
  { href: '/account/wishlist', label: 'Yêu Thích', icon: HeartIcon },
  { href: '/account/loyalty', label: 'Điểm Thưởng', icon: StarIcon },
  { href: '/account/settings', label: 'Cài Đặt', icon: Cog6ToothIcon },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-wide py-10">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-br from-brand-50 to-earth-50 border-b border-earth-100">
              <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl mb-2">
                A
              </div>
              <div className="font-semibold text-earth-900">Tài khoản của tôi</div>
            </div>
            <nav className="p-2">
              {accountNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-earth-600 hover:bg-earth-50 hover:text-earth-900 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
