'use client';

import Link from 'next/link';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart';

export function Header() {
  const totalItems = useCartStore(s => s.totalItems());

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-earth-100">
      <div className="container-wide">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="font-display text-xl font-bold text-earth-900 shrink-0">
            Food Studio
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-earth-600 hover:text-earth-900 font-medium text-sm transition-colors">
              Sản Phẩm
            </Link>
            <Link href="/collections" className="text-earth-600 hover:text-earth-900 font-medium text-sm transition-colors">
              Bộ Sưu Tập
            </Link>
            <Link href="/sellers" className="text-earth-600 hover:text-earth-900 font-medium text-sm transition-colors">
              Nhà Bán Hàng
            </Link>
            <Link href="/blog" className="text-earth-600 hover:text-earth-900 font-medium text-sm transition-colors">
              Blog
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden lg:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input
                type="search"
                placeholder="Tìm đặc sản..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-earth-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-earth-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="lg:hidden p-2 rounded-xl hover:bg-earth-100 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5 text-earth-700" />
            </Link>
            <Link href="/account" className="p-2 rounded-xl hover:bg-earth-100 transition-colors">
              <UserIcon className="w-5 h-5 text-earth-700" />
            </Link>
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-earth-100 transition-colors">
              <ShoppingCartIcon className="w-5 h-5 text-earth-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 rounded-xl hover:bg-earth-100 transition-colors">
              <Bars3Icon className="w-5 h-5 text-earth-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
