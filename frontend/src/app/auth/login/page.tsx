'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    login(data, {
      onSuccess: () => router.push('/'),
    });
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl font-bold text-brand-600">Food Studio</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-earth-900 mt-4">Đăng nhập</h1>
          <p className="text-earth-500 mt-1">Chào mừng trở lại!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              Email hoặc mật khẩu không đúng. Vui lòng thử lại.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="ten@email.com"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-earth-700">Mật khẩu</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-500 hover:text-brand-600">
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-earth-100" />
            </div>
            <div className="relative flex justify-center text-xs text-earth-400">
              <span className="bg-white px-3">hoặc</span>
            </div>
          </div>

          <p className="text-center text-sm text-earth-600">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-brand-500 font-semibold hover:text-brand-600">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
