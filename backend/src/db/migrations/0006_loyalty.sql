-- Migration 0006: Loyalty Program — transactions + rewards
-- Apply with: wrangler d1 migrations apply food-studio-db-prod

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'expire')),
  points     INTEGER NOT NULL,
  balance    INTEGER NOT NULL,          -- running balance after this tx
  note       TEXT,
  reference_type TEXT,                  -- 'order', 'redeem', 'bonus', etc.
  reference_id   TEXT,                  -- order_id, etc.
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_lt_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_lt_created ON loyalty_transactions(created_at DESC);

-- Rewards catalog (redeemable items)
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name           TEXT NOT NULL,
  description    TEXT,
  points_required INTEGER NOT NULL,
  type           TEXT NOT NULL DEFAULT 'coupon'
                 CHECK (type IN ('coupon', 'discount', 'free_shipping', 'free_product', 'voucher')),
  value_json     TEXT,                   -- e.g. {"discount_percent":10,"max_discount":50000}
  image_url      TEXT,
  active         INTEGER NOT NULL DEFAULT 1,
  stock          INTEGER,               -- null = unlimited
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- SEED: Loyalty rewards
-- ============================================================
INSERT OR IGNORE INTO loyalty_rewards (id, name, description, points_required, type, value_json, sort_order) VALUES
  ('lwr_01', 'Giảm 10% đơn hàng', 'Giảm 10% giá trị đơn hàng, tối đa 50,000đ', 500, 'coupon',
   '{"discount_percent":10,"max_discount":50000}', 1),
  ('lwr_02', 'Miễn phí vận chuyển', 'Miễn phí vận chuyển cho đơn hàng tiếp theo', 300, 'free_shipping',
   '{}', 2),
  ('lwr_03', 'Giảm 50,000đ', 'Giảm thẳng 50,000đ cho đơn hàng từ 300,000đ', 800, 'coupon',
   '{"discount_fixed":50000,"min_order":300000}', 3),
  ('lwr_04', 'Quà tặng bất ngờ', 'Món quà đặc biệt từ Food Studio kèm đơn hàng', 1200, 'free_product',
   '{}', 4);