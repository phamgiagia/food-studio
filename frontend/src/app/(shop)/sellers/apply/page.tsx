'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PROVINCES } from '@food-studio/utils';
import { sellerApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const schema = z.object({
  storeName: z.string().min(3, 'Tên cửa hàng tối thiểu 3 ký tự').max(100),
  province: z.string().min(1, 'Vui lòng chọn tỉnh thành'),
  region: z.string().min(1, 'Vui lòng chọn vùng miền'),
  description: z.string().max(500).optional(),
  story: z.string().max(3000).optional(),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'Bạn phải đồng ý điều khoản' }) }),
});

type FormData = z.infer<typeof schema>;

export default function SellerApplyPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await sellerApi.apply(data);
      toast.success('Đơn đăng ký đã được gửi! Chúng tôi sẽ xem xét trong 1–2 ngày làm việc.');
      router.push('/account');
    } catch (e) {
      toast.error((e as Error).message ?? 'Gửi đơn thất bại');
    }
  };

  return (
    <div className="container-wide py-12 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-earth-900 mb-2">Đăng Ký Bán Hàng</h1>
      <p className="text-earth-500 mb-8">Hoàn thành thông tin dưới đây để bắt đầu bán đặc sản của bạn trên Food Studio.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Tên cửa hàng *" error={errors.storeName?.message}>
          <input {...register('storeName')} className={inputClass} placeholder="Ví dụ: Mắm Huế Bà Lan" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Vùng miền *" error={errors.region?.message}>
            <select {...register('region')} className={inputClass}>
              <option value="">Chọn vùng</option>
              {[['north', 'Miền Bắc'], ['central', 'Miền Trung'], ['south', 'Miền Nam'], ['highland', 'Tây Nguyên']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Tỉnh thành *" error={errors.province?.message}>
            <select {...register('province')} className={inputClass}>
              <option value="">Chọn tỉnh</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Số điện thoại *" error={errors.phone?.message}>
          <input {...register('phone')} type="tel" className={inputClass} placeholder="0901234567" />
        </Field>

        <Field label="Mô tả ngắn cửa hàng" error={errors.description?.message}>
          <textarea {...register('description')} rows={3} className={inputClass} placeholder="Giới thiệu ngắn về cửa hàng và sản phẩm của bạn..." />
        </Field>

        <Field label="Câu chuyện thương hiệu" error={errors.story?.message}>
          <textarea {...register('story')} rows={5} className={inputClass} placeholder="Chia sẻ hành trình, giá trị và niềm đam mê của bạn với đặc sản vùng miền..." />
        </Field>

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('agreeTerms')} className="mt-0.5 rounded border-earth-300 text-brand-500" />
            <span className="text-sm text-earth-600">
              Tôi đồng ý với <a href="/terms" className="text-brand-600 underline">Điều khoản dịch vụ</a> và{' '}
              <a href="/privacy" className="text-brand-600 underline">Chính sách bảo mật</a> của Food Studio
            </span>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-4">
          {isSubmitting ? 'Đang gửi...' : 'Gửi Đơn Đăng Ký'}
        </button>
      </form>
    </div>
  );
}

const inputClass = 'w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white';

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-earth-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
