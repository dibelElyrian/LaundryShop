-- FIX: Allow Insert, Update, and Delete operations
-- Run this in Supabase SQL Editor

-- 1. SERVICES
create policy "Enable insert for all users" on public.services for insert with check (true);
create policy "Enable update for all users" on public.services for update using (true);
create policy "Enable delete for all users" on public.services for delete using (true);

-- 2. CUSTOMERS
create policy "Enable read access for all users" on public.customers for select using (true);
create policy "Enable insert for all users" on public.customers for insert with check (true);
create policy "Enable update for all users" on public.customers for update using (true);

-- 3. ORDERS
create policy "Enable read access for all users" on public.orders for select using (true);
create policy "Enable insert for all users" on public.orders for insert with check (true);
create policy "Enable update for all users" on public.orders for update using (true);

-- 4. ORDER ITEMS
create policy "Enable read access for all users" on public.order_items for select using (true);
create policy "Enable insert for all users" on public.order_items for insert with check (true);

-- 5. SHOPS (If you need to create a shop)
create policy "Enable insert for all users" on public.shops for insert with check (true);
