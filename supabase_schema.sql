-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. SHOPS (For multi-tenancy or just single shop info)
create table public.shops (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SERVICES (e.g., Wash & Fold, Comforter)
create table public.services (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) not null,
  name text not null,
  price numeric not null,
  unit text not null, -- 'kg', 'piece', 'load'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CUSTOMERS
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) not null,
  name text not null,
  phone text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MACHINES
create table public.machines (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) not null,
  name text not null, -- 'Washer 1', 'Dryer 1'
  type text not null, -- 'washer', 'dryer'
  status text default 'available', -- 'available', 'in_use', 'maintenance'
  started_at timestamp with time zone,
  duration_minutes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) not null,
  customer_id uuid references public.customers(id) not null,
  status text default 'pending', -- 'pending', 'washing', 'drying', 'ready', 'completed'
  total_price numeric default 0,
  payment_status text default 'unpaid', -- 'unpaid', 'paid', 'partial'
  payment_method text, -- 'cash', 'gcash', 'maya'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ORDER ITEMS (Linking orders to services)
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  service_id uuid references public.services(id) not null,
  quantity numeric default 1,
  price_at_time numeric not null, -- Snapshot of price
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Basic setup - allow all for now, lock down later)
alter table public.shops enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.machines enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Enable read access for all users" on public.shops for select using (true);
create policy "Enable read access for all users" on public.services for select using (true);
-- Note: In a real app, you'd restrict writes to authenticated staff only.
