-- Admins can deny a shop (with an optional reason). Denied shops leave the
-- waiting list but aren't deleted, so the decision can be reversed, and the
-- owner can fix things and ask for another review.

alter table public.vendors
  add column rejected_at timestamptz,
  add column rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 300);

-- Approve or deny in one place. Approving clears any earlier denial.
create or replace function public.set_vendor_approval(p_vendor_id uuid, p_approved boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can approve shops' using errcode = '42501';
  end if;
  update public.vendors
  set approved = p_approved,
      rejected_at = case when p_approved then null else rejected_at end,
      rejection_reason = case when p_approved then null else rejection_reason end
  where id = p_vendor_id;
  if not found then
    raise exception 'Shop not found';
  end if;
end;
$$;

create or replace function public.deny_vendor(p_vendor_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can deny shops' using errcode = '42501';
  end if;
  update public.vendors
  set approved = false,
      rejected_at = now(),
      rejection_reason = nullif(left(btrim(coalesce(p_reason, '')), 300), '')
  where id = p_vendor_id;
  if not found then
    raise exception 'Shop not found';
  end if;
end;
$$;
revoke all on function public.deny_vendor(uuid, text) from public, anon;
grant execute on function public.deny_vendor(uuid, text) to authenticated;

-- A denied shop owner asks for another look after making changes
create or replace function public.request_vendor_review()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.vendors
  set rejected_at = null, rejection_reason = null
  where user_id = (select auth.uid()) and not approved and rejected_at is not null;
  if not found then
    raise exception 'There''s nothing to review again';
  end if;
end;
$$;
revoke all on function public.request_vendor_review() from public, anon;
grant execute on function public.request_vendor_review() to authenticated;
