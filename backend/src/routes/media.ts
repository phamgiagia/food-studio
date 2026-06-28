import { Hono } from 'hono';
import type { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';
import { ok, AppError } from '../middleware/error';

export const mediaRoutes = new Hono<{ Bindings: Env }>();

mediaRoutes.post('/upload', authMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  if (!file) throw new AppError('BAD_REQUEST', 'No file provided');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) throw new AppError('INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP and AVIF are allowed');

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) throw new AppError('FILE_TOO_LARGE', 'File must be under 10MB');

  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { uploadedBy: c.get('userId') },
  });

  const url = `https://media.foodstudio.vn/${key}`;
  return c.json(ok({ url, key }), 201);
});

mediaRoutes.get('/signed-url', authMiddleware, async (c) => {
  const filename = c.req.query('filename');
  const contentType = c.req.query('contentType') ?? 'image/jpeg';
  if (!filename) throw new AppError('BAD_REQUEST', 'filename is required');

  const ext = filename.split('.').pop() ?? 'jpg';
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  // Note: R2 presigned URLs require Workers Paid plan
  // Return the key so the client can use multipart upload instead
  return c.json(ok({ key, uploadUrl: `/v1/media/upload`, contentType }));
});
