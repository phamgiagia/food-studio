import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ok, paginated, AppError } from '../middleware/error';

export const subscriptionRoutes = new Hono<{ Bindings: Env }>();

// ── Public: List subscription plans ──────────────────────
subscriptionRoutes.get('/plans', async (c) => {
  const plans = await c.env.DB.prepare(
    "SELECT * FROM subscription_plans WHERE active = 1 ORDER BY sort_order"
  ).all();
  return c.json(ok(plans.results));
});

// ── Public: Get subscription offers by seller ────────────
subscriptionRoutes.get('/offers', async (c) => {
  const sellerId = c.req.query('seller');
  const planId = c.req.query('plan');

  const conditions: string[] = ["sso.status = 'active'", 'sp.active = 1'];
  const bindings: (string | number)[] = [];
  if (sellerId) { conditions.push('sso.seller_id = ?'); bindings.push(sellerId); }
  if (planId) { conditions.push('sso.plan_id = ?'); bindings.push(planId); }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const offers = await c.env.DB.prepare(
    `SELECT sso.*, sp.name as plan_name, sp.billing_period, sp.min_commitment,
            sp.max_products, sp.features_json, sp.image_url,
            sl.store_name, sl.slug as seller_slug, sl.region, sl.province,
            sl.rating as seller_rating, sl.logo_url as seller_logo
     FROM seller_subscription_offers sso
     JOIN subscription_plans sp ON sso.plan_id = sp.id
     JOIN seller_profiles sl ON sso.seller_id = sl.id
     ${where}
     ORDER BY sp.sort_order`
  ).bind(...bindings).all();

  return c.json(ok(offers.results));
});

// ── Public: Single offer details ─────────────────────────
subscriptionRoutes.get('/offers/:id', async (c) => {
  const id = c.req.param('id');
  const offer = await c.env.DB.prepare(
    `SELECT sso.*, sp.name as plan_name, sp.description as plan_description,
            sp.billing_period, sp.min_commitment, sp.max_products,
            sp.price as plan_price, sp.features_json, sp.image_url,
            sl.store_name, sl.slug as seller_slug, sl.region, sl.province,
            sl.rating as seller_rating, sl.review_count as seller_review_count,
            sl.logo_url as seller_logo, sl.story as seller_story
     FROM seller_subscription_offers sso
     JOIN subscription_plans sp ON sso.plan_id = sp.id
     JOIN seller_profiles sl ON sso.seller_id = sl.id
     WHERE sso.id = ? AND sso.status = 'active'`
  ).bind(id).first();

  if (!offer) throw new AppError('NOT_FOUND', 'Subscription offer not found', 404);
  return c.json(ok(offer));
});

// ── Authenticated: My subscriptions ──────────────────────
subscriptionRoutes.get('/mine', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const subs = await c.env.DB.prepare(
    `SELECT s.*, sp.name as plan_name, sp.billing_period, sp.price as plan_price,
            sl.store_name, sl.slug as seller_slug, sl.region, sl.province,
            sl.logo_url as seller_logo
     FROM subscriptions s
     JOIN seller_subscription_offers sso ON s.seller_offer_id = sso.id
     JOIN subscription_plans sp ON sso.plan_id = sp.id
     JOIN seller_profiles sl ON sso.seller_id = sl.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC`
  ).bind(userId).all();

  return c.json(ok(subs.results));
});

// ── Authenticated: My single subscription ────────────────
subscriptionRoutes.get('/mine/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const sub = await c.env.DB.prepare(
    `SELECT s.*, sp.name as plan_name, sp.billing_period, sp.price as plan_price,
            sp.features_json, sp.max_products,
            sl.store_name, sl.slug as seller_slug, sl.region, sl.province,
            sl.logo_url as seller_logo
     FROM subscriptions s
     JOIN seller_subscription_offers sso ON s.seller_offer_id = sso.id
     JOIN subscription_plans sp ON sso.plan_id = sp.id
     JOIN seller_profiles sl ON sso.seller_id = sl.id
     WHERE s.id = ? AND s.user_id = ?`
  ).bind(id, userId).first();

  if (!sub) throw new AppError('NOT_FOUND', 'Subscription not found', 404);

  // Fetch items + deliveries
  const [items, deliveries] = await Promise.all([
    c.env.DB.prepare(
      `SELECT si.*, p.name as product_name, p.slug as product_slug, p.base_price,
              pv.name as variant_name
       FROM subscription_items si
       JOIN products p ON si.product_id = p.id
       LEFT JOIN product_variants pv ON si.variant_id = pv.id
       WHERE si.subscription_id = ?`
    ).bind(id).all(),
    c.env.DB.prepare(
      `SELECT * FROM subscription_deliveries WHERE subscription_id = ?
       ORDER BY delivery_number`
    ).bind(id).all(),
  ]);

  return c.json(ok({ ...sub, items: items.results, deliveries: deliveries.results }));
});

