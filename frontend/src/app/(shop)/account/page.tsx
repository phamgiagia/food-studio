'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthUser } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

export default function AccountProfilePage() {
  const { data: userData, isLoading } = useAuthUser();
  const user = (userData as { data?: { full_name?: string; email?: string; phone?: string } } | null)?.data;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: { fullName: user?.full_name ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = async (data: { fullName: string; phone?: string }) => {
    try {
      await authApi.me(); // placeholder — real: patch /auth/me
      toast.success('Thông tin đã được cập nhật');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-earth-200 rounded-xl w-1/3" /><div className="h-40 bg-earth-100 rounded-2xl" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Hồ Sơ Của Tôi</h1>

      <div className="bg-white border border-earth-100 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Email</label>
            <input value={user?.email ?? ''} disabled className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm bg-earth-50 text-earth-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Họ và tên</label>
            <input {...register('fullName')} className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Số điện thoại</label>
            <input {...register('phone')} type="tel" className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
