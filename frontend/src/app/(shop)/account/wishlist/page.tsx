'use client';

import Link from 'next/link';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { formatPrice } from '@/lib/utils';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';

function WishlistItemCard({ item }: { item: { id: string; product_id: string; name: string; slug: string; base_price: number; compare_price?: number; province: string; store_name?: string } }) {
  const { toggle, isPending } = useToggleWishlist(item.product_id);
  const addItem = useCartStore(s => s.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: item.product_id,
      quantity: 1,
      product: { id: item.product_id, name: item.name, slug: item.slug, basePrice: item.base_price, images: [] },
    });
    toast.success(`Đã thêm "${item.name}" vào giỏ hàng`);
  };

  return (
    <div className="bg-white border border-earth-100 rounded-2xl p-4 flex gap-4">
      <Link href={`/products/${item.slug}`} className="w-20 h-20 rounded-xl bg-earth-100 shrink-0 flex items-center justify-center text-earth-300 text-xs">
        Ảnh
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`}
          className="font-semibold text-earth-800 hover:text-brand-600 transition-colors line-clamp-2">
          {item.name}
        </Link>
        {item.store_name && <div className="text-earth-400 text-xs mt-0.5">{item.store_name}</div>}
        <div className="text-earth-400 text-xs">{item.province}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-earth-900">{formatPrice(item.base_price)}</span>
          {item.compare_price && item.compare_price > item.base_price && (
            <span className="text-earth-400 text-xs line-through">{formatPrice(item.compare_price)}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-between items-end shrink-0">
        <button
          onClick={toggle}
          disabled={isPending}
          className="text-red-400 hover:text-red-500 transition-colors"
          aria-label="Xóa khỏi yêu thích"
        >
          <HeartSolid className="w-5 h-5" />
        </button>
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <ShoppingCartIcon className="w-3.5 h-3.5" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { data: items, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Sản Phẩm Yêu Thích</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-white border border-earth-100 rounded-2xl p-4 h-28 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-earth-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-earth-100 rounded w-3/4" />
                  <div className="h-3 bg-earth-100 rounded w-1/2" />
                  <div className="h-4 bg-earth-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">
        Sản Phẩm Yêu Thích
        {items && items.length > 0 && <span className="text-earth-400 font-normal text-lg ml-2">({items.length})</span>}
      </h1>

      {!items || items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-earth-100 rounded-2xl">
          <HeartIcon className="w-12 h-12 text-earth-200 mx-auto mb-3" />
          <p className="text-earth-500 mb-4">Chưa có sản phẩm nào trong danh sách yêu thích</p>
          <Link href="/products" className="btn-primary">Khám Phá Sản Phẩm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
