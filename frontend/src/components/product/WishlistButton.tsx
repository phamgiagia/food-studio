'use client';

import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useToggleWishlist } from '@/hooks/useWishlist';

export function WishlistButton({ productId }: { productId: string }) {
  const { isWishlisted, toggle, isPending } = useToggleWishlist(productId);

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
        isWishlisted
          ? 'border-red-200 bg-red-50 text-red-500'
          : 'border-earth-200 text-earth-400 hover:border-red-200 hover:text-red-400'
      }`}
    >
      {isWishlisted
        ? <HeartSolid className="w-5 h-5" />
        : <HeartIcon className="w-5 h-5" />}
    </button>
  );
}
