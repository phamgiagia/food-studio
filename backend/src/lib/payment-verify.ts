// Payment signature verification using Web Crypto API (CF Workers compatible)

async function hmacSha256(key: string, data: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const dataBytes = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha512(key: string, data: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const dataBytes = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * VNPay signature: sort all vnp_ params alphabetically (exclude vnp_SecureHash),
 * join as key=value&..., HMAC-SHA512 with secret key.
 */
export async function verifyVnpaySignature(
  params: Record<string, string>,
  secretKey: string
): Promise<boolean> {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;
  if (!vnp_SecureHash) return false;

  const sortedKeys = Object.keys(rest).filter(k => rest[k] !== '').sort();
  const rawData = sortedKeys.map(k => `${k}=${rest[k]}`).join('&');

  const expected = await hmacSha512(secretKey, rawData);
  return expected.toLowerCase() === vnp_SecureHash.toLowerCase();
}

/**
 * MoMo signature: build rawSignature string from specific fields in a fixed order,
 * HMAC-SHA256 with secret key.
 */
export type MomoIpnBody = {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
};

export async function verifyMomoSignature(
  body: MomoIpnBody,
  accessKey: string,
  secretKey: string
): Promise<boolean> {
  const raw = [
    `accessKey=${accessKey}`,
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

  const expected = await hmacSha256(secretKey, raw);
  return expected === body.signature;
}
