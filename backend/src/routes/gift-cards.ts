import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, paginated, AppError } from '../middleware/error';

export const giftCardRoutes = new Hono<{ Bindings: Env }>();

// ── Helper: generate gift code ───────────────────────────
function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  return `GIFT-${pick()}${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}${pick()}`;
}

// ── Public: List gift card templates ─────────────────────
giftCardRoutes.get('/templates', async (c) => {
  const templates = await c.env.DB.prepare(
    "SELECT * FROM gift_card_templates WHERE active = 1 ORDER BY sort_order"
  ).all();
  return c.json(ok(templates.results));
});

// ── Public: Validate a gift card code ────────────────────
giftCardRoutes.get('/validate', async (c) => {
  const code = c.req.query('code');
  if (!code) throw new AppError('BAD_REQUEST', 'code query param is required', 400);

  const card = await c.env.DB.prepare(
    `SELECT id, amount, balance, recipient_name, message,
            hide_amount, expires_at
     FROM gift_cards
     WHERE code = ? AND status IN ('active', 'partially_used')
       AND (expires_at IS NULL OR expires_at > unixepoch())`
  ).bind(code).first();

  if (!card) throw new AppError('INVALID_GIFT_CARD', 'Mã quà tặng không hợp lệ hoặc đã hết hạn', 404);

  return c.json(ok(card));
});

// ── Authenticated: Buy a gift card ───────────────────────
const buySchema = z.object({
  templateId: z.string().optional(),
  recipientName: z.string().min(2).max(200),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  amount: z.number().int().positive(),
  message: z.string().max(1000).optional(),
  hideAmount: z.boolean().optional().default(false),
  designUrl: z.string().optional(),
});

giftCardRoutes.post('/buy', authMiddleware, zValidator('json', buySchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  // Validate amount against template
  if (body.templateId) {
    const template = await c.env.DB.prepare(
      'SELECT * FROM gift_card_templates WHERE id = ? AND active = 1'
    ).bind(body.templateId).first<{ min_amount: number; max_amount: number; denominations_json: string | null }>();

    if (!template) throw new AppError('INVALID_TEMPLATE', 'Gift card template not found', 404);

    if (body.amount < template.min_amount) {
      throw new AppError('AMOUNT_TOO_LOW', `Minimum amount is ${template.min_amount.toLocaleString('vi-VN')}đ`, 400);
    }
    if (body.amount > template.max_amount) {
      throw new AppError('AMOUNT_TOO_HIGH', `Maximum amount is ${template.max_amount.toLocaleString('vi-VN')}đ`, 400);
    }
  }

  // Generate unique code
  let code: string;
  let tries = 0;
  do {
    code = generateGiftCode();
    const existing = await c.env.DB.prepare('SELECT id FROM gift_cards WHERE code = ?').bind(code).first();
    if (!existing) break;
    tries++;
  } while (tries < 10);

  if (tries >= 10) throw new AppError('CODE_GEN_FAILED', 'Could not generate unique code', 500);

  const id = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = Math.floor(Date.now() / 1000) + 365 * 86400; // 1 year

  await c.env.DB.prepare(
    `INSERT INTO gift_cards (id, code, template_id, buyer_id, recipient_name,
      recipient_email, recipient_phone, amount, balance, message,
      hide_amount, design_url, status, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`
  ).bind(
    id, code, body.templateId ?? null, userId, body.recipientName,
    body.recipientEmail ?? null, body.recipientPhone ?? null,
    body.amount, body.amount, body.message ?? null,
    body.hideAmount ? 1 : 0, body.designUrl ?? null,
    expiresAt,
  ).run();

  return c.json(ok({ id, code, amount: body.amount, status: 'active' }), 201);
});

// ── Authenticated: My purchased gift cards ───────────────
giftCardRoutes.get('/mine', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const cards = await c.env.DB.prepare(
    `SELECT gc.*, gct.name as template_name
     FROM gift_cards gc
     LEFT JOIN gift_card_templates gct ON gc.template_id = gct.id
     WHERE gc.buyer_id = ?
     ORDER BY gc.created_at DESC`
  ).bind(userId).all();

  return c.json(ok(cards.results));
});

