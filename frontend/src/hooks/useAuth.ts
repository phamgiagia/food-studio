'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

export function useAuthUser() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: async (res) => {
      const { accessToken, refreshToken } = res.data as { accessToken: string; refreshToken: string };
      localStorage.setItem('access_token', accessToken);
      const meRes = await authApi.me();
      setAuth(meRes.data as never, accessToken, refreshToken);
      await qc.invalidateQueries({ queryKey: ['auth'] });
      router.push('/account');
      toast.success('Đăng nhập thành công!');
    },
    onError: () => {
      toast.error('Email hoặc mật khẩu không đúng');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string; fullName: string; phone?: string }) =>
      authApi.register(data),
    onSuccess: () => {
      router.push('/auth/login');
      toast.success('Tạo tài khoản thành công! Vui lòng đăng nhập.');
    },
    onError: (e: Error) => {
      toast.error(e.message ?? 'Đăng ký thất bại');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      localStorage.removeItem('access_token');
      clearAuth();
      await qc.clear();
      router.push('/');
      toast.success('Đã đăng xuất');
    },
  });
}
