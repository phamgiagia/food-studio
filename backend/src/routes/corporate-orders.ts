import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';
import { getShippingFee } from '../lib/ghn';

export const corporateOrderRoutes = new Hono<{ Bindings: Env }>();

const recipientSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(8).max(20),
  line1: z.string().min(3).max(300),
  line2: z.string().max(300).optional(),
  ward: z.string().max(100).optional(),
  district: z.string().min(1).max(100),
  province: z.string().min(1).max(100),
  scheduledDate: z.number().optional(),
  giftMessage: z.string().max(500).optional(),
});

const createSchema = z.object({
  companyName: z.string().max(200).optional(),
  productId: z.string(),
  variantId: z.string().optional(),
  quantityPerRecipient: z.number().int().positive().default(1),
  paymentMethod: z.enum(['bank_transfer', 'cod']).default('bank_transfer'),
  hidePrice: z.boolean().optional().default(true),
  note: z.string().max(500).optional(),
  recipients: z.array(recipientSchema).min(2, 'Cần ít nhất 2 người nhận cho đơn hàng doanh nghiệp').max(500),
});

// ── Auth: create a corporate/bulk gift order ─────────────
corporateOrderRoutes.post('/', authMiddleware, zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const product = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.base_price, p.seller_id, p.status, p.weight_grams,
            COALESCE(inv.quantity - inv.reserved, 0) as available_stock
     FROM products p
     LEFT JOIN inventory inv ON inv.product_id = p.id
     WHERE p.id = ?`
  ).bind(body.productId).first<{
    id: string; name: string; base_price: number; seller_id: string; status: string;
    weight_grams: number | null; available_stock: number;
  }>();

  if (!product) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 400);
  if (product.status !== 'active') throw new AppError('PRODUCT_UNAVAILABLE', `Product ${product.name} is not available`, 400);

  const recipientCount = body.recipients.length;
  const totalQty = body.quantityPerRecipient * recipientCount;

  if (product.available_stock < totalQty) {
    throw new AppError('INSUFFICIENT_STOCK', `Not enough stock for ${product.name} (need ${totalQty}, have ${product.available_stock})`, 400);
  }

  const unitTotal = product.base_price * body.quantityPerRecipient;
  const subtotal = unitTotal * recipientCount;
  const recipientWeight = (product.weight_grams ?? 300) * body.quantityPerRecipient;

  const recipientFees = await Promise.all(body.recipients.map(r =>
    getShippingFee(c.env, {
      province: r.province, district: r.district, ward: r.ward,
      weightGrams: recipientWeight, insuranceValue: unitTotal,
    }).then(res => res.fee)
  ));
  const shippingFee = recipientFees.reduce((a, b) => a + b, 0);
  const total = subtotal + shippingFee;

  const corporateOrderId = crypto.randomUUID().replace(/-/g, '');
  const stmts: D1PreparedStatement[] = [
    c.env.DB.prepare(
      `INSERT INTO corporate_orders (id, user_id, company_name, product_id, variant_id,
        quantity_per_recipient, recipient_count, subtotal, shipping_fee, total, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      corporateOrderId, userId, body.companyName ?? null, body.productId, body.variantId ?? null,
      body.quantityPerRecipient, recipientCount, subtotal, shippingFee, total, body.paymentMethod, body.note ?? null,
    ),
  ];

  const orderIds: string[] = [];

  for (let i = 0; i < body.recipients.length; i++) {
    const r = body.recipients[i]!;
    const recipientFee = recipientFees[i]!;
    const orderId = crypto.randomUUID().replace(/-/g, '');
    orderIds.push(orderId);

    const shippingAddressJson = JSON.stringify({
      fullName: r.name, phone: r.phone, line1: r.line1, line2: r.line2 ?? null,
      ward: r.ward ?? null, district: r.district, province: r.province, country: 'VN',
    });

    stmts.push(
      c.env.DB.prepare(
        `INSERT INTO orders (id, user_id, status, subtotal, shipping_fee, discount, total,
          shipping_address, gift_message, gift_recipient_name, hide_price, scheduled_date, note)
         VALUES (?, ?, 'pending', ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        orderId, userId, unitTotal, recipientFee, unitTotal + recipientFee,
        shippingAddressJson, r.giftMessage ?? null, r.name, body.hidePrice ? 1 : 0, r.scheduledDate ?? null,
        body.companyName ? `Quà tặng doanh nghiệp — ${body.companyName}` : 'Quà tặng doanh nghiệp',
      ),
      c.env.DB.prepare(
        `INSERT INTO order_items (id, order_id, seller_id, product_id, variant_id,
          product_name, quantity, unit_price, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''), orderId, product.seller_id, body.productId,
        body.variantId ?? null, product.name, body.quantityPerRecipient, product.base_price, unitTotal,
      ),
      c.env.DB.prepare(
        `INSERT INTO corporate_order_recipients (id, corporate_order_id, order_id, recipient_name,
          recipient_phone, line1, line2, ward, district, province, scheduled_date, gift_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''), corporateOrderId, orderId, r.name, r.phone,
        r.line1, r.line2 ?? null, r.ward ?? null, r.district, r.province, r.scheduledDate ?? null, r.giftMessage ?? null,
      ),
    );
  }

  stmts.push(
    c.env.DB.prepare(
      `INSERT INTO inventory (id, product_id, quantity, reserved)
       VALUES (lower(hex(randomblob(16))), ?, 0, ?)
       ON CONFLICT(product_id) DO UPDATE SET reserved = reserved + ?`
    ).bind(body.productId, totalQty, totalQty),
  );

  await c.env.DB.batch(stmts);

  return c.json(ok({
    corporateOrderId,
    orderIds,
    recipientCount,
    total,
    paymentMethod: body.paymentMethod,
    status: 'pending_payment',
  }), 201);
});

// ── Auth: list my corporate orders ───────────────────────
corporateOrderRoutes.get('/mine', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const orders = await c.env.DB.prepare(
    `SELECT co.*, p.name as product_name
     FROM corporate_orders co
     JOIN products p ON co.product_id = p.id
     WHERE co.user_id = ?
     ORDER BY co.created_at DESC`
  ).bind(userId).all();

  return c.json(ok(orders.results));
});

// ── Auth: corporate order detail + recipients ────────────
corporateOrderRoutes.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const corp = await c.env.DB.prepare(
    `SELECT co.*, p.name as product_name
     FROM corporate_orders co
     JOIN products p ON co.product_id = p.id
     WHERE co.id = ? AND co.user_id = ?`
  ).bind(id, userId).first();
  if (!corp) throw new AppError('NOT_FOUND', 'Corporate order not found', 404);

  const recipients = await c.env.DB.prepare(
    `SELECT cor.*, o.status as order_status
     FROM corporate_order_recipients cor
     LEFT JOIN orders o ON cor.order_id = o.id
     WHERE cor.corporate_order_id = ?
     ORDER BY cor.created_at`
  ).bind(id).all();

  return c.json(ok({ ...corp, recipients: recipients.results }));
});

/**
 * Mark a corporate order (and every fan-out order it created) as paid.
 * Called from the admin panel once bank transfer / COD collection is confirmed —
 * there is no online gateway in the corporate-gifting flow yet (see re-golden-belly-plan.md).
 */
export async function confirmCorporateOrderPayment(env: Env, corporateOrderId: string): Promise<{ orderCount: number }> {
  const corp = await env.DB.prepare(
    "SELECT id, status FROM corporate_orders WHERE id = ?"
  ).bind(corporateOrderId).first<{ id: string; status: string }>();
  if (!corp) throw new AppError('NOT_FOUND', 'Corporate order not found', 404);
  if (corp.status === 'confirmed') return { orderCount: 0 };

  const recipients = await env.DB.prepare(
    'SELECT order_id FROM corporate_order_recipients WHERE corporate_order_id = ?'
  ).bind(corporateOrderId).all<{ order_id: string }>();

  const stmts: D1PreparedStatement[] = [
    env.DB.prepare("UPDATE corporate_orders SET status = 'confirmed', updated_at = unixepoch() WHERE id = ?").bind(corporateOrderId),
    ...recipients.results.map(r =>
      env.DB.prepare("UPDATE orders SET status = 'confirmed', updated_at = unixepoch() WHERE id = ?").bind(r.order_id)
    ),
  ];
  await env.DB.batch(stmts);

  for (const r of recipients.results) {
    await env.NOTIFICATION_QUEUE.send({
      type: 'email',
      template: 'new_order_seller',
      data: { orderId: r.order_id },
    });
  }

  return { orderCount: recipients.results.length };
}