// ── Authenticated: Get single gift card ──────────────────
giftCardRoutes.get('/mine/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const card = await c.env.DB.prepare(
    `SELECT gc.*, gct.name as template_name
     FROM gift_cards gc
     LEFT JOIN gift_card_templates gct ON gc.template_id = gct.id
     WHERE gc.id = ? AND gc.buyer_id = ?`
  ).bind(id, userId).first();

  if (!card) throw new AppError('NOT_FOUND', 'Gift card not found', 404);

  const redemptions = await c.env.DB.prepare(
    `SELECT gcr.*, o.status as order_status, o.total as order_total
     FROM gift_card_redemptions gcr
     JOIN orders o ON gcr.order_id = o.id
     WHERE gcr.gift_card_id = ?
     ORDER BY gcr.created_at DESC`
  ).bind(id).all();

  return c.json(ok({ ...card, redemptions: redemptions.results }));
});

// ── Authenticated: Use a gift card on current cart ───────
giftCardRoutes.post('/apply', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { code, subtotal } = await c.req.json<{ code: string; subtotal: number }>();

  const card = await c.env.DB.prepare(
    `SELECT id, amount, balance, status, expires_at, buyer_id
     FROM gift_cards WHERE code = ? AND status IN ('active', 'partially_used')
       AND (expires_at IS NULL OR expires_at > unixepoch())`
  ).bind(code).first<{
    id: string; amount: number; balance: number; status: string;
    expires_at: number | null; buyer_id: string;
  }>();

  if (!card) throw new AppError('INVALID_GIFT_CARD', 'Invalid or expired gift card', 404);
  if (card.balance <= 0) throw new AppError('EXHAUSTED', 'Gift card has no remaining balance', 400);
  if (card.buyer_id === userId) throw new AppError('SELF_USE', 'Cannot use your own gift card', 400);

  const credit = Math.min(card.balance, subtotal);

  return c.json(ok({
    cardId: card.id,
    code,
    originalBalance: card.balance,
    credit,
    remainingBalance: card.balance - credit,
  }));
});

// ── Checkout: Commit gift card usage ─────────────────────
giftCardRoutes.post('/redeem', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { code, orderId, amount } = await c.req.json<{ code: string; orderId: string; amount: number }>();

  const order = await c.env.DB.prepare(
    'SELECT id, user_id, total FROM orders WHERE id = ? AND user_id = ?'
  ).bind(orderId, userId).first<{ id: string; user_id: string; total: number }>();
  if (!order) throw new AppError('NOT_FOUND', 'Order not found', 404);

  const card = await c.env.DB.prepare(
    `SELECT id, balance, status
     FROM gift_cards WHERE code = ? AND status IN ('active', 'partially_used')
       AND (expires_at IS NULL OR expires_at > unixepoch())`
  ).bind(code).first<{ id: string; balance: number; status: string }>();

  if (!card) throw new AppError('INVALID_GIFT_CARD', 'Invalid or expired gift card', 404);
  if (card.balance < amount) throw new AppError('INSUFFICIENT_BALANCE', 'Gift card has insufficient balance', 400);

  const newBalance = card.balance - amount;
  const newStatus = newBalance <= 0 ? 'exhausted' : 'partially_used';

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE gift_cards SET balance = ?, status = ?, updated_at = unixepoch() WHERE id = ?`
    ).bind(newBalance, newStatus, card.id),
    c.env.DB.prepare(
      `INSERT INTO gift_card_redemptions (id, gift_card_id, order_id, user_id, amount)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(crypto.randomUUID().replace(/-/g, ''), card.id, orderId, userId, amount),
  ]);

  return c.json(ok({ code, amount, newBalance, status: newStatus }));
});

// ── Admin: List all gift cards ───────────────────────────
giftCardRoutes.get('/admin/cards', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const status = c.req.query('status');
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const bindings: (string | number)[] = [];
  if (status) { conditions.push('gc.status = ?'); bindings.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [count, cards] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as total FROM gift_cards gc ${where}`).bind(...bindings).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT gc.*, u.full_name as buyer_name, gct.name as template_name
       FROM gift_cards gc
       JOIN users u ON gc.buyer_id = u.id
       LEFT JOIN gift_card_templates gct ON gc.template_id = gct.id
       ${where}
       ORDER BY gc.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all(),
  ]);

  return c.json(paginated(cards.results, page, limit, count?.total ?? 0));
});