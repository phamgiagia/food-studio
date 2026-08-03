import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';

export const loyaltyRoutes = new Hono<{ Bindings: Env }>();

// ── Tier config ──────────────────────────────────────────
const TIERS = [
  { key: 'bronze', label: 'Đồng', min: 0, max: 1000, earnRate: 1, redeemRate: 100 },
  { key: 'silver', label: 'Bạc', min: 1000, max: 5000, earnRate: 1.2, redeemRate: 110 },
  { key: 'gold', label: 'Vàng', min: 5000, max: 15000, earnRate: 1.5, redeemRate: 120 },
  { key: 'platinum', label: 'Bạch Kim', min: 15000, max: Infinity, earnRate: 2, redeemRate: 130 },
] as const;

const POINTS_PER_VND = 0.001; // 1 point per 1,000 VND

// ── Auth: Get loyalty account + history ──────────────────
loyaltyRoutes.get('/account', authMiddleware, async (c) => {
  const userId = c.get('userId');

  let account = await c.env.DB.prepare(
    'SELECT * FROM loyalty_accounts WHERE user_id = ?'
  ).bind(userId).first<{ id: string; points: number; tier: string; created_at: number }>();

  // Auto-create if not exists
  if (!account) {
    const id = crypto.randomUUID().replace(/-/g, '');
    await c.env.DB.prepare(
      "INSERT INTO loyalty_accounts (id, user_id, points, tier) VALUES (?, ?, 0, 'bronze')"
    ).bind(id, userId).run();
    account = { id, points: 0, tier: 'bronze', created_at: Math.floor(Date.now() / 1000) };
  }

  // Recalculate tier based on points
  const currentTier = TIERS.filter(t => account.points >= t.min).pop() ?? TIERS[0];
  if (currentTier.key !== account.tier) {
    await c.env.DB.prepare(
      'UPDATE loyalty_accounts SET tier = ?, updated_at = unixepoch() WHERE id = ?'
    ).bind(currentTier.key, account.id).run();
    account.tier = currentTier.key;
  }

  // Transactions
  const transactions = await c.env.DB.prepare(
    `SELECT * FROM loyalty_transactions WHERE user_id = ?
     ORDER BY created_at DESC LIMIT 50`
  ).bind(userId).all();

  // Available rewards
  const rewards = await c.env.DB.prepare(
    "SELECT * FROM loyalty_rewards WHERE active = 1 ORDER BY sort_order"
  ).all();

  // Calculate next tier
  const nextTier = TIERS.find(t => t.key !== currentTier.key && t.min > account.points);

  return c.json(ok({
    account: {
      points: account.points,
      tier: currentTier.key,
      tierLabel: currentTier.label,
      earnRate: currentTier.earnRate,
      redeemRate: currentTier.redeemRate,
    },
    nextTier: nextTier ? {
      key: nextTier.key,
      label: nextTier.label,
      pointsNeeded: nextTier.min - account.points,
    } : null,
    transactions: transactions.results,
    rewards: rewards.results,
    tiers: TIERS.map(t => ({ key: t.key, label: t.label, min: t.min })),
  }));
});

// ── Auth: Redeem points for a reward ─────────────────────
const redeemSchema = z.object({
  rewardId: z.string(),
});

