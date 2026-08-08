import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';
import { getShippingFee } from '../lib/ghn';

export const eGiftRoutes = new Hono<{ Bindings: Env }>();

const EXPIRES_DAYS = 90;

function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  return `EGIFT-${pick()}${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}${pick()}`;
}

const createSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().min(8).optional(),
  message: z.string().max(500).optional(),
  hidePrice: z.boolean().optional().default(true),
}).refine(d => d.recipientEmail || d.recipientPhone, {
  message: 'Cần ít nhất email hoặc số điện thoại người nhận',
  path: ['recipientEmail'],
});

// ── Auth: sender sends an e-gift ─────────────────────────
eGiftRoutes.post('/', authMiddleware, zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const product = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.base_price, p.status,
            COALESCE(inv.quantity - inv.reserved, 0) as available_stock
     FROM products p
     LEFT JOIN inventory inv ON inv.product_id = p.id
     WHERE p.id = ?`
  ).bind(body.productId).first<{ id: string; name: string; base_price: number; status: string; available_stock: number }>();

  if (!product) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 400);
  if (product.status !== 'active') throw new AppError('PRODUCT_UNAVAILABLE', `Product ${product.name} is not available`, 400);
  if (product.available_stock < body.quantity) {
    throw new AppError('INSUFFICIENT_STOCK', `Not enough stock for ${product.name}`, 400);
  }

  let code = '';
  let tries = 0;
  do {
    code = generateGiftCode();
    const existing = await c.env.DB.prepare('SELECT id FROM e_gifts WHERE code = ?').bind(code).first();
    if (!existing) break;
    tries++;
  } while (tries < 10);
  if (tries >= 10) throw new AppError('CODE_GEN_FAILED', 'Could not generate gift code', 500);

  const id = crypto.randomUUID().replace(/-/g, '');
  const subtotal = product.base_price * body.quantity;
  const expiresAt = Math.floor(Date.now() / 1000) + EXPIRES_DAYS * 86400;

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO e_gifts (id, code, sender_id, product_id, variant_id, quantity, unit_price, subtotal,
        recipient_email, recipient_phone, message, hide_price, status, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`
    ).bind(
      id, code, userId, body.productId, body.variantId ?? null, body.quantity, product.base_price, subtotal,
      body.recipientEmail ?? null, body.recipientPhone ?? null, body.message ?? null, body.hidePrice ? 1 : 0, expiresAt,
    ),
    // Reserve stock now — the sender already "paid"; redemption just attaches a delivery address
    c.env.DB.prepare(
      `INSERT INTO inventory (id, product_id, quantity, reserved)
       VALUES (lower(hex(randomblob(16))), ?, 0, ?)
       ON CONFLICT(product_id) DO UPDATE SET reserved = reserved + ?`
    ).bind(body.productId, body.quantity, body.quantity),
  ]);

  if (body.recipientEmail) {
    await c.env.NOTIFICATION_QUEUE.send({
      type: 'email',
      template: 'egift_received',
      data: { recipientEmail: body.recipientEmail, code, productName: product.name, message: body.message },
    });
  }

  return c.json(ok({ id, code, status: 'active', expiresAt }), 201);
});

// ── Public: preview a gift before login/redeem ───────────
eGiftRoutes.get('/validate/:code', async (c) => {
  const code = c.req.param('code');

  const gift = await c.env.DB.prepare(
    `SELECT eg.quantity, eg.message, eg.hide_price, eg.status, eg.expires_at,
            p.name as product_name, u.full_name as sender_name
     FROM e_gifts eg
     JOIN products p ON eg.product_id = p.id
     JOIN users u ON eg.sender_id = u.id
     WHERE eg.code = ?`
  ).bind(code).first<{
    quantity: number; message: string | null; hide_price: number; status: string; expires_at: number;
    product_name: string; sender_name: string;
  }>();

  if (!gift) return c.json(ok({ valid: false }));
  const expired = gift.status === 'active' && gift.expires_at < Math.floor(Date.now() / 1000);
  if (gift.status !== 'active' || expired) {
    return c.json(ok({ valid: false, status: expired ? 'expired' : gift.status }));
  }

  return c.json(ok({
    valid: true,
    productName: gift.product_name,
    quantity: gift.quantity,
    senderName: gift.sender_name.split(' ').slice(-1)[0],
    message: gift.message,
    hidePrice: !!gift.hide_price,
  }));
});

