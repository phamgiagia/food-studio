import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';

interface ProductListParams {
  category?: string;
  region?: string;
  q?: string;
  sort?: string;
  featured?: boolean;
  limit?: number;
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.list({ ...params, limit: params.limit ?? 20 }),
  });
}

export function useInfiniteProducts(params: ProductListParams = {}) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      productApi.list({ ...params, page: pageParam as number, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { meta?: { page?: number; totalPages?: number } }) => {
      if (!lastPage.meta) return undefined;
      const { page = 1, totalPages = 1 } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => productApi.get(id),
    enabled: !!id,
  });
}
