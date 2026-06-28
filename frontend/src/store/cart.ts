import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@food-studio/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const key = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
        const existing = state.items.find(i =>
          (i.variantId ? `${i.productId}:${i.variantId}` : i.productId) === key
        );
        if (existing) {
          return {
            items: state.items.map(i =>
              (i.variantId ? `${i.productId}:${i.variantId}` : i.productId) === key
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(i => !(i.productId === productId && i.variantId === variantId)),
      })),

      updateQuantity: (productId, variantId, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(i => !(i.productId === productId && i.variantId === variantId))
          : state.items.map(i =>
              i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
            ),
      })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => {
        const price = i.variant?.price ?? i.product.basePrice;
        return sum + price * i.quantity;
      }, 0),
    }),
    { name: 'food-studio-cart' }
  )
);
