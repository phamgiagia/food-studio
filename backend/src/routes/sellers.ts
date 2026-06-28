import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ok, paginated, AppError } from '../middleware/error';

export const sellerRoutes = new Hono<{ Bindings: Env }>();

sellerRoutes.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const region = c.req.query('region');
  const offset = (page - 1) * limit;

  const conditions = ["sp.status = 'approved'"];
  const bindings: (string | number)[] = [];
  if (region) { conditions.push('sp.region = ?'); bindings.push(region); }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [count, sellers] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as total FROM seller_profiles sp ${where}`).bind(...bindings).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT sp.id, sp.store_name, sp.slug, sp.description, sp.logo_url, sp.banner_url,
              sp.region, sp.province, sp.rating, sp.review_count, sp.verified
       FROM seller_profiles sp ${where}
       ORDER BY sp.verified DESC, sp.rating DESC NULLS LAST
       LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all(),
  ]);

  return c.json(paginated(sellers.results, page, limit, count?.total ?? 0));
});

sellerRoutes.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const seller = await c.env.DB.prepare(
    `SELECT sp.*, u.full_name as owner_name FROM seller_profiles sp
     JOIN users u ON sp.user_id = u.id
     WHERE sp.slug = ? AND sp.status = 'approved'`
  ).bind(slug).first();
  if (!seller) throw new AppError('NOT_FOUND', 'Seller not found', 404);
  return c.json(ok(seller));
});

const applySchema = z.object({
  storeName: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  story: z.string().max(5000).optional(),
  region: z.string(),
  province: z.string(),
  phone: z.string(),
});

sellerRoutes.post('/apply', authMiddleware, zValidator('json', applySchema), async (c) => {
  const data = c.req.valid('json');
  const userId = c.get('userId');

  const existing = await c.env.DB.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').bind(userId).first();
  if (existing) throw new AppError('ALREADY_APPLIED', 'You have already applied', 409);

  const id = crypto.randomUUID().replace(/-/g, '');
  const slug = data.storeName.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + id.slice(0, 6);

  await c.env.DB.prepare(
    `INSERT INTO seller_profiles (id, user_id, store_name, slug, description, story, region, province, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).bind(id, userId, data.storeName, slug, data.description ?? null, data.story ?? null, data.region, data.province).run();

  return c.json(ok({ id, slug, status: 'pending' }), 201);
});

sellerRoutes.get('/me', authMiddleware, requireRole('seller'), async (c) => {
  const userId = c.get('userId');
  const seller = await c.env.DB.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').bind(userId).first();
  if (!seller) throw new AppError('NOT_FOUND', 'Seller profile not found', 404);
  return c.json(ok(seller));
});

sellerRoutes.get('/me/stats', authMiddleware, requireRole('seller'), async (c) => {
  const userId = c.get('userId');
  const seller = await c.env.DB.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').bind(userId).first<{ id: string }>();
  if (!seller) throw new AppError('NOT_FOUND', 'Seller not found', 404);

  const [products, orders, revenue] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM products WHERE seller_id = ? AND status = 'active'").bind(seller.id).first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM order_items WHERE seller_id = ? AND status != 'cancelled'").bind(seller.id).first<{ count: number }>(),
    c.env.DB.prepare("SELECT SUM(total_price) as total FROM order_items WHERE seller_id = ? AND status = 'delivered'").bind(seller.id).first<{ total: number }>(),
  ]);

  return c.json(ok({
    activeProducts: products?.count ?? 0,
    totalOrders: orders?.count ?? 0,
    totalRevenue: revenue?.total ?? 0,
  }));
});
