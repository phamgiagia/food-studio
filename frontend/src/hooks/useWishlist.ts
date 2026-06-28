import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_price?: number;
  province: string;
  rating_avg?: number;
  review_count: number;
  store_name?: string;
  seller_slug?: string;
}

export function useWishlist() {
  const isLoggedIn = useAuthStore(s => !!s.user);
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await wishlistApi.list();
      return res.data as WishlistItem[];
    },
    enabled: isLoggedIn,
    staleTime: 30_000,
  });
}

export function useToggleWishlist(productId: string) {
  const qc = useQueryClient();
  const isLoggedIn = useAuthStore(s => !!s.user);

  const { data: items } = useWishlist();
  const isWishlisted = items?.some(i => i.product_id === productId) ?? false;

  const add = useMutation({
    mutationFn: () => wishlistApi.add(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã thêm vào yêu thích');
    },
    onError: () => toast.error('Không thể thêm vào yêu thích'),
  });

  const remove = useMutation({
    mutationFn: () => wishlistApi.remove(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã xóa khỏi yêu thích');
    },
    onError: () => toast.error('Không thể xóa khỏi yêu thích'),
  });

  const toggle = () => {
    if (!isLoggedIn) { toast.error('Vui lòng đăng nhập để lưu yêu thích'); return; }
    if (isWishlisted) remove.mutate();
    else add.mutate();
  };

  return { isWishlisted, toggle, isPending: add.isPending || remove.isPending };
}