const redeemSchema = z.object({
  recipientName: z.string().min(2).max(200),
  phone: z.string().min(8).max(20),
  line1: z.string().min(3).max(300),
  line2: z.string().max(300).optional(),
  ward: z.string().max(100).optional(),
  district: z.string().min(1).max(100),
  province: z.string().min(1).max(100),
  scheduledDate: z.number().optional(),
});

// ── Auth: recipient redeems — creates the real order ─────
eGiftRoutes.post('/:code/redeem', authMiddleware, zValidator('json', redeemSchema), async (c) => {
  const userId = c.get('userId');
  const code = c.req.param('code');
  const body = c.req.valid('json');

  const gift = await c.env.DB.prepare(
    `SELECT eg.id, eg.product_id, eg.variant_id, eg.quantity, eg.unit_price, eg.subtotal,
            eg.message, eg.hide_price, eg.status, eg.expires_at, p.name as product_name, p.seller_id, p.weight_grams
     FROM e_gifts eg JOIN products p ON eg.product_id = p.id
     WHERE eg.code = ?`
  ).bind(code).first<{
    id: string; product_id: string; variant_id: string | null; quantity: number; unit_price: number;
    subtotal: number; message: string | null; hide_price: number; status: string; expires_at: number;
    product_name: string; seller_id: string; weight_grams: number | null;
  }>();

  if (!gift) throw new AppError('NOT_FOUND', 'Gift not found', 404);
  if (gift.status !== 'active') throw new AppError('ALREADY_REDEEMED', 'Gift has already been redeemed or cancelled', 400);
  if (gift.expires_at < Math.floor(Date.now() / 1000)) throw new AppError('EXPIRED', 'Gift has expired', 400);

  const orderId = crypto.randomUUID().replace(/-/g, '');
  const { fee: shippingFee } = await getShippingFee(c.env, {
    province: body.province, district: body.district, ward: body.ward,
    weightGrams: (gift.weight_grams ?? 300) * gift.quantity, insuranceValue: gift.subtotal,
  });
  const total = gift.subtotal + shippingFee;
  const shippingAddressJson = JSON.stringify({
    fullName: body.recipientName, phone: body.phone, line1: body.line1, line2: body.line2 ?? null,
    ward: body.ward ?? null, district: body.district, province: body.province, country: 'VN',
  });

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO orders (id, user_id, status, subtotal, shipping_fee, discount, total,
        shipping_address, gift_message, hide_price, note)
       VALUES (?, ?, 'pending', ?, ?, 0, ?, ?, ?, ?, 'Quà tặng qua email (E-Gift)')`
    ).bind(orderId, userId, gift.subtotal, shippingFee, total, shippingAddressJson, gift.message ?? null, gift.hide_price),
    c.env.DB.prepare(
      `INSERT INTO order_items (id, order_id, seller_id, product_id, variant_id,
        product_name, quantity, unit_price, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''), orderId, gift.seller_id, gift.product_id,
      gift.variant_id, gift.product_name, gift.quantity, gift.unit_price, gift.subtotal,
    ),
    c.env.DB.prepare(
      "UPDATE e_gifts SET status = 'redeemed', redeemed_order_id = ?, redeemed_at = unixepoch() WHERE id = ?"
    ).bind(orderId, gift.id),
  ]);

  await c.env.ORDER_EVENTS.send({ eventId: crypto.randomUUID(), type: 'order.created', orderId, userId, total });

  return c.json(ok({ orderId, total, status: 'pending' }), 201);
});
