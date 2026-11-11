-- Claiming and redeeming rewards, undoing stamps, a repeat-stamp limit,
-- in-app vendor approval for admins, and self-service account deletion.

-- ---------- Stamps can be spent on a reward ----------
alter table public.rewards alter column vendor_id drop not null;
alter table public.rewards drop constraint if exists rewards_vendor_id_fkey;
alter table public.rewards
  add constraint rewards_vendor_id_fkey
  foreign key (vendor_id) references public.vendors (id) on delete set null;

-- Short code shown to the customer (also in the reward QR code)
alter table public.rewards add column code text;
alter table public.rewards add column expires_at timestamptz;
create unique index rewards_code_key on public.rewards (code) where code is not null;

alter table public.stamps
  add column reward_id uuid references public.rewards (id) on delete set null;
create index stamps_reward_id_idx on public.stamps (reward_id);

-- ---------- Admins ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- Signed-in users can check whether they themselves are an admin (to show the admin page)
create policy "Users can see their own admin status" on public.admins
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Admins approve (or un-approve) shops
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
  update public.vendors set approved = p_approved where id = p_vendor_id;
  if not found then
    raise exception 'Shop not found';
  end if;
end;
$$;
revoke all on function public.set_vendor_approval(uuid, boolean) from public, anon;
grant execute on function public.set_vendor_approval(uuid, boolean) to authenticated;

-- ---------- Customers claim a reward with their stamps ----------
-- Only the free coffee is claimable for now. The share-based rewards are
-- regulated financial products and stay "coming soon" until there is a partner.
create or replace function public.claim_reward(p_type public.reward_type)
returns public.rewards
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  needed integer;
  available integer;
  new_code text;
  new_reward public.rewards;
begin
  if uid is null then
    raise exception 'Please sign in first' using errcode = '42501';
  end if;

  needed := case p_type when 'coffee' then 6 else null end;
  if needed is null then
    raise exception 'This reward is coming soon';
  end if;

  -- Lock this customer's unspent stamps so two claims can't spend the same ones
  perform 1 from public.stamps
  where user_id = uid and reward_id is null and collected_at > now() - interval '6 months'
  for update;

  select count(*) into available from public.stamps
  where user_id = uid and reward_id is null and collected_at > now() - interval '6 months';

  if available < needed then
    raise exception 'You need % stamps for this reward. You have %.', needed, available;
  end if;

  -- 6-character code without look-alike characters (no 0/O, 1/I/L)
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::integer, 1);
    end loop;
    exit when not exists (select 1 from public.rewards where code = new_code);
  end loop;

  insert into public.rewards (customer_id, type, status, stamps_used, code, expires_at)
  values (uid, p_type, 'earned', needed, new_code, now() + interval '30 days')
  returning * into new_reward;

  -- Spend the oldest stamps first (they would expire soonest)
  update public.stamps set reward_id = new_reward.id
  where id in (
    select id from public.stamps
    where user_id = uid and reward_id is null and collected_at > now() - interval '6 months'
    order by collected_at asc
    limit needed
  );

  return new_reward;
end;
$$;
revoke all on function public.claim_reward(public.reward_type) from public, anon;
grant execute on function public.claim_reward(public.reward_type) to authenticated;

-- ---------- Approved shops redeem a reward at the till ----------
create or replace function public.redeem_reward(p_code text)
returns table (reward_type public.reward_type, claimed_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  shop uuid;
  clean text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  r public.rewards;
begin
  select v.id into shop from public.vendors v where v.user_id = uid and v.approved;
  if shop is null then
    raise exception 'Only approved shops can redeem rewards' using errcode = '42501';
  end if;

  select * into r from public.rewards where code = clean for update;
  if not found then
    raise exception 'Reward code not recognised. Check the code and try again.';
  end if;
  if r.customer_id = uid then
    raise exception 'You can''t redeem your own reward';
  end if;
  if r.status = 'redeemed' then
    raise exception 'This reward was already used on %', to_char(r.redeemed_at at time zone 'UTC', 'DD Mon YYYY "at" HH24:MI "UTC"');
  end if;
  if r.status = 'expired' or (r.expires_at is not null and r.expires_at < now()) then
    raise exception 'This reward has expired';
  end if;

  update public.rewards
  set status = 'redeemed', redeemed_at = now(), vendor_id = shop
  where id = r.id;

  return query select r.type, r.created_at;
end;
$$;
revoke all on function public.redeem_reward(text) from public, anon;
grant execute on function public.redeem_reward(text) to authenticated;

-- ---------- Vendors can undo a mistaken stamp for 5 minutes ----------
drop policy if exists "Vendors can undo a recent stamp" on public.stamps;
create policy "Vendors can undo a recent stamp" on public.stamps
  for delete to authenticated
  using (
    reward_id is null
    and collected_at > now() - interval '5 minutes'
    and exists (
      select 1 from public.vendors v
      where v.id = stamps.vendor_id and v.user_id = (select auth.uid())
    )
  );

-- ---------- One stamp per customer per shop every 5 minutes ----------
-- Stops accidental double scans and casual abuse.
create or replace function private.limit_repeat_stamps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.stamps s
    where s.user_id = new.user_id
      and s.vendor_id = new.vendor_id
      and s.collected_at > now() - interval '5 minutes'
  ) then
    raise exception 'This customer already got a stamp from your shop in the last 5 minutes';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_repeat_stamps() from public, anon, authenticated;

create trigger stamps_limit_repeat
  before insert on public.stamps
  for each row execute function private.limit_repeat_stamps();

-- ---------- Customers can delete their own account ----------
-- Removes the sign-in and, through cascades, their profile, stamps and rewards.
-- A vendor deleting their account also removes their shop.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'Please sign in first' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
