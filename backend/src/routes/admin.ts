import { Hono } from 'hono';
import type { Env } from '../types/env';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ok, paginated } from '../middleware/error';

export const adminRoutes = new Hono<{ Bindings: Env }>();

adminRoutes.use('*', authMiddleware, requireRole('admin', 'super_admin', 'staff', 'operations', 'finance', 'support'));

// Dashboard KPIs
adminRoutes.get('/analytics/overview', async (c) => {
  const [orders, revenue, sellers, users] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status != 'cancelled'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT SUM(total) as sum FROM orders WHERE status = 'delivered'").first<{ sum: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM seller_profiles WHERE status = 'approved'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").first<{ count: number }>(),
  ]);

  return c.json(ok({
    totalOrders: orders?.count ?? 0,
    totalRevenue: revenue?.sum ?? 0,
    activeSellers: sellers?.count ?? 0,
    totalCustomers: users?.count ?? 0,
  }));
});

// Sellers
adminRoutes.get('/sellers', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const status = c.req.query('status') ?? 'pending';
  const offset = (page - 1) * limit;

  const [count, sellers] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as total FROM seller_profiles WHERE status = ?').bind(status).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT sp.*, u.email, u.full_name as owner_name
       FROM seller_profiles sp JOIN users u ON sp.user_id = u.id
       WHERE sp.status = ? ORDER BY sp.created_at DESC LIMIT ? OFFSET ?`
    ).bind(status, limit, offset).all(),
  ]);

  return c.json(paginated(sellers.results, page, limit, count?.total ?? 0));
});

adminRoutes.patch('/sellers/:id/approve', requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare(
    "UPDATE seller_profiles SET status = 'approved', updated_at = unixepoch() WHERE id = ?"
  ).bind(id).run();
  await c.env.DB.prepare(
    "UPDATE users SET role = 'seller' WHERE id = (SELECT user_id FROM seller_profiles WHERE id = ?)"
  ).bind(id).run();
  return c.json(ok({ message: 'Seller approved' }));
});

adminRoutes.patch('/sellers/:id/suspend', requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare(
    "UPDATE seller_profiles SET status = 'suspended', updated_at = unixepoch() WHERE id = ?"
  ).bind(id).run();
  return c.json(ok({ message: 'Seller suspended' }));
});

// Orders
adminRoutes.get('/orders', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const status = c.req.query('status');
  const offset = (page - 1) * limit;

  const conditions = status ? ['o.status = ?'] : [];
  const bindings: (string | number)[] = status ? [status] : [];
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [count, orders] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as total FROM orders o ${where}`).bind(...bindings).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT o.*, u.full_name, u.email FROM orders o
       JOIN users u ON o.user_id = u.id ${where}
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all(),
  ]);

  return c.json(paginated(orders.results, page, limit, count?.total ?? 0));
});

adminRoutes.patch('/orders/:id/status', requireRole('admin', 'super_admin', 'operations'), async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json<{ status: string }>();
  const allowed = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) return c.json({ data: null, error: { code: 'INVALID_STATUS', message: 'Invalid status' } }, 400);

  await c.env.DB.prepare(
    'UPDATE orders SET status = ?, updated_at = unixepoch() WHERE id = ?'
  ).bind(status, id).run();

  return c.json(ok({ message: 'Order status updated' }));
});

// Products moderation
adminRoutes.get('/products', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const status = c.req.query('status') ?? 'draft';
  const offset = (page - 1) * limit;

  const [count, products] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as total FROM products WHERE status = ?').bind(status).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT p.*, sp.store_name FROM products p
       JOIN seller_profiles sp ON p.seller_id = sp.id
       WHERE p.status = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).bind(status, limit, offset).all(),
  ]);

  return c.json(paginated(products.results, page, limit, count?.total ?? 0));
});

adminRoutes.patch('/products/:id/status', requireRole('admin', 'super_admin', 'staff'), async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json<{ status: string }>();
  await c.env.DB.prepare('UPDATE products SET status = ?, updated_at = unixepoch() WHERE id = ?').bind(status, id).run();
  return c.json(ok({ message: 'Product status updated' }));
});
