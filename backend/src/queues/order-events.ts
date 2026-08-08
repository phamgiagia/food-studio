import type { Env } from '../types/env';
import { earnPointsForOrder } from '../routes/loyalty';
import { rewardReferralIfEligible } from '../routes/referrals';

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
        case 'order.delivered':
          await onOrderDelivered(event, env);
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
  // Send order confirmation email
  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'order_confirmation',
    userId: event['userId'],
    data: { orderId: event['orderId'], total: event['total'] },
  });
}

async function onPaymentSucceeded(event: Record<string, unknown>, env: Env) {
  const orderId = event['orderId'] as string;

  await env.DB.prepare(
    "UPDATE orders SET status = 'confirmed', updated_at = unixepoch() WHERE id = ?"
  ).bind(orderId).run();

  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'new_order_seller',
    data: { orderId },
  });

  // Reward referral (referrer + referred) if this was the referred user's first paid order
  try {
    const order = await env.DB.prepare('SELECT user_id FROM orders WHERE id = ?')
      .bind(orderId).first<{ user_id: string }>();
    if (order) await rewardReferralIfEligible(env, order.user_id, orderId);
  } catch (err) {
    console.error('[Queue] Failed to process referral reward:', err);
  }
}

/**
 * When order is delivered, schedule a review reminder:
 * - Send notification immediately (optional)
 * - The reminder TTL is handled by the notification queue consumer
 */
async function onOrderDelivered(event: Record<string, unknown>, env: Env) {
  const orderId = event['orderId'] as string;
  const userId = event['userId'] as string;
  const subtotal = (event['subtotal'] as number) ?? 0;

  // Earn loyalty points
  try {
    await earnPointsForOrder(env, userId, orderId, subtotal);
  } catch (err) {
    console.error('[Queue] Failed to earn loyalty points:', err);
  }

  // Get order items to know which products to ask about
  const items = await env.DB.prepare(
    `SELECT oi.product_id, oi.product_name, oi.variant_name
     FROM order_items oi
     WHERE oi.order_id = ? AND oi.status = 'delivered'`
  ).bind(orderId).all<{
    product_id: string; product_name: string; variant_name: string | null;
  }>();

  if (!items.results.length) return;

  // Queue a delayed review reminder email (notification queue handles delay)
  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'review_reminder',
    userId,
    delay: 3 * 86400, // 3 days after delivery
    data: {
      orderId,
      products: items.results.map(i => ({
        productId: i.product_id,
        productName: i.product_name,
        variantName: i.variant_name,
      })),
    },
  });

  // Also create review prompt records so user sees them on dashboard
  for (const item of items.results) {
    const existing = await env.DB.prepare(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? AND order_id = ?'
    ).bind(item.product_id, userId, orderId).first();

    if (!existing) {
      const now = Math.floor(Date.now() / 1000);
      await env.DB.prepare(
        `INSERT OR IGNORE INTO review_prompts (id, user_id, product_id, order_id, product_name, triggered_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        userId, item.product_id, orderId, item.product_name, now,
      ).run();
    }
  }
}