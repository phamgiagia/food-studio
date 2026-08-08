import type { Env } from '../types/env';

const GHN_BASE = 'https://online-gateway.ghn.vn/shiip/public-api/v2';
const FALLBACK_FEE = 30000; // same flat estimate used everywhere before this integration
const DIACRITICS_RE = /[̀-ͯ]/g;
const ADMIN_PREFIX_RE = /^(tinh|thanh pho|quan|huyen|thi xa|thi tran|phuong|xa)\s+/;

interface GhnProvince { ProvinceID: number; ProvinceName: string }
interface GhnDistrict { DistrictID: number; DistrictName: string }
interface GhnWard { WardCode: string; WardName: string }
interface GhnFeeResponse { total: number }

interface FeeParams {
  province: string;
  district: string;
  ward?: string | undefined;
  weightGrams: number;
  insuranceValue?: number | undefined;
}

interface FeeResult {
  fee: number;
  source: 'ghn' | 'fallback';
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(ADMIN_PREFIX_RE, '')
    .trim();
}

async function ghnPost<T>(env: Env, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${GHN_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Token: env.GHN_TOKEN,
      ...(env.GHN_SHOP_ID ? { ShopId: env.GHN_SHOP_ID } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GHN ${path} returned HTTP ${res.status}`);

  const json = await res.json() as { code: number; message: string; data: T };
  if (json.code !== 200) throw new Error(`GHN ${path} error: ${json.message}`);
  return json.data;
}

/**
 * Our `addresses` / recipient fields store free-text Vietnamese province/district/ward
 * names, not GHN's numeric location codes — this resolves one to the other by name
 * match against GHN's master-data endpoints. Returns null if no confident match found,
 * in which case the caller should fall back rather than call the fee API with a guess.
 */
async function resolveDistrict(env: Env, province: string, district: string): Promise<{ districtId: number } | null> {
  const provinces = await ghnPost<GhnProvince[]>(env, '/master-data/province', {});
  const targetProvince = normalizeName(province);
  const matchedProvince = provinces.find(p => normalizeName(p.ProvinceName) === targetProvince);
  if (!matchedProvince) return null;

  const districts = await ghnPost<GhnDistrict[]>(env, '/master-data/district', { province_id: matchedProvince.ProvinceID });
  const targetDistrict = normalizeName(district);
  const matchedDistrict = districts.find(d => normalizeName(d.DistrictName) === targetDistrict);
  if (!matchedDistrict) return null;

  return { districtId: matchedDistrict.DistrictID };
}

async function resolveWardCode(env: Env, districtId: number, ward: string): Promise<string | null> {
  const wards = await ghnPost<GhnWard[]>(env, '/master-data/ward', { district_id: districtId });
  const target = normalizeName(ward);
  return wards.find(w => normalizeName(w.WardName) === target)?.WardCode ?? null;
}

/**
 * Real GHN shipping fee, resolving addresses by name via master-data lookups.
 * Always resolves to a usable number: falls back to the flat estimate when GHN
 * isn't configured (GHN_TOKEN/SHOP_ID/FROM_DISTRICT_ID unset — true in every
 * environment this was built in, since we don't hold real GHN credentials),
 * when a district name can't be matched, or when the GHN API call itself fails.
 * Not verified against production GHN — the request/response shapes follow their
 * published v2 API docs but this has not been exercised against a live account.
 */
export async function getShippingFee(env: Env, params: FeeParams): Promise<FeeResult> {
  if (!env.GHN_TOKEN || !env.GHN_SHOP_ID || !env.GHN_FROM_DISTRICT_ID) {
    return { fee: FALLBACK_FEE, source: 'fallback' };
  }

  try {
    const located = await resolveDistrict(env, params.province, params.district);
    if (!located) return { fee: FALLBACK_FEE, source: 'fallback' };

    const wardCode = params.ward ? await resolveWardCode(env, located.districtId, params.ward) : null;

    const result = await ghnPost<GhnFeeResponse>(env, '/shipping-order/fee', {
      service_type_id: 2, // standard delivery
      from_district_id: Number(env.GHN_FROM_DISTRICT_ID),
      to_district_id: located.districtId,
      to_ward_code: wardCode ?? undefined,
      weight: Math.max(Math.round(params.weightGrams), 100),
      insurance_value: params.insuranceValue ?? 0,
    });

    return { fee: result.total, source: 'ghn' };
  } catch (err) {
    console.error('[GHN] Fee lookup failed, using fallback fee:', err);
    return { fee: FALLBACK_FEE, source: 'fallback' };
  }
}
