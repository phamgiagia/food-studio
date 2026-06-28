export interface Env {
  // D1
  DB: D1Database;
  // KV
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  FEATURE_FLAGS: KVNamespace;
  // R2
  MEDIA: R2Bucket;
  // Queues
  ORDER_EVENTS: Queue;
  NOTIFICATION_QUEUE: Queue;
  SEARCH_INDEXING: Queue;
  // Durable Objects
  CART: DurableObjectNamespace;
  INVENTORY_RESERVATION: DurableObjectNamespace;
  // Secrets
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  VNPAY_TMN_CODE: string;
  VNPAY_SECRET_KEY: string;
  MOMO_PARTNER_CODE: string;
  MOMO_ACCESS_KEY: string;
  MOMO_SECRET_KEY: string;
  ZALOPAY_APP_ID: string;
  ZALOPAY_KEY1: string;
  ZALOPAY_KEY2: string;
  SENDGRID_KEY: string;
  GHN_TOKEN: string;
  // Vars
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
}
