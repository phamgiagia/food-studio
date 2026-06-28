const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

class AdminApiClient {
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('admin_token')
      : null;

    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    const data = await res.json() as { ok: boolean; data: T; error?: string };
    if (!data.ok) throw new Error(data.error ?? 'API error');
    return data.data;
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }
  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }
  delete<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }); }
}

export const api = new AdminApiClient();

export const adminApi = {
  overview: () => api.get<{
    gmv: number; orders: number; sellers: number; customers: number;
    pendingSellers: number; recentOrders: unknown[];
  }>('/admin/analytics/overview'),

  sellers: {
    list: (params?: { status?: string; page?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return api.get<{ sellers: unknown[]; total: number }>(`/admin/sellers${q ? `?${q}` : ''}`);
    },
    approve: (id: string) => api.patch(`/admin/sellers/${id}/status`, { status: 'approved' }),
    suspend: (id: string) => api.patch(`/admin/sellers/${id}/status`, { status: 'suspended' }),
    reject: (id: string) => api.patch(`/admin/sellers/${id}/status`, { status: 'rejected' }),
  },

  orders: {
    list: (params?: { status?: string; page?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return api.get<{ orders: unknown[]; total: number }>(`/admin/orders${q ? `?${q}` : ''}`);
    },
    updateStatus: (id: string, status: string) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
  },

  products: {
    list: (params?: { status?: string; page?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return api.get<{ products: unknown[]; total: number }>(`/admin/products${q ? `?${q}` : ''}`);
    },
    approve: (id: string) => api.patch(`/admin/products/${id}/status`, { status: 'active' }),
    reject: (id: string) => api.patch(`/admin/products/${id}/status`, { status: 'rejected' }),
  },

  auth: {
    login: (email: string, password: string) =>
      api.post<{ token: string; user: unknown }>('/auth/login', { email, password }),
  },
};
