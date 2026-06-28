import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

async function getToken(): Promise<string | null> {
  try { return await SecureStore.getItemAsync('auth_token'); }
  catch { return null; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const data = await res.json() as { ok: boolean; data: T; error?: string };
  if (!data.ok) throw new Error(data.error ?? 'API error');
  return data.data;
}

export const productApi = {
  list: (params: Record<string, string | number | undefined> = {}) => {
    const q = Object.entries(params).filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`).join('&');
    return request<{ products: unknown[]; total: number }>(`/products${q ? `?${q}` : ''}`);
  },
  getBySlug: (slug: string) => request<unknown>(`/products/slug/${slug}`),
};

export const sellerApi = {
  list: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<{ sellers: unknown[]; total: number }>(`/sellers${q ? `?${q}` : ''}`);
  },
  getBySlug: (slug: string) => request<unknown>(`/sellers/slug/${slug}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: unknown; access_token: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ user: unknown; access_token: string }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<unknown>('/auth/me'),
};

export const orderApi = {
  list: () => request<{ orders: unknown[]; total: number }>('/orders'),
  get: (id: string) => request<unknown>(`/orders/${id}`),
};

export const checkoutApi = {
  place: (body: unknown) => request<unknown>('/checkout/place', {
    method: 'POST', body: JSON.stringify(body),
  }),
  calculateShipping: (body: unknown) => request<{ fee: number }>('/checkout/calculate-shipping', {
    method: 'POST', body: JSON.stringify(body),
  }),
};
