export class InventoryReservationDO implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const { action, productId, quantity } = await request.json<{
      action: 'reserve' | 'release'; productId: string; quantity: number;
    }>();

    const key = `stock:${productId}`;
    const current = (await this.state.storage.get<number>(key)) ?? 0;

    if (action === 'reserve') {
      if (current < quantity) return Response.json({ ok: false, error: 'INSUFFICIENT_STOCK' }, { status: 409 });
      await this.state.storage.put(key, current - quantity);
      return Response.json({ ok: true, remaining: current - quantity });
    }

    if (action === 'release') {
      await this.state.storage.put(key, current + quantity);
      return Response.json({ ok: true, remaining: current + quantity });
    }

    return new Response('Invalid action', { status: 400 });
  }
}
