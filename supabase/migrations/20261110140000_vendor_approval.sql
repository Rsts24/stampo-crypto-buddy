-- New vendors must be approved before they can give stamps.
-- Approve a shop by setting vendors.approved = true
-- (Supabase dashboard → Table Editor → vendors).

alter table public.vendors
  add column approved boolean not null default false;

-- Vendors may edit their shop name and address, but not approve themselves.
revoke update on public.vendors from anon, authenticated;
grant update (business_name, address) on public.vendors to authenticated;

-- Only approved shops can give stamps.
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
        and v.approved
    )
  );
