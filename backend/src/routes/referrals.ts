import { Hono } from 'hono';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';

export const referralRoutes = new Hono<{ Bindings: Env }>();

const REWARD_AMOUNT = 50000; // VND — "Tặng 50K, nhận 50K"
const COUPON_VALID_DAYS = 60;

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');

function generateReferralCode(fullName: string): string {
  const base = fullName
    .normalize('NFD').replace(DIACRITICS_RE, '') // strip diacritics
    .replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'BAN';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

function generateCouponCode(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ── Auth: get-or-create my referral code + stats ─────────
referralRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  let codeRow = await c.env.DB.prepare(
    'SELECT code FROM referral_codes WHERE user_id = ?'
  ).bind(userId).first<{ code: string }>();

  if (!codeRow) {
    const user = await c.env.DB.prepare('SELECT full_name FROM users WHERE id = ?')
      .bind(userId).first<{ full_name: string }>();

    let code = '';
    let tries = 0;
    do {
      code = generateReferralCode(user?.full_name ?? 'BAN');
      const existing = await c.env.DB.prepare('SELECT id FROM referral_codes WHERE code = ?').bind(code).first();
      if (!existing) break;
      tries++;
    } while (tries < 10);
    if (tries >= 10) throw new AppError('CODE_GEN_FAILED', 'Could not generate referral code', 500);

    await c.env.DB.prepare(
      'INSERT INTO referral_codes (id, user_id, code) VALUES (?, ?, ?)'
    ).bind(crypto.randomUUID().replace(/-/g, ''), userId, code).run();
    codeRow = { code };
  }

  const referrals = await c.env.DB.prepare(
    `SELECT r.status, r.rewarded_at, r.created_at, u.full_name as referred_name
     FROM referrals r JOIN users u ON r.referred_user_id = u.id
     WHERE r.referrer_id = ? ORDER BY r.created_at DESC`
  ).bind(userId).all<{ status: string; rewarded_at: number | null; created_at: number; referred_name: string }>();

  const rewardedCount = referrals.results.filter(r => r.status === 'rewarded').length;

  return c.json(ok({
    code: codeRow.code,
    rewardAmount: REWARD_AMOUNT,
    stats: {
      totalReferred: referrals.results.length,
      totalRewarded: rewardedCount,
      totalEarned: rewardedCount * REWARD_AMOUNT,
    },
    referrals: referrals.results.map(r => ({
      referredName: r.referred_name,
      status: r.status,
      createdAt: r.created_at,
      rewardedAt: r.rewarded_at,
    })),
  }));
});

// ── Public: validate a referral code (shown at registration) ──
referralRoutes.get('/validate', async (c) => {
  const code = c.req.query('code');
  if (!code) throw new AppError('BAD_REQUEST', 'code query param is required', 400);

  const row = await c.env.DB.prepare(
    `SELECT u.full_name FROM referral_codes rc
     JOIN users u ON rc.user_id = u.id
     WHERE rc.code = ? AND u.status = 'active'`
  ).bind(code.toUpperCase()).first<{ full_name: string }>();

  if (!row) return c.json(ok({ valid: false }));
  return c.json(ok({ valid: true, referrerName: row.full_name.split(' ').slice(-1)[0] }));
});

/**
 * Link a new user to whoever referred them. Called from auth.ts on register.
 * Invalid/missing codes are ignored — referral is a bonus, never blocks signup.
 */
export async function applyReferralOnRegister(env: Env, rawCode: string | undefined, referredUserId: string): Promise<void> {
  if (!rawCode) return;
  const code = rawCode.toUpperCase();

  const codeRow = await env.DB.prepare(
    'SELECT user_id FROM referral_codes WHERE code = ?'
  ).bind(code).first<{ user_id: string }>();
  if (!codeRow || codeRow.user_id === referredUserId) return;

  await env.DB.prepare(
    `INSERT OR IGNORE INTO referrals (id, referrer_id, referred_user_id, code, status)
     VALUES (?, ?, ?, ?, 'pending')`
  ).bind(crypto.randomUUID().replace(/-/g, ''), codeRow.user_id, referredUserId, code).run();
}

/**
 * Reward both sides of a referral once the referred user's FIRST order is paid.
 * Called from the order-events queue handler on payment.succeeded.
 */
export async function rewardReferralIfEligible(env: Env, userId: string, _orderId: string): Promise<void> {
  const referral = await env.DB.prepare(
    "SELECT id, referrer_id FROM referrals WHERE referred_user_id = ? AND status = 'pending'"
  ).bind(userId).first<{ id: string; referrer_id: string }>();
  if (!referral) return;

  const paidOrders = await env.DB.prepare(
    "SELECT COUNT(*) as n FROM orders WHERE user_id = ? AND status != 'pending'"
  ).bind(userId).first<{ n: number }>();
  if (!paidOrders || paidOrders.n !== 1) return; // not their first paid order

  const expiresAt = Math.floor(Date.now() / 1000) + COUPON_VALID_DAYS * 86400;
  const referrerCoupon = generateCouponCode('REFR');
  const referredCoupon = generateCouponCode('REFD');

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO coupons (id, code, type, value, usage_limit, per_user_limit, expires_at, active)
       VALUES (?, ?, 'fixed', ?, 1, 1, ?, 1)`
    ).bind(crypto.randomUUID().replace(/-/g, ''), referrerCoupon, REWARD_AMOUNT, expiresAt),
    env.DB.prepare(
      `INSERT INTO coupons (id, code, type, value, usage_limit, per_user_limit, expires_at, active)
       VALUES (?, ?, 'fixed', ?, 1, 1, ?, 1)`
    ).bind(crypto.randomUUID().replace(/-/g, ''), referredCoupon, REWARD_AMOUNT, expiresAt),
    env.DB.prepare(
      `UPDATE referrals SET status = 'rewarded', referrer_coupon_code = ?, referred_coupon_code = ?, rewarded_at = unixepoch()
       WHERE id = ?`
    ).bind(referrerCoupon, referredCoupon, referral.id),
  ]);

  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'referral_rewarded',
    userId: referral.referrer_id,
    data: { couponCode: referrerCoupon, amount: REWARD_AMOUNT },
  });
  await env.NOTIFICATION_QUEUE.send({
    type: 'email',
    template: 'referral_rewarded',
    userId,
    data: { couponCode: referredCoupon, amount: REWARD_AMOUNT },
  });
}
