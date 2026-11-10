-- Stamps can only be given to customers who have confirmed a phone number.
-- Supabase allows each phone number on only one account, so this means
-- one person = one stamp card.

-- Checks Supabase's own record of whether a user has confirmed their phone.
-- "security definer" lets it read auth.users, which normal users can't see;
-- it only ever answers yes or no.
create or replace function public.has_verified_phone(uid uuid)
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

revoke all on function public.has_verified_phone(uuid) from public;
grant execute on function public.has_verified_phone(uuid) to authenticated;

-- Replace the vendor rule from the previous migration, adding the phone check
drop policy if exists "Vendors can give stamps" on public.stamps;
create policy "Vendors can give stamps"
  on public.stamps for insert
  to authenticated
  with check (
    user_id is not null
    and user_id <> auth.uid()
    and public.has_verified_phone(user_id)
    and exists (
      select 1 from public.vendors v
      where v.id = stamps.vendor_id
        and v.user_id = auth.uid()
    )
  );
