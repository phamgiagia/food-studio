-- Migration 0007: Referral program (give/get reward)

CREATE TABLE IF NOT EXISTS referral_codes (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code       TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS referrals (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  referrer_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id      TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code                  TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','rewarded')),
  referrer_coupon_code  TEXT,
  referred_coupon_code  TEXT,
  rewarded_at           INTEGER,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status   ON referrals(status);
