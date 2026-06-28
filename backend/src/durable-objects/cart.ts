export class CartDO implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    if (method === 'GET' && path === '/') {
      const items = await this.state.storage.list();
      return Response.json({ items: Object.fromEntries(items) });
    }

    if (method === 'POST' && path === '/items') {
      const { productId, variantId, quantity, price } = await request.json<{
        productId: string; variantId?: string; quantity: number; price: number;
      }>();
      const key = variantId ? `${productId}:${variantId}` : productId;
      const existing = await this.state.storage.get<{ quantity: number; price: number }>(key);
      await this.state.storage.put(key, {
        productId, variantId, quantity: (existing?.quantity ?? 0) + quantity, price,
      });
      return Response.json({ ok: true });
    }

    if (method === 'PATCH' && path.startsWith('/items/')) {
      const key = decodeURIComponent(path.slice(7));
      const { quantity } = await request.json<{ quantity: number }>();
      if (quantity <= 0) {
        await this.state.storage.delete(key);
      } else {
        const existing = await this.state.storage.get<Record<string, unknown>>(key);
        if (existing) await this.state.storage.put(key, { ...existing, quantity });
      }
      return Response.json({ ok: true });
    }

    if (method === 'DELETE' && path === '/') {
      await this.state.storage.deleteAll();
      return Response.json({ ok: true });
    }

    return new Response('Not found', { status: 404 });
  }
}
