import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ok, paginated, AppError } from '../middleware/error';

export const productRoutes = new Hono<{ Bindings: Env }>();

const listSchema = z.object({
  category: z.string().optional(),
  region: z.string().optional(),
  seller: z.string().optional(),
  q: z.string().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  sort: z.enum(['popular', 'newest', 'price_asc', 'price_desc', 'rating']).optional().default('newest'),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

productRoutes.get('/', zValidator('query', listSchema), async (c) => {
  const { category, region, seller, q, min_price, max_price, sort, featured, page, limit } = c.req.valid('query');

  const conditions: string[] = ["p.status = 'active'"];
  const bindings: (string | number)[] = [];

  if (category) { conditions.push('c.slug = ?'); bindings.push(category); }
  if (region) { conditions.push('p.region = ?'); bindings.push(region); }
  if (seller) { conditions.push('p.seller_id = ?'); bindings.push(seller); }
  if (q) { conditions.push("p.name LIKE ?"); bindings.push(`%${q}%`); }
  if (min_price !== undefined) { conditions.push('p.base_price >= ?'); bindings.push(min_price); }
  if (max_price !== undefined) { conditions.push('p.base_price <= ?'); bindings.push(max_price); }
  if (featured !== undefined) { conditions.push('p.featured = ?'); bindings.push(featured ? 1 : 0); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderMap: Record<string, string> = {
    popular: 'p.sold_count DESC',
    newest: 'p.created_at DESC',
    price_asc: 'p.base_price ASC',
    price_desc: 'p.base_price DESC',
    rating: 'p.rating DESC NULLS LAST',
  };
  const orderBy = orderMap[sort] ?? 'p.created_at DESC';
  const offset = (page - 1) * limit;

  const [countResult, products] = await Promise.all([
    c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN seller_profiles sp ON p.seller_id = sp.id
       ${where}`
    ).bind(...bindings).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT p.*, sp.store_name, sp.slug as seller_slug, sp.province as seller_province,
              sp.logo_url as seller_logo
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN seller_profiles sp ON p.seller_id = sp.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all(),
  ]);

  return c.json(paginated(products.results, page, limit, countResult?.total ?? 0));
});

productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [product, images, variants] = await Promise.all([
    c.env.DB.prepare(
      `SELECT p.*, sp.store_name, sp.slug as seller_slug, sp.logo_url as seller_logo,
              sp.province as seller_province, sp.rating as seller_rating
       FROM products p
       LEFT JOIN seller_profiles sp ON p.seller_id = sp.id
       WHERE p.id = ? AND p.status = 'active'`
    ).bind(id).first(),
    c.env.DB.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM product_variants WHERE product_id = ? AND active = 1').bind(id).all(),
  ]);

  if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404);

  await c.env.DB.prepare('UPDATE products SET view_count = view_count + 1 WHERE id = ?').bind(id).run();

  return c.json(ok({ ...product, images: images.results, variants: variants.results }));
});

productRoutes.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const product = await c.env.DB.prepare(
    "SELECT id FROM products WHERE slug = ? AND status = 'active'"
  ).bind(slug).first<{ id: string }>();
  if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404);
  c.req.param('id');
  return productRoutes.fetch(new Request(c.req.url.replace(`/slug/${slug}`, `/${product.id}`), c.req.raw), c.env);
});

const createSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  story: z.string().optional(),
  region: z.string(),
  province: z.string(),
  basePrice: z.number().int().positive(),
  comparePrice: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  weightGrams: z.number().int().optional(),
  shelfLifeDays: z.number().int().optional(),
  storageNotes: z.string().optional(),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
});

productRoutes.post('/', authMiddleware, requireRole('seller', 'admin', 'super_admin'), zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const userId = c.get('userId');

  const seller = await c.env.DB.prepare(
    "SELECT id FROM seller_profiles WHERE user_id = ? AND status = 'approved'"
  ).bind(userId).first<{ id: string }>();

  if (!seller && c.get('userRole') === 'seller') {
    throw new AppError('SELLER_NOT_APPROVED', 'Seller account not approved', 403);
  }

  const sellerId = seller?.id ?? c.req.valid('json');
  const id = crypto.randomUUID().replace(/-/g, '');
  const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id.slice(0, 8)}`;

  await c.env.DB.prepare(
    `INSERT INTO products (id, seller_id, category_id, name, slug, description, story,
      region, province, base_price, compare_price, sku, weight_grams, shelf_life_days,
      storage_notes, ingredients, allergens, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`
  ).bind(
    id, (seller as { id: string }).id, data.categoryId ?? null, data.name, slug,
    data.description ?? null, data.story ?? null, data.region, data.province,
    data.basePrice, data.comparePrice ?? null, data.sku ?? null,
    data.weightGrams ?? null, data.shelfLifeDays ?? null,
    data.storageNotes ?? null, data.ingredients ?? null, data.allergens ?? null
  ).run();

  return c.json(ok({ id, slug }), 201);
});

productRoutes.patch('/:id', authMiddleware, requireRole('seller', 'admin', 'super_admin'), async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();

  const product = await c.env.DB.prepare('SELECT seller_id FROM products WHERE id = ?').bind(id).first<{ seller_id: string }>();
  if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404);

  const userId = c.get('userId');
  const role = c.get('userRole');
  if (role === 'seller') {
    const seller = await c.env.DB.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').bind(userId).first<{ id: string }>();
    if (!seller || seller.id !== product.seller_id) throw new AppError('FORBIDDEN', 'Not your product', 403);
  }

  const allowed = ['name', 'description', 'story', 'base_price', 'compare_price', 'status', 'category_id', 'ingredients', 'allergens'];
  const updates = Object.entries(data)
    .filter(([k]) => allowed.includes(k))
    .map(([k, v]) => `${k} = ?`);
  const values = Object.entries(data).filter(([k]) => allowed.includes(k)).map(([, v]) => v);

  if (updates.length === 0) throw new AppError('BAD_REQUEST', 'No valid fields to update');

  await c.env.DB.prepare(
    `UPDATE products SET ${updates.join(', ')}, updated_at = unixepoch() WHERE id = ?`
  ).bind(...values, id).run();

  return c.json(ok({ id }));
});
