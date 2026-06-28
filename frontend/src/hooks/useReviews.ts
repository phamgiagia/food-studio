import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api';
import { toast } from 'sonner';

export function useReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => reviewApi.list(productId, page),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; rating: number; title?: string; body?: string; orderId?: string }) =>
      reviewApi.create(data),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['reviews', vars.productId] });
      await qc.invalidateQueries({ queryKey: ['product', vars.productId] });
      toast.success('Đánh giá của bạn đã được gửi!');
    },
    onError: () => toast.error('Không thể gửi đánh giá'),
  });
}