// ── Authenticated: Subscribe to a plan ───────────────────
const subscribeSchema = z.object({
  sellerOfferId: z.string(),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(9),
    line1: z.string().min(5),
    district: z.string().min(1),
    province: z.string().min(1),
  }),
  deliveryInterval: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
  maxDeliveries: z.number().int().positive().optional(),
  shippingNote: z.string().max(500).optional(),
  giftMessage: z.string().max(500).optional(),
  autoRenew: z.boolean().optional().default(true),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
});

subscriptionRoutes.post('/subscribe', authMiddleware, zValidator('json', subscribeSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  // 1. Validate offer exists
  const offer = await c.env.DB.prepare(
    `SELECT sso.*, sp.billing_period, sp.min_commitment, sp.max_products,
            sp.price as plan_price, sp.allows_customization
     FROM seller_subscription_offers sso
     JOIN subscription_plans sp ON sso.plan_id = sp.id
     WHERE sso.id = ? AND sso.status = 'active' AND sp.active = 1`
  ).bind(body.sellerOfferId).first<Record<string, unknown>>();

  if (!offer) throw new AppError('NOT_FOUND', 'Offer not found or inactive', 404);

  const price = (offer.price ?? offer.plan_price) as number;
  const interval = body.deliveryInterval ?? (offer.billing_period as string);
  const minCommit = offer.min_commitment as number;
  const maxProducts = offer.max_products as number;

  // 2. Validate items count
  const items = body.items ?? [];
  if (items.length > maxProducts) {
    throw new AppError('TOO_MANY_ITEMS', `Max ${maxProducts} items per delivery`, 400);
  }

  // 3. Calculate first billing period
  const periodEnd = new Date();
  const periodMap: Record<string, (d: Date) => void> = {
    weekly: (d) => d.setDate(d.getDate() + 7),
    biweekly: (d) => d.setDate(d.getDate() + 14),
    monthly: (d) => d.setMonth(d.getMonth() + 1),
    quarterly: (d) => d.setMonth(d.getMonth() + 3),
  };
  const addPeriod = periodMap[interval];
  if (addPeriod) addPeriod(periodEnd);

  const id = crypto.randomUUID().replace(/-/g, '');
  const shipAddr = JSON.stringify(body.shippingAddress);

  // 4. Create subscription
  const now = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `INSERT INTO subscriptions
     (id, user_id, seller_offer_id, status, current_period_start, current_period_end,
      delivery_interval, max_deliveries, shipping_address, shipping_note, gift_message, auto_renew)
     VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.sellerOfferId,
    now, Math.floor(periodEnd.getTime() / 1000),
    interval, body.maxDeliveries ?? null,
    shipAddr, body.shippingNote ?? null, body.giftMessage ?? null,
    body.autoRenew ? 1 : 0,
  ).run();

  // 5. Create subscription items (if any)
  if (items.length > 0) {
    const itemStmts = items.map(item =>
      c.env.DB.prepare(
        `INSERT INTO subscription_items (id, subscription_id, product_id, variant_id, quantity, is_custom)
         VALUES (?, ?, ?, ?, ?, 1)`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        id, item.productId, item.variantId ?? null,
        item.quantity,
      )
    );
    await c.env.DB.batch(itemStmts);
  }

  // 6. Create first delivery entry
  const firstDelivery = new Date();
  firstDelivery.setDate(firstDelivery.getDate() + 7); // first box ships in ~7 days

  await c.env.DB.prepare(
    `INSERT INTO subscription_deliveries (id, subscription_id, delivery_number, status, scheduled_date)
     VALUES (?, ?, 1, 'pending', ?)`
  ).bind(crypto.randomUUID().replace(/-/g, ''), id, Math.floor(firstDelivery.getTime() / 1000)).run();

  return c.json(ok({ id, status: 'active', currentPeriodEnd: Math.floor(periodEnd.getTime() / 1000) }), 201);
});

// ── Authenticated: Cancel/pause/resume ───────────────────
subscriptionRoutes.patch('/mine/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const { action } = await c.req.json<{ action: 'pause' | 'resume' | 'cancel' }>();

  const sub = await c.env.DB.prepare(
    'SELECT id, status FROM subscriptions WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first<{ id: string; status: string }>();

  if (!sub) throw new AppError('NOT_FOUND', 'Subscription not found', 404);

  const transitions: Record<string, string[]> = {
    pause: ['active'],
    resume: ['paused'],
    cancel: ['active', 'paused'],
  };

  if (!transitions[action]?.includes(sub.status)) {
    throw new AppError('INVALID_TRANSITION', `Cannot ${action} a ${sub.status} subscription`, 400);
  }

  const statusMap: Record<string, string> = { pause: 'paused', resume: 'active', cancel: 'cancelled' };
  const newStatus = statusMap[action];
  const now = Math.floor(Date.now() / 1000);

  if (action === 'cancel') {
    await c.env.DB.prepare(
      "UPDATE subscriptions SET status = ?, cancelled_at = ?, updated_at = ? WHERE id = ?"
    ).bind(newStatus, now, now, id).run();
  } else {
    await c.env.DB.prepare(
      "UPDATE subscriptions SET status = ?, updated_at = ? WHERE id = ?"
    ).bind(newStatus, now, id).run();
  }

  return c.json(ok({ id, status: newStatus }));
});

// ── Authenticated: Update items for next delivery ────────
const updateItemsSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive().default(1),
  })).min(1).max(10),
});

subscriptionRoutes.put('/mine/:id/items', authMiddleware, zValidator('json', updateItemsSchema), async (c) => {
  const userId = c.get('userId');
  const subId = c.req.param('id');
  const body = c.req.valid('json');

  const sub = await c.env.DB.prepare(
    "SELECT id FROM subscriptions WHERE id = ? AND user_id = ? AND status = 'active'"
  ).bind(subId, userId).first();

  if (!sub) throw new AppError('NOT_FOUND', 'Active subscription not found', 404);

  // Replace all items
  await c.env.DB.prepare('DELETE FROM subscription_items WHERE subscription_id = ?').bind(subId).run();

  const stmts = body.items.map(item =>
    c.env.DB.prepare(
      `INSERT INTO subscription_items (id, subscription_id, product_id, variant_id, quantity, is_custom)
       VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(crypto.randomUUID().replace(/-/g, ''), subId, item.productId, item.variantId ?? null, item.quantity)
  );

  await c.env.DB.batch(stmts);
  return c.json(ok({ message: 'Items updated' }));
});

