-- Migration 0008: Corporate / bulk gifting
-- One purchaser sends the same gift to many recipients, each with their own
-- address, delivery date and gift message. Each recipient becomes a real
-- order so it flows through the normal fulfillment/notification pipeline.

CREATE TABLE IF NOT EXISTS corporate_orders (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id         TEXT NOT NULL REFERENCES users(id),
  company_name    TEXT,
  product_id      TEXT NOT NULL REFERENCES products(id),
  variant_id      TEXT REFERENCES product_variants(id),
  quantity_per_recipient INTEGER NOT NULL DEFAULT 1,
  recipient_count INTEGER NOT NULL,
  subtotal        INTEGER NOT NULL,
  shipping_fee    INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'bank_transfer'
                    CHECK (payment_method IN ('bank_transfer','cod')),
  status          TEXT NOT NULL DEFAULT 'pending_payment'
                    CHECK (status IN ('pending_payment','confirmed','cancelled')),
  note            TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS corporate_order_recipients (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  corporate_order_id  TEXT NOT NULL REFERENCES corporate_orders(id) ON DELETE CASCADE,
  order_id            TEXT REFERENCES orders(id),
  recipient_name      TEXT NOT NULL,
  recipient_phone     TEXT NOT NULL,
  line1               TEXT NOT NULL,
  line2                TEXT,
  ward                TEXT,
  district            TEXT NOT NULL,
  province            TEXT NOT NULL,
  scheduled_date      INTEGER,
  gift_message        TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_corporate_orders_user       ON corporate_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_recipients_parent ON corporate_order_recipients(corporate_order_id);
