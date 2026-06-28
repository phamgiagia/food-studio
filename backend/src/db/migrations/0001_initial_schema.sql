-- Migration 0001: Initial schema
-- Apply with: wrangler d1 migrations apply food-studio-db-prod

-- Copy the full schema from docs/database.md here
-- (Keeping this file as the canonical migration source)

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT UNIQUE,
  full_name   TEXT NOT NULL,
  password_hash TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer','seller','staff','admin','super_admin')),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','suspended','pending','deleted')),
  mfa_enabled INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  device     TEXT,
  ip         TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS addresses (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  line1       TEXT NOT NULL,
  line2       TEXT,
  ward        TEXT,
  district    TEXT NOT NULL,
  province    TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'VN',
  postal_code TEXT,
  is_default  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS seller_profiles (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id         TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name      TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  story           TEXT,
  logo_url        TEXT,
  banner_url      TEXT,
  region          TEXT NOT NULL,
  province        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','suspended','rejected')),
  commission_rate REAL NOT NULL DEFAULT 0.10,
  rating          REAL,
  review_count    INTEGER NOT NULL DEFAULT 0,
  verified        INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  parent_id   TEXT REFERENCES categories(id),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  seller_id        TEXT NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  category_id      TEXT REFERENCES categories(id),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  story            TEXT,
  region           TEXT NOT NULL,
  province         TEXT NOT NULL,
  base_price       INTEGER NOT NULL,
  compare_price    INTEGER,
  sku              TEXT,
  weight_grams     INTEGER,
  shelf_life_days  INTEGER,
  storage_notes    TEXT,
  ingredients      TEXT,
  allergens        TEXT,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','active','paused','deleted')),
  featured         INTEGER NOT NULL DEFAULT 0,
  rating           REAL,
  review_count     INTEGER NOT NULL DEFAULT 0,
  sold_count       INTEGER NOT NULL DEFAULT 0,
  view_count       INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS product_images (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_variants (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  sku        TEXT,
  price      INTEGER NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0,
  weight_g   INTEGER,
  active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS inventory (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id      TEXT UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  variant_id      TEXT UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity        INTEGER NOT NULL DEFAULT 0,
  reserved        INTEGER NOT NULL DEFAULT 0,
  low_stock_alert INTEGER NOT NULL DEFAULT 10,
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id           TEXT NOT NULL REFERENCES users(id),
  status            TEXT NOT NULL DEFAULT 'pending',
  currency          TEXT NOT NULL DEFAULT 'VND',
  subtotal          INTEGER NOT NULL,
  shipping_fee      INTEGER NOT NULL DEFAULT 0,
  discount          INTEGER NOT NULL DEFAULT 0,
  total             INTEGER NOT NULL,
  shipping_address  TEXT NOT NULL,
  note              TEXT,
  coupon_code       TEXT,
  gift_message      TEXT,
  scheduled_date    INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS order_items (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id       TEXT NOT NULL REFERENCES seller_profiles(id),
  product_id      TEXT NOT NULL REFERENCES products(id),
  variant_id      TEXT REFERENCES product_variants(id),
  product_name    TEXT NOT NULL,
  variant_name    TEXT,
  quantity        INTEGER NOT NULL,
  unit_price      INTEGER NOT NULL,
  total_price     INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS payments (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id       TEXT NOT NULL REFERENCES orders(id),
  method         TEXT NOT NULL,
  provider       TEXT,
  provider_ref   TEXT,
  amount         INTEGER NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'VND',
  status         TEXT NOT NULL DEFAULT 'pending',
  paid_at        INTEGER,
  meta_json      TEXT,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS shipments (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id        TEXT NOT NULL REFERENCES orders(id),
  carrier         TEXT,
  tracking_number TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  shipped_at      INTEGER,
  estimated_at    INTEGER,
  delivered_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tracking_events (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  location    TEXT,
  note        TEXT,
  occurred_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id),
  order_id    TEXT REFERENCES orders(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  images_json TEXT,
  helpful     INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'published',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS coupons (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code            TEXT UNIQUE NOT NULL,
  type            TEXT NOT NULL,
  value           INTEGER NOT NULL,
  min_order       INTEGER,
  max_discount    INTEGER,
  usage_limit     INTEGER,
  usage_count     INTEGER NOT NULL DEFAULT 0,
  per_user_limit  INTEGER NOT NULL DEFAULT 1,
  starts_at       INTEGER,
  expires_at      INTEGER,
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points     INTEGER NOT NULL DEFAULT 0,
  tier       TEXT NOT NULL DEFAULT 'bronze',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS wishlists (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'My Wishlist',
  public     INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id),
  added_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_id    TEXT REFERENCES users(id),
  action      TEXT NOT NULL,
  resource    TEXT NOT NULL,
  resource_id TEXT,
  old_json    TEXT,
  new_json    TEXT,
  ip          TEXT,
  user_agent  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_seller    ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status    ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_region    ON products(region);
CREATE INDEX IF NOT EXISTS idx_orders_user        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product    ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user      ON sessions(user_id);

-- Seed categories
INSERT OR IGNORE INTO categories (id, name, slug, sort_order) VALUES
  ('cat_01', 'Bánh & Kẹo', 'banh-keo', 1),
  ('cat_02', 'Đặc Sản Vùng Miền', 'dac-san', 2),
  ('cat_03', 'Mắm & Gia Vị', 'mam-gia-vi', 3),
  ('cat_04', 'Trái Cây Sấy', 'trai-cay-say', 4),
  ('cat_05', 'Chè & Đồ Uống', 'che-do-uong', 5),
  ('cat_06', 'Hải Sản Khô', 'hai-san-kho', 6),
  ('cat_07', 'Thịt & Giò Chả', 'thit-gio-cha', 7),
  ('cat_08', 'Trà & Cà Phê', 'tra-ca-phe', 8);
