import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './types/env';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { categoryRoutes } from './routes/categories';
import { sellerRoutes } from './routes/sellers';
import { orderRoutes } from './routes/orders';
import { checkoutRoutes } from './routes/checkout';
import { reviewRoutes } from './routes/reviews';
import { mediaRoutes } from './routes/media';
import { adminRoutes } from './routes/admin';
import { paymentsRouter } from './routes/payments';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { CartDO } from './durable-objects/cart';
import { InventoryReservationDO } from './durable-objects/inventory-reservation';
import { handleOrderEvents } from './queues/order-events';

export { CartDO, InventoryReservationDO };

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: (origin, c) => {
    const allowed = [c.env.CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:3001'];
    return allowed.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.get('/health', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }));

// Payment webhooks — public, no auth middleware
app.route('/v1/payments', paymentsRouter);

// Public routes
app.route('/v1/auth', authRoutes);
app.route('/v1/products', productRoutes);
app.route('/v1/categories', categoryRoutes);
app.route('/v1/sellers', sellerRoutes);
app.route('/v1/reviews', reviewRoutes);

// Authenticated routes
app.use('/v1/orders/*', authMiddleware);
app.use('/v1/checkout/*', authMiddleware);
app.use('/v1/media/*', authMiddleware);
app.route('/v1/orders', orderRoutes);
app.route('/v1/checkout', checkoutRoutes);
app.route('/v1/media', mediaRoutes);

// Admin routes (auth + role check inside)
app.route('/v1/admin', adminRoutes);

app.onError(errorHandler);
app.notFound((c) => c.json({ data: null, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404));

export default {
  fetch: app.fetch,
  queue: handleOrderEvents,
};
