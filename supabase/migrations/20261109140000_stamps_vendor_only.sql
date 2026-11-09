-- Stamps: customers can see their own stamps, and only vendors can give them out.

alter table public.stamps enable row level security;

-- Remove the earlier testing rule that let customers add their own stamps
drop policy if exists "Users can add their own stamps" on public.stamps;

-- Customers can see their own stamps
drop policy if exists "Users can view their own stamps" on public.stamps;
create policy "Users can view their own stamps"
  on public.stamps for select
  to authenticated
  using (auth.uid() = user_id);

-- Vendors can see the stamps their shop has given out
drop policy if exists "Vendors can view stamps they gave" on public.stamps;
create policy "Vendors can view stamps they gave"
  on public.stamps for select
  to authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = stamps.vendor_id
        and v.user_id = auth.uid()
    )
  );

-- Vendors can add stamps, but only on behalf of their own shop,
-- and not to their own account
drop policy if exists "Vendors can give stamps" on public.stamps;
create policy "Vendors can give stamps"
  on public.stamps for insert
  to authenticated
  with check (
    user_id is not null
    and user_id <> auth.uid()
    and exists (
      select 1 from public.vendors v
      where v.id = stamps.vendor_id
        and v.user_id = auth.uid()
    )
  );
