import { describe, it, expect } from 'vitest';
import { verifyVnpaySignature, verifyMomoSignature } from '../lib/payment-verify';

// Pre-computed signatures for deterministic tests
// Generated with the same HMAC logic used in payment-verify.ts

const VNPAY_SECRET = 'test-vnpay-secret-key';
const MOMO_ACCESS_KEY = 'test-access-key';
const MOMO_SECRET = 'test-momo-secret';

// Helper to compute HMAC-SHA512 in Node environment (for generating test vectors)
async function hmacSha512(key: string, data: string): Promise<string> {
  const { createHmac } = await import('crypto');
  return createHmac('sha512', key).update(data).digest('hex');
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const { createHmac } = await import('crypto');
  return createHmac('sha256', key).update(data).digest('hex');
}

describe('verifyVnpaySignature', () => {
  it('returns true for a valid signature', async () => {
    const params: Record<string, string> = {
      vnp_Amount: '10000000',
      vnp_BankCode: 'NCB',
      vnp_OrderInfo: 'Thanh toan don hang #123',
      vnp_TxnRef: 'ORDER-123',
      vnp_ResponseCode: '00',
    };

    // Build the expected signature same way the function does
    const sortedKeys = Object.keys(params).sort();
    const rawData = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
    const sig = await hmacSha512(VNPAY_SECRET, rawData);

    const result = await verifyVnpaySignature(
      { ...params, vnp_SecureHash: sig },
      VNPAY_SECRET
    );
    expect(result).toBe(true);
  });

  it('returns false for a tampered parameter', async () => {
    const params: Record<string, string> = {
      vnp_Amount: '10000000',
      vnp_TxnRef: 'ORDER-123',
      vnp_ResponseCode: '00',
    };
    const sortedKeys = Object.keys(params).sort();
    const rawData = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
    const sig = await hmacSha512(VNPAY_SECRET, rawData);

    // Tamper the amount after signing
    const result = await verifyVnpaySignature(
      { ...params, vnp_Amount: '99999999', vnp_SecureHash: sig },
      VNPAY_SECRET
    );
    expect(result).toBe(false);
  });

  it('returns false when signature is missing', async () => {
    const result = await verifyVnpaySignature(
      { vnp_Amount: '10000000', vnp_TxnRef: 'ORDER-123' },
      VNPAY_SECRET
    );
    expect(result).toBe(false);
  });

  it('ignores vnp_SecureHashType in signature computation', async () => {
    const base: Record<string, string> = {
      vnp_Amount: '5000000',
      vnp_TxnRef: 'ORDER-456',
      vnp_ResponseCode: '00',
    };
    const sortedKeys = Object.keys(base).sort();
    const rawData = sortedKeys.map(k => `${k}=${base[k]}`).join('&');
    const sig = await hmacSha512(VNPAY_SECRET, rawData);

    // vnp_SecureHashType should be excluded from verification
    const result = await verifyVnpaySignature(
      { ...base, vnp_SecureHash: sig, vnp_SecureHashType: 'HmacSHA512' },
      VNPAY_SECRET
    );
    expect(result).toBe(true);
  });

  it('is case-insensitive for the hash value', async () => {
    const params: Record<string, string> = { vnp_TxnRef: 'ORDER-789' };
    const rawData = 'vnp_TxnRef=ORDER-789';
    const sig = await hmacSha512(VNPAY_SECRET, rawData);

    const result = await verifyVnpaySignature(
      { ...params, vnp_SecureHash: sig.toUpperCase() },
      VNPAY_SECRET
    );
    expect(result).toBe(true);
  });
});

describe('verifyMomoSignature', () => {
  const baseBody = {
    partnerCode: 'MOMO',
    orderId: 'ORDER-001',
    requestId: 'REQ-001',
    amount: 50000,
    orderInfo: 'Thanh toan dac san',
    orderType: 'momo_wallet',
    transId: 123456789,
    resultCode: 0,
    message: 'Successful',
    payType: 'qr',
    responseTime: 1700000000000,
    extraData: '',
    signature: '',
  };

  async function buildSig(body: typeof baseBody): Promise<string> {
    const raw = [
      `accessKey=${MOMO_ACCESS_KEY}`,
      `amount=${body.amount}`,
      `extraData=${body.extraData}`,
      `message=${body.message}`,
      `orderId=${body.orderId}`,
      `orderInfo=${body.orderInfo}`,
      `orderType=${body.orderType}`,
      `partnerCode=${body.partnerCode}`,
      `payType=${body.payType}`,
      `requestId=${body.requestId}`,
      `responseTime=${body.responseTime}`,
      `resultCode=${body.resultCode}`,
      `transId=${body.transId}`,
    ].join('&');
    return hmacSha256(MOMO_SECRET, raw);
  }

  it('returns true for a valid signature', async () => {
    const sig = await buildSig(baseBody);
    const result = await verifyMomoSignature(
      { ...baseBody, signature: sig },
      MOMO_ACCESS_KEY,
      MOMO_SECRET
    );
    expect(result).toBe(true);
  });

  it('returns false for wrong secret key', async () => {
    const sig = await buildSig(baseBody);
    const result = await verifyMomoSignature(
      { ...baseBody, signature: sig },
      MOMO_ACCESS_KEY,
      'wrong-secret'
    );
    expect(result).toBe(false);
  });

  it('returns false when amount is tampered', async () => {
    const sig = await buildSig(baseBody);
    const result = await verifyMomoSignature(
      { ...baseBody, amount: 1, signature: sig },
      MOMO_ACCESS_KEY,
      MOMO_SECRET
    );
    expect(result).toBe(false);
  });
});
