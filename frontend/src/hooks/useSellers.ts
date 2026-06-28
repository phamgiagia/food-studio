import { useQuery } from '@tanstack/react-query';
import { sellerApi } from '@/lib/api';

export function useSellers(params?: { region?: string; page?: number }) {
  return useQuery({
    queryKey: ['sellers', params],
    queryFn: () => sellerApi.list(params as Record<string, string>),
  });
}

export function useSeller(slug: string) {
  return useQuery({
    queryKey: ['seller', slug],
    queryFn: () => sellerApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useMySellerProfile() {
  return useQuery({
    queryKey: ['seller', 'me'],
    queryFn: () => sellerApi.me(),
    retry: false,
  });
}

export function useSellerStats() {
  return useQuery({
    queryKey: ['seller', 'me', 'stats'],
    queryFn: () => sellerApi.stats(),
  });
}
