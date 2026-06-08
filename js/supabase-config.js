/**
 * Supabase Configuration for Harbin Kitchen Order System
 * ===================================================
 *
 * SETUP INSTRUCTIONS (设置步骤):
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project (name: harbin-kitchen)
 * 3. Go to Project Settings → API
 * 4. Copy "Project URL" → paste below as SUPABASE_URL
 * 5. Copy "anon/public" key → paste below as SUPABASE_ANON_KEY
 *
 * SQL SETUP (在 Supabase SQL Editor 里运行):
 *  Copy the SQL below and run it in Supabase Dashboard → SQL Editor
 * ===================================================
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// ── SQL Schema (run this in Supabase SQL Editor) ──
//
// CREATE TABLE orders (
//   id BIGSERIAL PRIMARY KEY,
//   order_number TEXT NOT NULL UNIQUE,
//   order_type TEXT NOT NULL CHECK (order_type IN ('dinein', 'takeaway', 'preorder')),
//   table_number TEXT,
//   guest_count INTEGER,
//   customer_name TEXT NOT NULL,
//   customer_phone TEXT,
//   pickup_time TEXT,
//   notes TEXT,
//   items JSONB NOT NULL DEFAULT '[]',
//   subtotal INTEGER NOT NULL DEFAULT 0,
//   discount INTEGER NOT NULL DEFAULT 0,
//   total INTEGER NOT NULL DEFAULT 0,
//   status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
//
// -- Enable Row Level Security (we'll use anon key for simplicity)
// ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
//
// -- Allow anonymous inserts (customers placing orders)
// CREATE POLICY "Allow anonymous inserts" ON orders FOR INSERT WITH CHECK (true);
//
// -- Allow anonymous reads (admin dashboard)
// CREATE POLICY "Allow anonymous selects" ON orders FOR SELECT USING (true);
//
// -- Allow anonymous updates (admin updating status)
// CREATE POLICY "Allow anonymous updates" ON orders FOR UPDATE USING (true);
//
// -- Enable realtime
// ALTER PUBLICATION supabase_realtime ADD TABLE orders;
