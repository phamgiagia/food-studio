'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
  fullName: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending, error } = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = ({ fullName, email, password }: FormData) => {
    registerUser({ fullName, email, password }, {
      onSuccess: () => router.push('/'),
    });
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl font-bold text-brand-600">Food Studio</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-earth-900 mt-4">Tạo tài khoản</h1>
          <p className="text-earth-500 mt-1">Khám phá hàng nghìn đặc sản Việt Nam</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              Email đã được sử dụng. Vui lòng thử email khác.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Họ và tên</label>
              <input
                {...register('fullName')}
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

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
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Mật khẩu</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Xác nhận mật khẩu</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-earth-400">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link href="/terms" className="text-brand-500 hover:underline">Điều khoản dịch vụ</Link>
              {' '}và{' '}
              <Link href="/privacy" className="text-brand-500 hover:underline">Chính sách bảo mật</Link>.
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-earth-600 mt-6">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-brand-500 font-semibold hover:text-brand-600">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
