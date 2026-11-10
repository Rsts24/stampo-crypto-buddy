-- Stampo database: tables, sign-up trigger and security rules.
-- Rebuilt from src/integrations/supabase/types.ts when the original
-- project could no longer be restored.

-- ---------- Types ----------
create type public.reward_status as enum ('earned', 'redeemed', 'expired');
create type public.reward_type as enum ('coffee', 'crypto', 'both', 'platform_shares');
create type public.subscription_tier as enum ('free_trial', 'monthly', 'biannual', 'annual');

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  date_of_birth date,
  mobile_number text,
  address text,
  preferred_language text default 'en',
  notification_preferences jsonb default '{"email": true, "sms": true}'::jsonb,
  is_vendor boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  business_name text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  vendor_id uuid references public.vendors (id) on delete set null,
  collected_at timestamptz not null default now()
);
create index stamps_user_id_collected_at_idx on public.stamps (user_id, collected_at);
create index stamps_vendor_id_collected_at_idx on public.stamps (vendor_id, collected_at);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  type public.reward_type not null,
  status public.reward_status not null default 'earned',
  stamps_used integer not null,
  crypto_amount_in_pence integer,
  selected_platform text,
  redeemed_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now()
);
create index rewards_customer_id_idx on public.rewards (customer_id);
create index rewards_vendor_id_idx on public.rewards (vendor_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  amount_in_pence integer not null,
  fee_percentage numeric not null default 0,
  fee_amount_in_pence integer not null default 0,
  stamps_earned integer not null default 0,
  created_at timestamptz not null default now()
);
create index transactions_customer_id_idx on public.transactions (customer_id);
create index transactions_vendor_id_idx on public.transactions (vendor_id);

create table public.subscription_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier public.subscription_tier not null,
  duration_months integer not null,
  price_in_pence integer not null,
  transaction_fee_percentage numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_subscriptions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  package_id uuid not null references public.subscription_packages (id),
  status text not null default 'active',
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vendor_subscriptions_vendor_id_idx on public.vendor_subscriptions (vendor_id);
create index vendor_subscriptions_package_id_idx on public.vendor_subscriptions (package_id);

-- ---------- Keep updated_at current ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger vendors_updated_at before update on public.vendors
  for each row execute function public.set_updated_at();
create trigger subscription_packages_updated_at before update on public.subscription_packages
  for each row execute function public.set_updated_at();
create trigger vendor_subscriptions_updated_at before update on public.vendor_subscriptions
  for each row execute function public.set_updated_at();

-- ---------- Create profile (and shop, for vendors) when someone signs up ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  vendor boolean := coalesce((meta ->> 'is_vendor')::boolean, false);
begin
  insert into public.profiles (id, full_name, is_vendor)
  values (new.id, meta ->> 'full_name', vendor);

  if vendor then
    insert into public.vendors (user_id, business_name, address)
    values (
      new.id,
      coalesce(nullif(meta ->> 'business_name', ''), 'My Shop'),
      nullif(meta ->> 'business_address', '')
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Security rules ----------
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.stamps enable row level security;
alter table public.rewards enable row level security;
alter table public.transactions enable row level security;
alter table public.subscription_packages enable row level security;
alter table public.vendor_subscriptions enable row level security;

-- Profiles: you can see and edit only your own
create policy "Users can view their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Vendors: signed-in users can see shop names; owners can edit their shop.
-- Shops are only created by the sign-up trigger above.
create policy "Signed-in users can view shops" on public.vendors
  for select to authenticated using (true);
create policy "Owners can update their shop" on public.vendors
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Rewards: customers see their own; vendors see their shop's
create policy "Customers can view their rewards" on public.rewards
  for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Vendors can view their shop's rewards" on public.rewards
  for select to authenticated using (
    exists (select 1 from public.vendors v where v.id = rewards.vendor_id and v.user_id = (select auth.uid()))
  );

-- Transactions: customers see their own; vendors see their shop's
create policy "Customers can view their transactions" on public.transactions
  for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Vendors can view their shop's transactions" on public.transactions
  for select to authenticated using (
    exists (select 1 from public.vendors v where v.id = transactions.vendor_id and v.user_id = (select auth.uid()))
  );

-- Subscription packages: anyone can see the price list
create policy "Anyone can view subscription packages" on public.subscription_packages
  for select to anon, authenticated using (true);

-- Vendor subscriptions: vendors see their own
create policy "Vendors can view their subscriptions" on public.vendor_subscriptions
  for select to authenticated using (
    exists (select 1 from public.vendors v where v.id = vendor_subscriptions.vendor_id and v.user_id = (select auth.uid()))
  );

-- Stamp rules live in the next two migrations.
