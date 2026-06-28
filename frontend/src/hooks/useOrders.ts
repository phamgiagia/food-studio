import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, checkoutApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';

export function useOrders(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.list(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id),
    enabled: !!id,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderApi.cancel(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đơn hàng đã được hủy');
    },
    onError: () => toast.error('Không thể hủy đơn hàng'),
  });
}

export function usePlaceOrder() {
  const router = useRouter();
  const clearCart = useCartStore(s => s.clearCart);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) => checkoutApi.place(data),
    onSuccess: async (res) => {
      const { orderId } = res.data as { orderId: string };
      clearCart();
      await qc.invalidateQueries({ queryKey: ['orders'] });
      router.push(`/orders/${orderId}`);
      toast.success('Đặt hàng thành công!');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Đặt hàng thất bại'),
  });
}
