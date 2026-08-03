-- Migration 0004: Gift Card feature
-- Digital gift cards — buy, send, redeem
-- Apply with: wrangler d1 migrations apply food-studio-db-prod

-- ============================================================
-- GIFT CARD TEMPLATES (admin-defined, e.g., "Special Tết", "Sinh nhật")
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_card_templates (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  denominations_json TEXT,    -- [100000, 200000, 500000, 1000000] available amounts
  min_amount    INTEGER NOT NULL DEFAULT 50000,
  max_amount    INTEGER NOT NULL DEFAULT 5000000,
  design_url    TEXT,          -- card design image URL
  message_label TEXT DEFAULT 'Lời chúc của bạn',
  allows_custom_amount INTEGER NOT NULL DEFAULT 1,
  active        INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- GIFT CARDS (issued to users)
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_cards (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code          TEXT UNIQUE NOT NULL,       -- redeem code like GIFT-XXXX-XXXX
  template_id   TEXT REFERENCES gift_card_templates(id),
  buyer_id      TEXT NOT NULL REFERENCES users(id),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,                      -- to send notification
  recipient_phone TEXT,
  amount        INTEGER NOT NULL,           -- face value in VND
  balance       INTEGER NOT NULL,           -- remaining balance (supports partial use)
  message       TEXT,
  hide_amount   INTEGER NOT NULL DEFAULT 0,
  design_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'partially_used', 'exhausted', 'expired', 'cancelled')),
  expires_at    INTEGER,                    -- null = no expiry
  used_at       INTEGER,
  cancelled_at  INTEGER,
  order_id      TEXT REFERENCES orders(id), -- order that purchased this card
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- GIFT CARD REDEMPTIONS (track each use)
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  gift_card_id TEXT NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id    TEXT NOT NULL REFERENCES orders(id),
  user_id     TEXT NOT NULL REFERENCES users(id),  -- who redeemed it
  amount      INTEGER NOT NULL,                    -- amount used in VND
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gc_buyer     ON gift_cards(buyer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gc_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gc_status    ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gc_redemptions_card ON gift_card_redemptions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gc_redemptions_order ON gift_card_redemptions(order_id);

-- ============================================================
-- SEED: Gift card templates
-- ============================================================
INSERT OR IGNORE INTO gift_card_templates (id, name, slug, description, denominations_json, min_amount, max_amount, design_url, message_label, sort_order) VALUES
  ('gct_01', 'Thiệp Quà Tặng Đặc Sản', 'thiep-qua-dac-san',
   'Tặng người thân món quà ẩm thực đặc sản vùng miền. Người nhận có thể tự chọn sản phẩm yêu thích.',
   '[100000,200000,500000,1000000]', 50000, 5000000,
   'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600',
   'Lời chúc của bạn', 1),
  ('gct_02', 'Gói Quà Sinh Nhật', 'goi-qua-sinh-nhat',
   'Món quà sinh nhật ý nghĩa — tặng trải nghiệm ẩm thực thay vì quà vật chất.',
   '[200000,500000,1000000]', 200000, 3000000,
   'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600',
   'Lời chúc mừng sinh nhật', 2),
  ('gct_03', 'Quà Cảm Ơn', 'qua-cam-on',
   'Gửi lời cảm ơn đến đối tác, đồng nghiệp, khách hàng bằng món quà đặc sản Việt.',
   '[300000,500000,1000000,2000000]', 300000, 5000000,
   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
   'Lời cảm ơn', 3);

-- ============================================================
-- SEED: Sample gift cards (issued)
-- ============================================================
INSERT OR IGNORE INTO gift_cards (id, code, template_id, buyer_id, recipient_name, recipient_email, amount, balance, message, status, expires_at, order_id, created_at) VALUES
  ('gc_01', 'GIFT-TET-2026-A1B2', 'gct_01', 'user_cust01', 'Mẹ Nguyễn Thị Lan',
   'me.lan@email.com', 500000, 500000,
   'Chúc mừng năm mới! Món quà đặc sản từ con gái yêu thương. 🧧',
   'active', UNIXEPOCH('now', '+365 days'), 'ord_0001', UNIXEPOCH('now', '-35 days')),
  ('gc_02', 'GIFT-SINH-NHAT-C3D4', 'gct_02', 'user_cust02', 'Trần Thanh',
   'thanh.tran@email.com', 1000000, 650000,
   'Chúc mừng sinh nhật! Ăn ngon nha bạn hiền! 🎂',
   'partially_used', UNIXEPOCH('now', '+180 days'), 'ord_0002', UNIXEPOCH('now', '-28 days')),
  ('gc_03', 'GIFT-CAMON-E5F6', 'gct_03', 'user_cust04', 'Khách hàng thân thiết',
   'khach.hang@email.com', 300000, 300000,
   'Cảm ơn quý khách đã đồng hành cùng chúng tôi!',
   'active', UNIXEPOCH('now', '+90 days'), NULL, UNIXEPOCH('now', '-7 days')),
  ('gc_04', 'GIFT-EXHAUSTED-G7H8', 'gct_01', 'user_cust03', 'Bạn thân Phạm Thu',
   NULL, 200000, 0,
   'Món quà nho nhỏ :)',
   'exhausted', NULL, 'ord_0003', UNIXEPOCH('now', '-21 days'));

-- ============================================================
-- SEED: Redemption history
-- ============================================================
INSERT OR IGNORE INTO gift_card_redemptions (id, gift_card_id, order_id, user_id, amount, created_at) VALUES
  ('gcr_01', 'gc_02', 'ord_0004', 'user_cust04', 200000, UNIXEPOCH('now', '-10 days')),
  ('gcr_02', 'gc_02', 'ord_0006', 'user_cust04', 150000, UNIXEPOCH('now', '-5 days')),
  ('gcr_03', 'gc_04', 'ord_0003', 'user_cust03', 200000, UNIXEPOCH('now', '-21 days'));