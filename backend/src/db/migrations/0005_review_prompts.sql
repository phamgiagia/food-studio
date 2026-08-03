-- Migration 0005: Review prompts — post-purchase flow
-- Tracks which orders/products need a review reminder
-- Apply with: wrangler d1 migrations apply food-studio-db-prod

CREATE TABLE IF NOT EXISTS review_prompts (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES products(id),
  order_id      TEXT REFERENCES orders(id),
  product_name  TEXT,
  reviewed      INTEGER NOT NULL DEFAULT 0,
  dismissed     INTEGER NOT NULL DEFAULT 0,
  triggered_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at   INTEGER
);

CREATE INDEX IF NOT EXISTS idx_rp_user ON review_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_rp_not_reviewed ON review_prompts(user_id, reviewed, dismissed);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rp_unique ON review_prompts(user_id, product_id, order_id);