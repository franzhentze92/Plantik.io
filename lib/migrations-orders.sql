-- Customer orders (checkout), keyed by browser/auth session like proposals.
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_proceso',
  subtotal_q NUMERIC NOT NULL,
  shipping_q NUMERIC NOT NULL DEFAULT 0,
  total_q NUMERIC NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_name TEXT,
  customer_email TEXT,
  customer_address TEXT,
  payment_method TEXT NOT NULL DEFAULT 'simulated',
  payment_provider TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
