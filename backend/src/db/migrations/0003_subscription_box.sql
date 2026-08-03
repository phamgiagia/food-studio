-- Migration 0003: Subscription Box feature
-- Tables for subscription plans, seller subscription offers, and customer subscriptions
-- Apply with: wrangler d1 migrations apply food-studio-db-prod

-- ============================================================
-- SUBSCRIPTION PLANS (global templates — admin-defined)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,            -- per delivery in VND
  billing_period TEXT NOT NULL DEFAULT 'monthly'
                CHECK (billing_period IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  min_commitment INTEGER NOT NULL DEFAULT 1, -- minimum number of deliveries
  max_products   INTEGER NOT NULL DEFAULT 1, -- items per delivery
  allows_customization INTEGER NOT NULL DEFAULT 1,
  image_url   TEXT,
  features_json TEXT,                       -- included perks list as JSON
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- SELLER SUBSCRIPTION OFFERS (each seller's subscription products)
-- ============================================================
CREATE TABLE IF NOT EXISTS seller_subscription_offers (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  seller_id   TEXT NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  plan_id     TEXT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  price       INTEGER,                     -- override plan price, null = use plan default
  description TEXT,                        -- seller-specific description
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'paused', 'cancelled')),
  available_regions TEXT,                  -- comma-separated regions or 'all'
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seller_id, plan_id)
);

-- ============================================================
-- CUSTOMER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_offer_id TEXT NOT NULL REFERENCES seller_subscription_offers(id),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  current_period_start INTEGER NOT NULL DEFAULT (unixepoch()),
  current_period_end   INTEGER NOT NULL,   -- next billing date
  delivery_interval    TEXT NOT NULL DEFAULT 'monthly',
  total_deliveries     INTEGER NOT NULL DEFAULT 0, -- how many delivered so far
  max_deliveries       INTEGER,            -- null = unlimited (if min_commitment < max)
  shipping_address     TEXT NOT NULL,       -- JSON address
  shipping_note        TEXT,
  gift_message         TEXT,
  auto_renew           INTEGER NOT NULL DEFAULT 1,
  last_order_id        TEXT REFERENCES orders(id),
  cancelled_at         INTEGER,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- SUBSCRIPTION ITEMS (what's in the next box / past boxes)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_items (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL REFERENCES products(id),
  variant_id      TEXT REFERENCES product_variants(id),
  quantity        INTEGER NOT NULL DEFAULT 1,
  is_custom       INTEGER NOT NULL DEFAULT 0, -- user-picked or seller-chosen
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- SUBSCRIPTION DELIVERIES (track each shipment)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_deliveries (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  delivery_number INTEGER NOT NULL,        -- 1st, 2nd, 3rd...
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'preparing', 'shipped', 'delivered', 'skipped')),
  order_id        TEXT REFERENCES orders(id),
  scheduled_date  INTEGER,
  shipped_at      INTEGER,
  delivered_at    INTEGER,
  note            TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_subs_user      ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_seller    ON seller_subscription_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_subs_status    ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_deliveries_sub ON subscription_deliveries(subscription_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_deliveries_seq
  ON subscription_deliveries(subscription_id, delivery_number);

-- ============================================================
-- SEED: Subscription plans (global templates)
-- ============================================================
INSERT OR IGNORE INTO subscription_plans (id, name, slug, description, price, billing_period, min_commitment, max_products, allows_customization, features_json, sort_order) VALUES
  ('plan_01', 'Khám Phá', 'kham-pha',
   'Khám phá tinh hoa ẩm thực mỗi tháng với hộp quà bất ngờ từ các vùng miền. Mỗi tháng một chủ đề khác nhau.',
   299000, 'monthly', 3, 3, 0,
   '["★ Giao miễn phí toàn quốc","★ Đổi chủ đề mỗi tháng","★ Quà tặng kèm độc quyền","★ Hỗ trợ 24/7"]',
   1),
  ('plan_02', 'Sành Điệu', 'sanh-dieu',
   'Hộp quà cao cấp dành cho người sành ăn. Tuyển chọn kỹ lưỡng từ các seller đặc sản nổi tiếng, giao 2 lần/tháng.',
   499000, 'biweekly', 2, 5, 1,
   '["★ Giao miễn phí toàn quốc","★ 2 lần/tháng","★ Tự chọn sản phẩm","★ Hộp quà sang trọng","★ Ưu đãi thành viên"]',
   2),
  ('plan_03', 'Đặc Biệt VIP', 'dac-biet-vip',
   'Trải nghiệm ẩm thực đỉnh cao — hộp quà VIP giao hàng tuần, tuyển chọn bởi đầu bếp nổi tiếng, kèm quà tặng giới hạn.',
   899000, 'weekly', 4, 8, 1,
   '["★ Giao miễn phí toàn quốc","★ Giao hàng tuần","★ Đầu bếp tuyển chọn","★ Quà tặng giới hạn","★ Ưu đãi đặc biệt seller","★ Hỗ trợ VIP 24/7"]',
   3);

-- ============================================================
-- SEED: Seller subscription offers (link sellers to plans)
-- ============================================================
INSERT OR IGNORE INTO seller_subscription_offers (id, seller_id, plan_id, price, description, status) VALUES
  ('so_01', 'seller_03', 'plan_01', NULL, 'Hộp đặc sản Huế mỗi tháng: bánh bèo, bánh lọc, chè hạt sen — giao toàn quốc.', 'active'),
  ('so_02', 'seller_01', 'plan_01', 279000, 'Hộp đặc sản Hà Nội: bánh cốm, chả cá, bánh gối, quà vặt thay đổi theo mùa.', 'active'),
  ('so_03', 'seller_04', 'plan_02', 459000, 'Cà phê đặc sản 2 lần/tháng: mỗi lần 2 gói cà phê khác nhau + dụng cụ pha.', 'active'),
  ('so_04', 'seller_05', 'plan_01', NULL, 'Hải sản khô Phan Thiết hàng tháng: mực, cá ngừ, nước mắm, đặc sản biển thay đổi.', 'active'),
  ('so_05', 'seller_02', 'plan_02', 449000, 'Tinh hoa miền Tây 2 lần/tháng: lẩu mắm, cá thát lát, mắm chưng, trái cây sấy.', 'active');