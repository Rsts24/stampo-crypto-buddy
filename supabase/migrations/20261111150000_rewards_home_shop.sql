-- Rewards can only be used at the shop that gave the stamps.
-- A vendor who fakes stamps can then only give away their own coffee,
-- so there is nothing to gain from it.

-- Claim a reward with 6 stamps from one shop. The reward belongs to that shop.
drop function if exists public.claim_reward(public.reward_type);

create or replace function public.claim_reward(p_vendor_id uuid, p_type public.reward_type default 'coffee')
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

  if not exists (select 1 from public.vendors v where v.id = p_vendor_id) then
    raise exception 'Shop not found';
  end if;

  -- Lock this customer's unspent stamps from this shop so two claims can't spend the same ones
  perform 1 from public.stamps
  where user_id = uid and vendor_id = p_vendor_id and reward_id is null
    and collected_at > now() - interval '6 months'
  for update;

  select count(*) into available from public.stamps
  where user_id = uid and vendor_id = p_vendor_id and reward_id is null
    and collected_at > now() - interval '6 months';

  if available < needed then
    raise exception 'You need % stamps from this shop for a reward. You have %.', needed, available;
  end if;

  -- 6-character code without look-alike characters (no 0/O, 1/I/L)
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::integer, 1);
    end loop;
    exit when not exists (select 1 from public.rewards where code = new_code);
  end loop;

  insert into public.rewards (customer_id, vendor_id, type, status, stamps_used, code, expires_at)
  values (uid, p_vendor_id, p_type, 'earned', needed, new_code, now() + interval '30 days')
  returning * into new_reward;

  -- Spend the oldest stamps first (they would expire soonest)
  update public.stamps set reward_id = new_reward.id
  where id in (
    select id from public.stamps
    where user_id = uid and vendor_id = p_vendor_id and reward_id is null
      and collected_at > now() - interval '6 months'
    order by collected_at asc
    limit needed
  );

  return new_reward;
end;
$$;
revoke all on function public.claim_reward(uuid, public.reward_type) from public, anon;
grant execute on function public.claim_reward(uuid, public.reward_type) to authenticated;

-- Redeem only at the reward's own shop.
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
  home_name text;
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
  if r.vendor_id is not null and r.vendor_id <> shop then
    select business_name into home_name from public.vendors where id = r.vendor_id;
    raise exception 'This reward can only be used at %', coalesce(home_name, 'the shop that gave the stamps');
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
