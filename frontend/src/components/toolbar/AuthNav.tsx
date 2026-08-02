'use client';

import Link from 'next/link';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';

export function AuthNav() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const logout = useLogout();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-earth-700 hover:text-earth-900"
        >
          Đăng nhập
        </Link>
        <Link
          href="/auth/register"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Tạo tài khoản
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block">
        <div className="text-sm font-semibold text-earth-900">{(user as any)?.full_name ?? user?.fullName ?? user?.email ?? 'Tài khoản'}</div>
        <div className="text-xs text-earth-500 -mt-0.5">Đã đăng nhập</div>
      </div>
      <button
        type="button"
        onClick={() => logout.mutate()}
        className="text-sm font-semibold text-earth-700 hover:text-earth-900"
      >
        Đăng xuất
      </button>
    </div>
  );
}
