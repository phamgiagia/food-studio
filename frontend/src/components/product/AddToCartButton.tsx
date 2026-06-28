'use client';

import { useState } from 'react';
import { ShoppingCartIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';

export function AddToCartButton() {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = () => {
    // In real usage: pass actual product data
    addItem({
      productId: 'demo',
      quantity,
      product: {
        id: 'demo',
        name: 'Mắm Tôm Huế Truyền Thống',
        slug: 'mam-tom-hue-truyen-thong',
        basePrice: 85000,
        images: [],
        variants: [],
      },
    });
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="flex gap-3">
      <div className="flex items-center border border-earth-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="w-10 h-12 flex items-center justify-center hover:bg-earth-50 transition-colors"
        >
          <MinusIcon className="w-4 h-4 text-earth-600" />
        </button>
        <span className="w-10 text-center font-semibold text-earth-800 text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity(q => q + 1)}
          className="w-10 h-12 flex items-center justify-center hover:bg-earth-50 transition-colors"
        >
          <PlusIcon className="w-4 h-4 text-earth-600" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="btn-primary flex-1 gap-2"
      >
        <ShoppingCartIcon className="w-5 h-5" />
        Thêm Vào Giỏ
      </button>
    </div>
  );
}
