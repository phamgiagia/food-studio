import { Hono } from 'hono';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, paginated, AppError } from '../middleware/error';

export const orderRoutes = new Hono<{ Bindings: Env }>();

orderRoutes.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 10);
  const status = c.req.query('status');
  const offset = (page - 1) * limit;

  const conditions = ['o.user_id = ?'];
  const bindings: (string | number)[] = [userId];
  if (status) { conditions.push('o.status = ?'); bindings.push(status); }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [count, orders] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as total FROM orders o ${where}`).bind(...bindings).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT o.id, o.status, o.total, o.created_at,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o ${where}
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all(),
  ]);

  return c.json(paginated(orders.results, page, limit, count?.total ?? 0));
});

orderRoutes.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const order = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first();
  if (!order) throw new AppError('NOT_FOUND', 'Order not found', 404);

  const [items, shipments] = await Promise.all([
    c.env.DB.prepare(
      `SELECT oi.*, sp.store_name, sp.slug as seller_slug
       FROM order_items oi
       JOIN seller_profiles sp ON oi.seller_id = sp.id
       WHERE oi.order_id = ?`
    ).bind(id).all(),
    c.env.DB.prepare('SELECT * FROM shipments WHERE order_id = ?').bind(id).all(),
  ]);

  return c.json(ok({ ...order, items: items.results, shipments: shipments.results }));
});

orderRoutes.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const order = await c.env.DB.prepare(
    "SELECT id, status FROM orders WHERE id = ? AND user_id = ?"
  ).bind(id, userId).first<{ id: string; status: string }>();

  if (!order) throw new AppError('NOT_FOUND', 'Order not found', 404);
  if (order.status !== 'pending') throw new AppError('CANNOT_CANCEL', 'Order cannot be cancelled at this stage', 400);

  await c.env.DB.prepare(
    "UPDATE orders SET status = 'cancelled', updated_at = unixepoch() WHERE id = ?"
  ).bind(id).run();

  return c.json(ok({ message: 'Order cancelled' }));
});
