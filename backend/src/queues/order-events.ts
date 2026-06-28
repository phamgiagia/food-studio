import type { Env } from '../types/env';

export async function handleOrderEvents(
  batch: MessageBatch<Record<string, unknown>>,
  env: Env
): Promise<void> {
  for (const message of batch.messages) {
    const event = message.body;

    try {
      switch (event['type']) {
        case 'order.created':
          await onOrderCreated(event, env);
          break;
        case 'payment.succeeded':
          await onPaymentSucceeded(event, env);
          break;
        default:
          console.warn('[Queue] Unknown event type:', event['type']);
      }
      message.ack();
    } catch (err) {
      console.error('[Queue] Failed to process event:', event['type'], err);
      message.retry();
    }
  }
}

async function onOrderCreated(event: Record<string, unknown>, env: Env) {
  // Send order confirmation email via notification queue
  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'order_confirmation',
    userId: event['userId'],
    data: { orderId: event['orderId'], total: event['total'] },
  });
}

async function onPaymentSucceeded(event: Record<string, unknown>, env: Env) {
  // Confirm order
  await env.DB.prepare(
    "UPDATE orders SET status = 'confirmed', updated_at = unixepoch() WHERE id = ?"
  ).bind(event['orderId']).run();

  // Notify seller
  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'new_order_seller',
    data: { orderId: event['orderId'] },
  });
}
