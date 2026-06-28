import type { ApiResponse, ApiError, PaginatedResponse } from '@food-studio/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.foodstudio.vn/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    const json = await res.json() as ApiResponse<T> | ApiError;

    if (!res.ok) {
      const error = (json as ApiError).error;
      throw new Error(error?.message ?? 'Request failed');
    }

    return json as ApiResponse<T>;
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
        )}`
      : path;
    return this.request<T>(url);
  }

  async post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  async patch<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Typed query helpers

export const productApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/products', params) as Promise<PaginatedResponse<unknown>>,
  get: (id: string) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
};

export const sellerApi = {
  list: (params?: Record<string, string>) => api.get('/sellers', params),
  getBySlug: (slug: string) => api.get(`/sellers/slug/${slug}`),
  apply: (data: unknown) => api.post('/sellers/apply', data),
  me: () => api.get('/sellers/me'),
  stats: () => api.get('/sellers/me/stats'),
};

export const authApi = {
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ accessToken: string; refreshToken: string; expiresAt: number }>('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout', {}),
};

export const orderApi = {
  list: (params?: { status?: string; page?: number }) => api.get('/orders', params),
  get: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.delete(`/orders/${id}`),
};

export const checkoutApi = {
  place: (data: unknown) => api.post('/checkout/place', data),
  calculateShipping: (data: unknown) => api.post('/checkout/calculate-shipping', data),
  applyCoupon: (code: string, subtotal: number) => api.post('/checkout/apply-coupon', { code, subtotal }),
};

export const categoryApi = {
  list: () => api.get('/categories'),
};

export const reviewApi = {
  list: (productId: string, page?: number) => api.get('/reviews', { product: productId, page }),
  create: (data: unknown) => api.post('/reviews', data),
};

export const wishlistApi = {
  list: () => api.get<unknown[]>('/wishlists/me'),
  add: (productId: string) => api.post('/wishlists', { productId }),
  remove: (productId: string) => api.delete(`/wishlists/${productId}`),
};
