import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import { signJwt, authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';

export const authRoutes = new Hono<{ Bindings: Env }>();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, fullName, phone } = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first<{ id: string }>();

  if (existing) throw new AppError('EMAIL_TAKEN', 'Email is already registered', 409);

  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID().replace(/-/g, '');

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, phone, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(userId, email, phone ?? null, fullName, 'customer', 'active').run();

  const [accessToken, refreshToken] = await Promise.all([
    signJwt({ sub: userId, email, role: 'customer' }, c.env.JWT_SECRET, 900),
    signJwt({ sub: userId, email, role: 'customer' }, c.env.JWT_REFRESH_SECRET, 60 * 60 * 24 * 30),
  ]);

  await c.env.SESSIONS.put(`session:${userId}:${refreshToken.slice(-8)}`, refreshToken, {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  return c.json(ok({ accessToken, refreshToken, expiresAt: Date.now() + 900_000 }), 201);
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await c.env.DB.prepare(
    'SELECT id, email, role, password_hash, status FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; email: string; role: string; password_hash: string; status: string }>();

  if (!user) throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  if (user.status === 'suspended') throw new AppError('ACCOUNT_SUSPENDED', 'Account suspended', 403);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);

  const role = user.role as 'customer' | 'seller' | 'staff' | 'admin' | 'super_admin';
  const [accessToken, refreshToken] = await Promise.all([
    signJwt({ sub: user.id, email: user.email, role }, c.env.JWT_SECRET, 900),
    signJwt({ sub: user.id, email: user.email, role }, c.env.JWT_REFRESH_SECRET, 60 * 60 * 24 * 30),
  ]);

  return c.json(ok({ accessToken, refreshToken, expiresAt: Date.now() + 900_000 }));
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare(
    'SELECT id, email, phone, full_name, avatar_url, role, status, mfa_enabled, created_at FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  return c.json(ok(user));
});

authRoutes.post('/logout', authMiddleware, async (c) => {
  return c.json(ok({ message: 'Logged out' }));
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const candidate = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  return candidate === hashHex;
}
