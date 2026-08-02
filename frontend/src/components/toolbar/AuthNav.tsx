'use client';

import Link from 'next/link';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';

export function AuthNav() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const logout = useLogout();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Đăng nhập
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button variant="default" size="sm">
            Tạo tài khoản
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <div className="text-sm font-semibold text-earth-900">{(user as any)?.full_name ?? user?.fullName ?? user?.email ?? 'Tài khoản'}</div>
        <div className="text-xs text-earth-500 -mt-0.5">Đã đăng nhập</div>
      </div>
      <button
        type="button"
        onClick={() => logout.mutate()}
        className="text-sm font-semibold text-earth-600 hover:text-red-600 transition-colors"
      >
        Đăng xuất
      </button>
    </div>
  );
}
