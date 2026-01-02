-- SECURE RLS & TRACKER FUNCTION
-- Run this in Supabase SQL Editor to secure your app

-- 1. CLEANUP: Drop insecure policies from previous fix
DROP POLICY IF EXISTS "Enable insert for all users" ON public.services;
DROP POLICY IF EXISTS "Enable update for all users" ON public.services;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.services;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_items;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.shops;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY; -- Table not currently used

-- 3. STAFF ACCESS (Authenticated Users)
-- Grant full access to logged-in staff
CREATE POLICY "Staff full access on shops" ON public.shops FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff full access on services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff full access on customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff full access on orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff full access on order_items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff full access on machines" ON public.machines FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Staff full access on payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. PUBLIC ACCESS (Anonymous Users)
-- Only allow reading Services (Price List) and Machines (Availability)
CREATE POLICY "Public read services" ON public.services FOR SELECT TO anon USING (true);
CREATE POLICY "Public read machines" ON public.machines FOR SELECT TO anon USING (true);

-- 5. SECURE TRACKER FUNCTION
-- This function allows searching for an order without exposing the whole table
CREATE OR REPLACE FUNCTION get_order_status(search_input text)
RETURNS TABLE (
  id uuid,
  status text,
  payment_status text,
  created_at timestamptz,
  total_price numeric,
  customer_name text,
  items json
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_order_id uuid;
  cust_id uuid;
BEGIN
  -- Check if input is a valid UUID
  BEGIN
    target_order_id := search_input::uuid;
  EXCEPTION WHEN OTHERS THEN
    target_order_id := NULL;
  END;

  -- If it is a UUID, try to find the order directly
  IF target_order_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      o.id, o.status, o.payment_status, o.created_at, o.total_price,
      c.name as customer_name,
      json_agg(json_build_object('service_name', s.name, 'quantity', oi.quantity, 'unit', s.unit)) as items
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN services s ON oi.service_id = s.id
    WHERE o.id = target_order_id
    GROUP BY o.id, c.name;
    
    IF FOUND THEN RETURN; END IF;
  END IF;

  -- If not found or not UUID, try by Phone Number
  SELECT c.id INTO cust_id FROM customers c WHERE c.phone = search_input LIMIT 1;
  
  IF cust_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      o.id, o.status, o.payment_status, o.created_at, o.total_price,
      c.name as customer_name,
      json_agg(json_build_object('service_name', s.name, 'quantity', oi.quantity, 'unit', s.unit)) as items
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN services s ON oi.service_id = s.id
    WHERE o.customer_id = cust_id
    AND o.status != 'completed' -- Only active orders
    GROUP BY o.id, c.name
    ORDER BY o.created_at DESC
    LIMIT 1;
  END IF;
END;
$$;
