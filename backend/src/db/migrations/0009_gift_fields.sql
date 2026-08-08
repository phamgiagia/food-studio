-- Migration 0009: Gift recipient name + hide-price-on-invoice for regular orders
-- Frontend checkout (GiftOptions section) has been sending these fields since
-- Sprint 2 but checkout.ts silently dropped them (not in placeOrderSchema / not
-- in the orders INSERT) — this migration + the route change actually wire them up.

ALTER TABLE orders ADD COLUMN gift_recipient_name TEXT;
ALTER TABLE orders ADD COLUMN hide_price INTEGER NOT NULL DEFAULT 0;
