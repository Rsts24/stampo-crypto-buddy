-- Tidy-ups flagged by Supabase's security and performance advisors.

-- 1. The sign-up trigger function should only run as a trigger, never be called directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. Move the phone check out of the public API into a private schema.
--    The stamp rule still uses it, but nobody can call it over the web.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.has_verified_phone(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = uid
      and u.phone is not null
      and u.phone_confirmed_at is not null
  );
$$;

revoke all on function private.has_verified_phone(uuid) from public, anon;
grant execute on function private.has_verified_phone(uuid) to authenticated;

-- 3. Re-create the stamp rules using the private function, and evaluate
--    auth.uid() once per query instead of once per row (faster).
drop policy if exists "Users can view their own stamps" on public.stamps;
create policy "Users can view their own stamps"
  on public.stamps for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Vendors can view stamps they gave" on public.stamps;
create policy "Vendors can view stamps they gave"
  on public.stamps for select
  to authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = stamps.vendor_id
        and v.user_id = (select auth.uid())
    )
  );

drop policy if exists "Vendors can give stamps" on public.stamps;
create policy "Vendors can give stamps"
  on public.stamps for insert
  to authenticated
  with check (
    user_id is not null
    and user_id <> (select auth.uid())
    and private.has_verified_phone(user_id)
    and exists (
      select 1 from public.vendors v
      where v.id = stamps.vendor_id
        and v.user_id = (select auth.uid())
    )
  );

drop function if exists public.has_verified_phone(uuid);
