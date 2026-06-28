import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';

export const checkoutRoutes = new Hono<{ Bindings: Env }>();

const placeOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddressId: z.string(),
  shippingMethod: z.string(),
  couponCode: z.string().optional(),
  giftMessage: z.string().max(500).optional(),
  scheduledDate: z.number().optional(),
  paymentMethod: z.enum(['vnpay', 'momo', 'zalopay', 'cod']),
  note: z.string().max(500).optional(),
});

checkoutRoutes.post('/place', authMiddleware, zValidator('json', placeOrderSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  // 1. Validate address belongs to user
  const address = await c.env.DB.prepare(
    'SELECT * FROM addresses WHERE id = ? AND user_id = ?'
  ).bind(body.shippingAddressId, userId).first<Record<string, unknown>>();
  if (!address) throw new AppError('INVALID_ADDRESS', 'Address not found', 400);

  // 2. Fetch products + validate stock
  const productIds = body.items.map(i => i.productId);
  const placeholders = productIds.map(() => '?').join(',');
  const products = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.base_price, p.seller_id, p.status,
            COALESCE(inv.quantity - inv.reserved, 0) as available_stock
     FROM products p
     LEFT JOIN inventory inv ON inv.product_id = p.id
     WHERE p.id IN (${placeholders})`
  ).bind(...productIds).all<{
    id: string; name: string; base_price: number; seller_id: string; status: string; available_stock: number;
  }>();

  const productMap = Object.fromEntries(products.results.map(p => [p.id, p]));

  for (const item of body.items) {
    const p = productMap[item.productId];
    if (!p) throw new AppError('PRODUCT_NOT_FOUND', `Product ${item.productId} not found`, 400);
    if (p.status !== 'active') throw new AppError('PRODUCT_UNAVAILABLE', `Product ${p.name} is not available`, 400);
    if (p.available_stock < item.quantity) throw new AppError('INSUFFICIENT_STOCK', `Not enough stock for ${p.name}`, 400);
  }

  // 3. Calculate totals
  const subtotal = body.items.reduce((sum, item) => {
    const p = productMap[item.productId]!;
    return sum + p.base_price * item.quantity;
  }, 0);

  let discount = 0;
  if (body.couponCode) {
    const coupon = await c.env.DB.prepare(
      `SELECT * FROM coupons WHERE code = ? AND active = 1
       AND (starts_at IS NULL OR starts_at <= unixepoch())
       AND (expires_at IS NULL OR expires_at > unixepoch())`
    ).bind(body.couponCode).first<{ id: string; type: string; value: number; min_order: number | null; max_discount: number | null; usage_limit: number | null; usage_count: number }>();

    if (!coupon) throw new AppError('INVALID_COUPON', 'Coupon is invalid or expired', 400);
    if (coupon.min_order && subtotal < coupon.min_order) throw new AppError('COUPON_MIN_ORDER', `Minimum order is ${coupon.min_order}`, 400);
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) throw new AppError('COUPON_EXHAUSTED', 'Coupon has been fully used', 400);

    if (coupon.type === 'percent') discount = Math.floor(subtotal * coupon.value / 100);
    else if (coupon.type === 'fixed') discount = coupon.value;
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  }

  const shippingFee = 30000; // Simplified — real: call GHN API
  const total = subtotal - discount + shippingFee;

  // 4. Create order (atomic via D1 batch)
  const orderId = crypto.randomUUID().replace(/-/g, '');
  const shippingAddressJson = JSON.stringify({
    fullName: address['full_name'], phone: address['phone'],
    line1: address['line1'], line2: address['line2'],
    ward: address['ward'], district: address['district'],
    province: address['province'], country: address['country'],
  });

  const stmts = [
    c.env.DB.prepare(
      `INSERT INTO orders (id, user_id, status, subtotal, shipping_fee, discount, total,
        shipping_address, coupon_code, gift_message, scheduled_date, note)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(orderId, userId, subtotal, shippingFee, discount, total,
      shippingAddressJson, body.couponCode ?? null,
      body.giftMessage ?? null, body.scheduledDate ?? null, body.note ?? null),
    ...body.items.map(item => {
      const p = productMap[item.productId]!;
      const itemId = crypto.randomUUID().replace(/-/g, '');
      return c.env.DB.prepare(
        `INSERT INTO order_items (id, order_id, seller_id, product_id, variant_id,
          product_name, quantity, unit_price, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      ).bind(itemId, orderId, p.seller_id, item.productId,
        item.variantId ?? null, p.name, item.quantity,
        p.base_price, p.base_price * item.quantity);
    }),
    // Reserve inventory
    ...body.items.map(item =>
      c.env.DB.prepare(
        `INSERT INTO inventory (id, product_id, quantity, reserved)
         VALUES (lower(hex(randomblob(16))), ?, 0, ?)
         ON CONFLICT(product_id) DO UPDATE SET reserved = reserved + ?`
      ).bind(item.productId, item.quantity, item.quantity)
    ),
  ];

  await c.env.DB.batch(stmts);

  // 5. Emit event to queue
  await c.env.ORDER_EVENTS.send({
    eventId: crypto.randomUUID(),
    type: 'order.created',
    orderId,
    userId,
    total,
  });

  return c.json(ok({ orderId, total, status: 'pending' }), 201);
});

checkoutRoutes.post('/calculate-shipping', authMiddleware, async (c) => {
  // Simplified — real implementation calls GHN/GHTK API
  return c.json(ok({
    methods: [
      { id: 'standard', name: 'Standard Shipping', fee: 30000, estimatedDays: '3–5' },
      { id: 'express', name: 'Express Shipping', fee: 55000, estimatedDays: '1–2' },
    ]
  }));
});

checkoutRoutes.post('/apply-coupon', authMiddleware, async (c) => {
  const { code, subtotal } = await c.req.json<{ code: string; subtotal: number }>();
  const coupon = await c.env.DB.prepare(
    `SELECT * FROM coupons WHERE code = ? AND active = 1
     AND (expires_at IS NULL OR expires_at > unixepoch())`
  ).bind(code).first<{ type: string; value: number; min_order: number | null; max_discount: number | null }>();

  if (!coupon) throw new AppError('INVALID_COUPON', 'Invalid or expired coupon');
  if (coupon.min_order && subtotal < coupon.min_order) {
    throw new AppError('COUPON_MIN_ORDER', `Minimum order amount is ${coupon.min_order} VND`);
  }

  let discount = 0;
  if (coupon.type === 'percent') discount = Math.floor(subtotal * coupon.value / 100);
  else if (coupon.type === 'fixed') discount = coupon.value;
  if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);

  return c.json(ok({ discount, code }));
});
