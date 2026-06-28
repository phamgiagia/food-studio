import { Hono } from 'hono';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';

export const wishlistRoutes = new Hono<{ Bindings: Env }>();

wishlistRoutes.use('*', authMiddleware);

wishlistRoutes.get('/me', async (c) => {
  const userId = c.get('userId');
  const items = await c.env.DB.prepare(
    `SELECT w.id, w.product_id, w.created_at,
            p.name, p.slug, p.base_price, p.compare_price, p.province,
            p.rating_avg, p.review_count,
            sp.store_name, sp.slug as seller_slug
     FROM wishlists w
     JOIN products p ON w.product_id = p.id
     LEFT JOIN seller_profiles sp ON p.seller_id = sp.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`
  ).bind(userId).all();
  return c.json(ok(items.results));
});

wishlistRoutes.post('/', async (c) => {
  const userId = c.get('userId');
  const { productId } = await c.req.json<{ productId: string }>();
  if (!productId) throw new AppError('VALIDATION_ERROR', 'productId is required', 400);

  const existing = await c.env.DB.prepare(
    'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?'
  ).bind(userId, productId).first();

  if (existing) return c.json(ok({ added: false, message: 'Already in wishlist' }));

  const id = crypto.randomUUID().replace(/-/g, '');
  await c.env.DB.prepare(
    'INSERT INTO wishlists (id, user_id, product_id) VALUES (?, ?, ?)'
  ).bind(id, userId, productId).run();

  return c.json(ok({ added: true, id }), 201);
});

wishlistRoutes.delete('/:productId', async (c) => {
  const userId = c.get('userId');
  const productId = c.req.param('productId');
  await c.env.DB.prepare(
    'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?'
  ).bind(userId, productId).run();
  return c.json(ok({ removed: true }));
});
