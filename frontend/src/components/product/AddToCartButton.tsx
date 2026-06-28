'use client';

import { useState } from 'react';
import { ShoppingCartIcon, MinusIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import type { ProductImage } from '@food-studio/types';

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: ProductImage[];
  };
  variantId?: string;
}

export function AddToCartButton({ product, variantId }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variantId,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        images: product.images,
      },
    });
    setAdded(true);
    toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex gap-3">
      <div className="flex items-center border border-earth-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="w-10 h-12 flex items-center justify-center hover:bg-earth-50 transition-colors"
          aria-label="Giảm số lượng"
        >
          <MinusIcon className="w-4 h-4 text-earth-600" />
        </button>
        <span className="w-10 text-center font-semibold text-earth-800 text-sm" aria-live="polite">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(q => q + 1)}
          className="w-10 h-12 flex items-center justify-center hover:bg-earth-50 transition-colors"
          aria-label="Tăng số lượng"
        >
          <PlusIcon className="w-4 h-4 text-earth-600" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        className={`btn-primary flex-1 gap-2 transition-all ${added ? 'bg-green-500 hover:bg-green-600' : ''}`}
        aria-label={`Thêm ${quantity} sản phẩm vào giỏ hàng`}
      >
        {added ? (
          <><CheckIcon className="w-5 h-5" /> Đã thêm vào giỏ</>
        ) : (
          <><ShoppingCartIcon className="w-5 h-5" /> Thêm Vào Giỏ</>
        )}
      </button>
    </div>
  );
}
