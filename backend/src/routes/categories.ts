import { Hono } from 'hono';
import type { Env } from '../types/env';
import { ok, AppError } from '../middleware/error';
import type { Category } from '@food-studio/types';

export const categoryRoutes = new Hono<{ Bindings: Env }>();

categoryRoutes.get('/', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC'
  ).all<Category & { parent_id: string | null }>();

  // Build tree
  const map = new Map<string, Category & { children: Category[] }>();
  const roots: (Category & { children: Category[] })[] = [];

  for (const row of rows.results) {
    map.set(row.id, { ...row, children: [] });
  }
  for (const row of rows.results) {
    const node = map.get(row.id)!;
    if (row.parent_id) {
      map.get(row.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return c.json(ok(roots));
});

categoryRoutes.get('/:id/products', async (c) => {
  const id = c.req.param('id');
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const offset = (page - 1) * limit;

  const category = await c.env.DB.prepare('SELECT id, name, slug FROM categories WHERE id = ?').bind(id).first();
  if (!category) throw new AppError('NOT_FOUND', 'Category not found', 404);

  const products = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.slug, p.base_price, p.rating, p.review_count, p.province,
            sp.store_name, sp.slug as seller_slug
     FROM products p
     JOIN seller_profiles sp ON p.seller_id = sp.id
     WHERE p.category_id = ? AND p.status = 'active'
     ORDER BY p.sold_count DESC LIMIT ? OFFSET ?`
  ).bind(id, limit, offset).all();

  return c.json(ok({ category, products: products.results }));
});