loyaltyRoutes.post('/redeem', authMiddleware, zValidator('json', redeemSchema), async (c) => {
  const userId = c.get('userId');
  const { rewardId } = c.req.valid('json');

  // Get reward
  const reward = await c.env.DB.prepare(
    'SELECT * FROM loyalty_rewards WHERE id = ? AND active = 1'
  ).bind(rewardId).first<{
    id: string; name: string; points_required: number; type: string; value_json: string | null; stock: number | null;
  }>();
  if (!reward) throw new AppError('NOT_FOUND', 'Reward not found', 404);

  // Check stock
  if (reward.stock !== null && reward.stock <= 0) {
    throw new AppError('OUT_OF_STOCK', 'Reward is out of stock', 400);
  }

  // Get account
  const account = await c.env.DB.prepare(
    'SELECT id, points FROM loyalty_accounts WHERE user_id = ?'
  ).bind(userId).first<{ id: string; points: number }>();
  if (!account) throw new AppError('NOT_FOUND', 'Loyalty account not found', 404);

  if (account.points < reward.points_required) {
    throw new AppError('INSUFFICIENT_POINTS',
      `Cần ${reward.points_required} điểm, bạn chỉ có ${account.points}`, 400);
  }

  const newBalance = account.points - reward.points_required;

  // Create transaction + update balance + (optionally) generate coupon
  const txId = crypto.randomUUID().replace(/-/g, '');
  const stmts: D1PreparedStatement[] = [
    c.env.DB.prepare(
      `INSERT INTO loyalty_transactions (id, user_id, type, points, balance, note, reference_type, reference_id)
       VALUES (?, ?, 'redeem', ?, ?, ?, 'redeem', ?)`
    ).bind(txId, userId, -reward.points_required, newBalance, `Đổi: ${reward.name}`, reward.id),

    c.env.DB.prepare(
      'UPDATE loyalty_accounts SET points = ?, updated_at = unixepoch() WHERE id = ?'
    ).bind(newBalance, account.id),
  ];

  // If reward is coupon type, generate a coupon code
  if (reward.type === 'coupon' && reward.value_json) {
    const value = JSON.parse(reward.value_json);
    const couponCode = `LOYAL${userId.slice(0, 4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    const isPercent = value.discount_percent != null;
    const dcType = isPercent ? 'percent' : 'fixed';
    const dcValue = isPercent ? value.discount_percent : value.discount_fixed;

    stmts.push(c.env.DB.prepare(
      `INSERT INTO coupons (id, code, type, value, min_order, max_discount, usage_limit, per_user_limit, expires_at, active)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 1)`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      couponCode, dcType, dcValue,
      value.min_order ?? null,
      value.max_discount ?? null,
      Math.floor(Date.now() / 1000) + 30 * 86400, // 30 days
    ));
  }

  // If free_shipping, create a coupon with shipping discount
  if (reward.type === 'free_shipping') {
    const couponCode = `SHIPFREE${userId.slice(0, 4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    stmts.push(c.env.DB.prepare(
      `INSERT INTO coupons (id, code, type, value, min_order, usage_limit, per_user_limit, expires_at, active)
       VALUES (?, ?, 'free_shipping', 0, 0, 1, 1, ?, 1)`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      couponCode,
      Math.floor(Date.now() / 1000) + 30 * 86400,
    ));
  }

  // Deduct stock if applicable
  if (reward.stock !== null) {
    stmts.push(c.env.DB.prepare(
      'UPDATE loyalty_rewards SET stock = stock - 1 WHERE id = ?'
    ).bind(reward.id));
  }

  await c.env.DB.batch(stmts);

  return c.json(ok({ transactionId: txId, newBalance, rewardName: reward.name }));
});

// ── Admin: List rewards ──────────────────────────────────
loyaltyRoutes.get('/admin/rewards', async (c) => {
  const rewards = await c.env.DB.prepare(
    'SELECT * FROM loyalty_rewards ORDER BY sort_order'
  ).all();
  return c.json(ok(rewards.results));
});

// ── Admin: Create/update reward ──────────────────────────
loyaltyRoutes.post('/admin/rewards', async (c) => {
  const data = await c.req.json<{
    name: string; description?: string; pointsRequired: number; type: string;
    valueJson?: string; active?: boolean; stock?: number;
  }>();

  const id = crypto.randomUUID().replace(/-/g, '');
  await c.env.DB.prepare(
    `INSERT INTO loyalty_rewards (id, name, description, points_required, type, value_json, active, stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, data.name, data.description ?? null, data.pointsRequired,
    data.type, data.valueJson ?? null,
    data.active !== false ? 1 : 0,
    data.stock ?? null,
  ).run();

  return c.json(ok({ id }), 201);
});

export { TIERS, POINTS_PER_VND };

/**
 * Earn points for a completed order.
 * Called from the order-events queue handler on delivery.
 */
export async function earnPointsForOrder(env: Env, userId: string, orderId: string, subtotal: number): Promise<void> {
  const pointsEarned = Math.floor(subtotal * POINTS_PER_VND);

  let account = await env.DB.prepare(
    'SELECT id, points FROM loyalty_accounts WHERE user_id = ?'
  ).bind(userId).first<{ id: string; points: number }>();

  if (!account) {
    const id = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare(
      "INSERT INTO loyalty_accounts (id, user_id, points, tier) VALUES (?, ?, 0, 'bronze')"
    ).bind(id, userId).run();
    account = { id, points: 0 };
  }

  const newBalance = account.points + pointsEarned;
  const txId = crypto.randomUUID().replace(/-/g, '');

  const currentTier = TIERS.filter(t => newBalance >= t.min).pop() ?? TIERS[0];

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO loyalty_transactions (id, user_id, type, points, balance, note, reference_type, reference_id)
       VALUES (?, ?, 'earn', ?, ?, ?, 'order', ?)`
    ).bind(txId, userId, pointsEarned, newBalance, `Tích điểm đơn hàng #${orderId.slice(0, 8)}`, orderId),
    env.DB.prepare(
      'UPDATE loyalty_accounts SET points = ?, tier = ?, updated_at = unixepoch() WHERE id = ?'
    ).bind(newBalance, currentTier.key, account.id),
  ]);
}