-- Migration 0010: E-Gift ("Send by Email") — sender pays now, recipient
-- redeems later by choosing their own delivery address + date.

CREATE TABLE IF NOT EXISTS e_gifts (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code              TEXT UNIQUE NOT NULL,
  sender_id         TEXT NOT NULL REFERENCES users(id),
  product_id        TEXT NOT NULL REFERENCES products(id),
  variant_id        TEXT REFERENCES product_variants(id),
  quantity          INTEGER NOT NULL DEFAULT 1,
  unit_price        INTEGER NOT NULL,
  subtotal          INTEGER NOT NULL,
  recipient_email   TEXT,
  recipient_phone   TEXT,
  message           TEXT,
  hide_price        INTEGER NOT NULL DEFAULT 1,
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','redeemed','expired','cancelled')),
  redeemed_order_id TEXT REFERENCES orders(id),
  redeemed_at       INTEGER,
  expires_at        INTEGER NOT NULL,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_e_gifts_sender ON e_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_e_gifts_status ON e_gifts(status);
