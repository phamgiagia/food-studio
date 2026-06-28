import { Hono } from 'hono';
import type { Env } from '../types/env';
import { verifyVnpaySignature, verifyMomoSignature, type MomoIpnBody } from '../lib/payment-verify';

export const paymentsRouter = new Hono<{ Bindings: Env }>();

// ─── VNPay ───────────────────────────────────────────────────────────────────

// GET /v1/payments/vnpay/return  — redirect from VNPay after user payment
paymentsRouter.get('/vnpay/return', async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams.entries());
  const secretKey = c.env.VNPAY_SECRET_KEY;

  const valid = await verifyVnpaySignature(params, secretKey);
  if (!valid) {
    return c.redirect('/checkout?payment=failed&reason=invalid_signature');
  }

  const responseCode = params.vnp_ResponseCode;
  const orderId = params.vnp_TxnRef;

  if (responseCode === '00') {
    // Payment succeeded — emit event to queue for async processing
    await c.env.ORDER_EVENTS.send({
      type: 'payment.succeeded',
      orderId,
      provider: 'vnpay',
      transactionId: params.vnp_TransactionNo,
      amount: Number(params.vnp_Amount) / 100,
      paidAt: Math.floor(Date.now() / 1000),
    });
    return c.redirect(`/orders/${orderId}?payment=success`);
  }

  return c.redirect(`/checkout?payment=failed&code=${responseCode}`);
});

// POST /v1/payments/vnpay/ipn  — VNPay server-to-server IPN
paymentsRouter.post('/vnpay/ipn', async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams.entries());
  const secretKey = c.env.VNPAY_SECRET_KEY;

  const valid = await verifyVnpaySignature(params, secretKey);
  if (!valid) {
    return c.json({ RspCode: '97', Message: 'Invalid signature' });
  }

  const responseCode = params.vnp_ResponseCode;
  const orderId = params.vnp_TxnRef;
  const amount = Number(params.vnp_Amount) / 100;

  // Verify order exists and amount matches
  const order = await c.env.DB.prepare(
    'SELECT id, total_amount, status FROM orders WHERE id = ?'
  ).bind(orderId).first<{ id: string; total_amount: number; status: string }>();

  if (!order) return c.json({ RspCode: '01', Message: 'Order not found' });
  if (order.total_amount !== amount) return c.json({ RspCode: '04', Message: 'Invalid amount' });
  if (order.status !== 'pending') return c.json({ RspCode: '02', Message: 'Order already processed' });

  if (responseCode === '00') {
    await c.env.ORDER_EVENTS.send({
      type: 'payment.succeeded',
      orderId,
      provider: 'vnpay',
      transactionId: params.vnp_TransactionNo,
      amount,
      paidAt: Math.floor(Date.now() / 1000),
    });
  } else {
    // Payment failed — update order to failed
    await c.env.DB.prepare(
      "UPDATE orders SET status = 'payment_failed', updated_at = unixepoch() WHERE id = ?"
    ).bind(orderId).run();
  }

  return c.json({ RspCode: '00', Message: 'Confirmed' });
});

// ─── MoMo ────────────────────────────────────────────────────────────────────

// POST /v1/payments/momo/ipn  — MoMo server-to-server IPN
paymentsRouter.post('/momo/ipn', async (c) => {
  const body = await c.req.json<MomoIpnBody>();
  const accessKey = c.env.MOMO_ACCESS_KEY;
  const secretKey = c.env.MOMO_SECRET_KEY;

  const valid = await verifyMomoSignature(body, accessKey, secretKey);
  if (!valid) {
    return c.json({ statusCode: 400, message: 'Invalid signature' }, 400);
  }

  const orderId = body.orderId;
  const amount = body.amount;

  const order = await c.env.DB.prepare(
    'SELECT id, total_amount, status FROM orders WHERE id = ?'
  ).bind(orderId).first<{ id: string; total_amount: number; status: string }>();

  if (!order) return c.json({ statusCode: 404, message: 'Order not found' }, 404);
  if (order.total_amount !== amount) return c.json({ statusCode: 400, message: 'Amount mismatch' }, 400);
  if (order.status !== 'pending') return c.json({ statusCode: 200, message: 'Already processed' });

  if (body.resultCode === 0) {
    await c.env.ORDER_EVENTS.send({
      type: 'payment.succeeded',
      orderId,
      provider: 'momo',
      transactionId: String(body.transId),
      amount,
      paidAt: Math.floor(Date.now() / 1000),
    });
  } else {
    await c.env.DB.prepare(
      "UPDATE orders SET status = 'payment_failed', updated_at = unixepoch() WHERE id = ?"
    ).bind(orderId).run();
  }

  return c.json({ statusCode: 200, message: 'Success' });
});

// ─── ZaloPay ─────────────────────────────────────────────────────────────────

// POST /v1/payments/zalopay/callback
paymentsRouter.post('/zalopay/callback', async (c) => {
  const body = await c.req.json<{ data: string; mac: string; type: number }>();

  // ZaloPay uses HMAC-SHA256 with key2
  const secretKey = c.env.ZALOPAY_KEY2;
  const keyBytes = new TextEncoder().encode(secretKey);
  const dataBytes = new TextEncoder().encode(body.data);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  const mac = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (mac !== body.mac) {
    return c.json({ return_code: -1, return_message: 'mac not equal' });
  }

  const parsed = JSON.parse(body.data) as { app_trans_id: string; amount: number };
  const orderId = parsed.app_trans_id.split('_')[1];

  if (body.type === 1) {
    await c.env.ORDER_EVENTS.send({
      type: 'payment.succeeded',
      orderId,
      provider: 'zalopay',
      transactionId: parsed.app_trans_id,
      amount: parsed.amount,
      paidAt: Math.floor(Date.now() / 1000),
    });
  }

  return c.json({ return_code: 1, return_message: 'success' });
});
