import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, paginated, AppError } from '../middleware/error';

export const reviewRoutes = new Hono<{ Bindings: Env }>();

reviewRoutes.get('/', async (c) => {
  const productId = c.req.query('product');
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 10);
  const offset = (page - 1) * limit;

  if (!productId) throw new AppError('BAD_REQUEST', 'product query param is required');

  const [count, reviews] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND status = 'published'")
      .bind(productId).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT r.*, u.full_name, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'published'
       ORDER BY r.helpful DESC, r.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(productId, limit, offset).all(),
  ]);

  return c.json(paginated(reviews.results, page, limit, count?.total ?? 0));
});

const createSchema = z.object({
  productId: z.string(),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

reviewRoutes.post('/', authMiddleware, zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');

  // Verify order belongs to user and is delivered (if orderId provided)
  if (data.orderId) {
    const order = await c.env.DB.prepare(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = 'delivered'"
    ).bind(data.orderId, userId).first();
    if (!order) throw new AppError('INVALID_ORDER', 'Order not found or not yet delivered', 400);
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?'
  ).bind(data.productId, userId).first();
  if (existing) throw new AppError('ALREADY_REVIEWED', 'You have already reviewed this product', 409);

  const id = crypto.randomUUID().replace(/-/g, '');
  await c.env.DB.prepare(
    `INSERT INTO reviews (id, product_id, user_id, order_id, rating, title, body, images_json, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')`
  ).bind(id, data.productId, userId, data.orderId ?? null, data.rating,
    data.title ?? null, data.body ?? null,
    data.images ? JSON.stringify(data.images) : null).run();

  // Update product rating
  await c.env.DB.prepare(
    `UPDATE products SET
       rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND status = 'published'),
       review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND status = 'published')
     WHERE id = ?`
  ).bind(data.productId, data.productId, data.productId).run();

  return c.json(ok({ id }), 201);
});

reviewRoutes.post('/:id/helpful', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE reviews SET helpful = helpful + 1 WHERE id = ?').bind(id).run();
  return c.json(ok({ message: 'Marked as helpful' }));
});