// ── Seller routes: My offers ─────────────────────────────
subscriptionRoutes.get('/seller/offers', authMiddleware, requireRole('seller', 'admin', 'super_admin'), async (c) => {
  const userId = c.get('userId');
  const role = c.get('userRole');

  let query: string;
  let bindings: (string | number)[];

  if (role === 'seller') {
    const seller = await c.env.DB.prepare(
      'SELECT id FROM seller_profiles WHERE user_id = ?'
    ).bind(userId).first<{ id: string }>();

    if (!seller) throw new AppError('NOT_FOUND', 'Seller profile not found', 404);

    query = `SELECT sso.*, sp.name as plan_name, sp.billing_period, sp.price as plan_price
             FROM seller_subscription_offers sso
             JOIN subscription_plans sp ON sso.plan_id = sp.id
             WHERE sso.seller_id = ?
             ORDER BY sp.sort_order`;
    bindings = [seller.id];
  } else {
    query = `SELECT sso.*, sp.name as plan_name, sp.billing_period,
                    sl.store_name as seller_name
             FROM seller_subscription_offers sso
             JOIN subscription_plans sp ON sso.plan_id = sp.id
             JOIN seller_profiles sl ON sso.seller_id = sl.id
             ORDER BY sso.created_at DESC`;
    bindings = [];
  }

  const offers = await c.env.DB.prepare(query).bind(...bindings).all();
  return c.json(ok(offers.results));
});

// ── Seller routes: Create/update offer ───────────────────
const upsertOfferSchema = z.object({
  planId: z.string(),
  price: z.number().int().positive().optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'paused']).optional(),
});

subscriptionRoutes.post('/seller/offers', authMiddleware, zValidator('json', upsertOfferSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const seller = await c.env.DB.prepare(
    "SELECT id FROM seller_profiles WHERE user_id = ? AND status = 'approved'"
  ).bind(userId).first<{ id: string }>();
  if (!seller) throw new AppError('SELLER_NOT_APPROVED', 'Seller profile not found or not approved', 403);

  const id = crypto.randomUUID().replace(/-/g, '');
  await c.env.DB.prepare(
    `INSERT INTO seller_subscription_offers (id, seller_id, plan_id, price, description, status)
     VALUES (?, ?, ?, ?, ?, 'active')
     ON CONFLICT(seller_id, plan_id) DO UPDATE SET
       price = excluded.price,
       description = excluded.description,
       status = 'active',
       updated_at = unixepoch()`
  ).bind(id, seller.id, body.planId, body.price ?? null, body.description ?? null).run();

  return c.json(ok({ id }), 201);
});