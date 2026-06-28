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
  VNPAY_SECRET: string;
  MOMO_KEY: string;
  SENDGRID_KEY: string;
  // Vars
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
}
