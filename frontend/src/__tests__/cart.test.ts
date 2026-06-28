import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCartStore } from '../store/cart';
import type { CartItem } from '@food-studio/types';

// Zustand stores keep state between tests — reset before each
beforeEach(() => {
  useCartStore.setState({ items: [] });
});

function makeItem(productId: string, price: number, variantId?: string): CartItem {
  return {
    productId,
    variantId,
    quantity: 1,
    product: {
      id: productId,
      name: `Product ${productId}`,
      slug: `product-${productId}`,
      basePrice: price,
      images: [],
    },
    variant: variantId ? { id: variantId, name: 'Loại 1', price } : undefined,
  };
}

describe('useCartStore — addItem', () => {
  it('adds a new item to an empty cart', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
    });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe('p1');
  });

  it('increments quantity when the same product is added again', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().addItem(makeItem('p1', 50000));
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('treats same product with different variants as separate items', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000, 'v1'));
      useCartStore.getState().addItem(makeItem('p1', 60000, 'v2'));
    });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('adds multiple different products', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().addItem(makeItem('p2', 80000));
    });
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe('useCartStore — removeItem', () => {
  it('removes an item by productId', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().addItem(makeItem('p2', 80000));
      useCartStore.getState().removeItem('p1', undefined);
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('p2');
  });

  it('removes correct variant when multiple variants exist', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000, 'v1'));
      useCartStore.getState().addItem(makeItem('p1', 60000, 'v2'));
      useCartStore.getState().removeItem('p1', 'v1');
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe('v2');
  });
});

describe('useCartStore — updateQuantity', () => {
  it('updates quantity for existing item', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().updateQuantity('p1', undefined, 5);
    });
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().updateQuantity('p1', undefined, 0);
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes item when quantity is negative', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().updateQuantity('p1', undefined, -1);
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('useCartStore — clearCart', () => {
  it('removes all items', () => {
    act(() => {
      useCartStore.getState().addItem(makeItem('p1', 50000));
      useCartStore.getState().addItem(makeItem('p2', 80000));
      useCartStore.getState().clearCart();
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('useCartStore — totalItems', () => {
  it('sums quantities across all items', () => {
    act(() => {
      useCartStore.getState().addItem({ ...makeItem('p1', 50000), quantity: 3 });
      useCartStore.getState().addItem({ ...makeItem('p2', 80000), quantity: 2 });
    });
    expect(useCartStore.getState().totalItems()).toBe(5);
  });

  it('returns 0 for empty cart', () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
  });
});

describe('useCartStore — totalPrice', () => {
  it('sums price × quantity for each item (uses basePrice when no variant)', () => {
    act(() => {
      useCartStore.getState().addItem({ ...makeItem('p1', 50000), quantity: 2 });
      useCartStore.getState().addItem({ ...makeItem('p2', 30000), quantity: 1 });
    });
    expect(useCartStore.getState().totalPrice()).toBe(130000);
  });

  it('uses variant price over basePrice when variant is present', () => {
    const item: CartItem = {
      productId: 'p3',
      variantId: 'v1',
      quantity: 2,
      product: { id: 'p3', name: 'P3', slug: 'p3', basePrice: 100000, images: [] },
      variant: { id: 'v1', name: 'Loại đặc biệt', price: 80000 },
    };
    act(() => {
      useCartStore.getState().addItem(item);
    });
    expect(useCartStore.getState().totalPrice()).toBe(160000);
  });

  it('returns 0 for empty cart', () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });
});
