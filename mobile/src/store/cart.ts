import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MobileCartItem = {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  imageUrl?: string;
  sellerName: string;
  quantity: number;
};

interface CartState {
  items: MobileCartItem[];
  addItem: (item: MobileCartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const itemKey = (productId: string, variantId?: string) =>
  variantId ? `${productId}:${variantId}` : productId;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const key = itemKey(item.productId, item.variantId);
        const existing = state.items.find(i => itemKey(i.productId, i.variantId) === key);
        if (existing) {
          return {
            items: state.items.map(i =>
              itemKey(i.productId, i.variantId) === key
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(
          i => !(i.productId === productId && i.variantId === variantId)
        ),
      })),

      updateQuantity: (productId, variantId, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(i => !(i.productId === productId && i.variantId === variantId))
          : state.items.map(i =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity }
                : i
            ),
      })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'food-studio-mobile-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
