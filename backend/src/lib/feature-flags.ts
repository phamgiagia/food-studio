/**
 * Feature flags & alert config — stored in KV namespace `FEATURE_FLAGS`.
 * 
 * Usage:
 *   const flags = await getFeatureFlags(c.env.FEATURE_FLAGS);
 *   if (flags.monitoring.enabled) { ... }
 */

export interface AlertThresholds {
  errorRate: number;          // % of 5xx errors (default: 5%)
  orderFailureRate: number;   // % of failed orders (default: 10%)
  slowRequestMs: number;      // ms threshold for slow requests (default: 5000)
  lowInventoryCount: number;  // products below this stock = alert (default: 5)
  subscriptionChurnRate: number; // % churn before alert (default: 20%)
}

export interface CostAlertConfig {
  dailyApiRequestLimit: number;      // warn when > X requests/day
  dailyR2BandwidthMB: number;         // warn when > X MB R2 out
  monthlyQueueMessages: number;       // warn when > X queue msgs
  monthlyDurableObjectLimit: number;  // warn when > X DO requests
}

export interface FeatureFlags {
  monitoring: {
    enabled: boolean;
    alertChannels: ('console' | 'sentry' | 'email' | 'webhook')[];
    thresholds: AlertThresholds;
    costAlerts: CostAlertConfig;
  };
  subscriptions: {
    enabled: boolean;
    maxActivePerUser: number;
  };
  giftCards: {
    enabled: boolean;
    maxPerOrder: number;
  };
  search: {
    mode: 'd1' | 'meilisearch';
    meilisearchUrl?: string;
    meilisearchApiKey?: string;
  };
}

export const DEFAULT_FLAGS: FeatureFlags = {
  monitoring: {
    enabled: true,
    alertChannels: ['console', 'sentry'],
    thresholds: {
      errorRate: 5,
      orderFailureRate: 10,
      slowRequestMs: 5000,
      lowInventoryCount: 5,
      subscriptionChurnRate: 20,
    },
    costAlerts: {
      dailyApiRequestLimit: 100000,
      dailyR2BandwidthMB: 500,
      monthlyQueueMessages: 50000,
      monthlyDurableObjectLimit: 50000,
    },
  },
  subscriptions: {
    enabled: true,
    maxActivePerUser: 3,
  },
  giftCards: {
    enabled: true,
    maxPerOrder: 5,
  },
  search: {
    mode: 'd1',
  },
};

export async function getFeatureFlags(kv: KVNamespace): Promise<FeatureFlags> {
  try {
    const raw = await kv.get('feature-flags', 'json');
    if (raw) return raw as FeatureFlags;
  } catch {
    // Fall through to defaults
  }
  return DEFAULT_FLAGS;
}

export async function updateFeatureFlags(kv: KVNamespace, flags: Partial<FeatureFlags>): Promise<void> {
  const current = await getFeatureFlags(kv);
  const merged = deepMerge(current, flags);
  await kv.put('feature-flags', JSON.stringify(merged));
  console.log('[FEATURE_FLAGS] Updated:', JSON.stringify(merged));
}

function deepMerge<T extends Record<string, unknown>>(a: T, b: Partial<T>): T {
  const result = { ...a };
  for (const key of Object.keys(b) as (keyof T)[]) {
    const val = b[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && typeof result[key] === 'object') {
      result[key] = deepMerge(result[key] as Record<string, unknown>, val as Record<string, unknown>) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}