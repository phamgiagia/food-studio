'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon, ShoppingBagIcon, UserGroupIcon, TruckIcon,
  TagIcon, ChartBarIcon, ShieldCheckIcon, DocumentTextIcon,
  CogIcon, ArchiveBoxIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Tổng quan', href: '/', icon: HomeIcon },
  { label: 'Đơn hàng', href: '/orders', icon: ShoppingBagIcon },
  { label: 'Sản phẩm', href: '/products', icon: ArchiveBoxIcon },
  { label: 'Nhà bán hàng', href: '/sellers', icon: UserGroupIcon },
  { label: 'Khách hàng', href: '/customers', icon: UserGroupIcon },
  { label: 'Vận chuyển', href: '/shipping', icon: TruckIcon },
  { label: 'Khuyến mãi', href: '/promotions', icon: TagIcon },
  { label: 'Tài chính', href: '/finance', icon: BanknotesIcon },
  { label: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { label: 'Chống gian lận', href: '/fraud', icon: ShieldCheckIcon },
  { label: 'CMS', href: '/cms', icon: DocumentTextIcon },
  { label: 'Cài đặt', href: '/settings', icon: CogIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r flex flex-col h-full">
      <div className="px-5 py-4 border-b">
        <div className="font-bold text-base text-gray-900">Food Studio</div>
        <div className="text-xs text-gray-400 mt-0.5">Admin Portal</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                active
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">A</div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Admin</div>
            <div className="text-xs text-gray-400">super_admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
