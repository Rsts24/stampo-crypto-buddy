-- Each shop sets up its own version of Stampo through the setup form:
-- branding, shop details, reward rules and extra offers.

-- ---------- Shop settings ----------
alter table public.vendors
  add column slug text,
  add column description text,
  add column logo_url text,
  add column brand_color text not null default '#C2410C',
  add column phone text,
  add column email text,
  add column website text,
  add column instagram text,
  add column opening_hours jsonb not null default '{}'::jsonb,
  add column timezone text not null default 'Europe/London',
  add column stamps_required integer not null default 6,
  add column reward_name text not null default 'Free drink',
  add column reward_description text,
  add column stamp_validity_months integer not null default 6,
  add column reward_validity_days integer not null default 30,
  add column welcome_bonus boolean not null default false,
  add column double_stamp_days smallint[] not null default '{}',
  add column birthday_treat boolean not null default false,
  add column setup_completed_at timestamptz;

alter table public.vendors
  add constraint vendors_business_name_len check (char_length(business_name) between 2 and 80),
  add constraint vendors_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint vendors_description_len check (description is null or char_length(description) <= 500),
  add constraint vendors_logo_url check (
    logo_url is null
    or logo_url like 'https://fzhxshnrdxquivyoxbrn.supabase.co/storage/v1/object/public/shop-logos/%'
  ),
  add constraint vendors_brand_color check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint vendors_phone_len check (phone is null or char_length(phone) <= 30),
  add constraint vendors_email_format check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint vendors_website_format check (website is null or website ~ '^https?://'),
  add constraint vendors_instagram_format check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  add constraint vendors_opening_hours_object check (jsonb_typeof(opening_hours) = 'object'),
  add constraint vendors_stamps_required_range check (stamps_required between 3 and 20),
  add constraint vendors_reward_name_len check (char_length(reward_name) between 2 and 60),
  add constraint vendors_reward_description_len check (reward_description is null or char_length(reward_description) <= 200),
  add constraint vendors_stamp_validity_range check (stamp_validity_months between 1 and 24),
  add constraint vendors_reward_validity_range check (reward_validity_days between 7 and 365),
  add constraint vendors_double_days_valid check (double_stamp_days <@ array[0,1,2,3,4,5,6]::smallint[]);

-- Friendly web address for each shop page, e.g. /shop/bean-there
create or replace function private.make_vendor_slug(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Turn accented letters into plain ones so "Café" becomes "cafe"
  base text := trim(both '-' from regexp_replace(
    translate(lower(coalesce(p_name, '')),
              'áàâäãåāçćčéèêëēęíìîïīłñńóòôöõøōśšúùûüūýÿźżž',
              'aaaaaaaccceeeeeeiiiiilnnooooooossuuuuuyyzzz'),
    '[^a-z0-9]+', '-', 'g'));
  candidate text;
  n integer := 1;
begin
  if base = '' then base := 'shop'; end if;
  base := left(base, 50);
  candidate := base;
  while exists (select 1 from public.vendors where slug = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;
revoke all on function private.make_vendor_slug(text) from public, anon, authenticated;

create or replace function private.set_vendor_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.slug is null then
    new.slug := private.make_vendor_slug(new.business_name);
  end if;
  return new;
end;
$$;
revoke all on function private.set_vendor_slug() from public, anon, authenticated;

create trigger vendors_set_slug
  before insert on public.vendors
  for each row execute function private.set_vendor_slug();

update public.vendors set slug = private.make_vendor_slug(business_name) where slug is null;
alter table public.vendors alter column slug set not null;
create unique index vendors_slug_key on public.vendors (slug);

-- Vendors can edit their own settings (but never approve themselves or change their shop page address)
revoke update on public.vendors from anon, authenticated;
grant update (
  business_name, address, description, logo_url, brand_color, phone, email, website, instagram,
  opening_hours, timezone, stamps_required, reward_name, reward_description,
  stamp_validity_months, reward_validity_days, welcome_bonus, double_stamp_days, birthday_treat,
  setup_completed_at
) on public.vendors to authenticated;

-- Anyone (even signed out) can view approved shop pages. The owner's account id stays hidden.
revoke select on public.vendors from anon;
grant select (
  id, slug, business_name, address, description, logo_url, brand_color, phone, email, website,
  instagram, opening_hours, timezone, stamps_required, reward_name, reward_description,
  stamp_validity_months, reward_validity_days, welcome_bonus, double_stamp_days, birthday_treat,
  approved
) on public.vendors to anon;
create policy "Anyone can view approved shops" on public.vendors
  for select to anon using (approved);

-- ---------- Sign-up: build the shop from the setup form ----------
create or replace function private.clean_text(p text, max_len integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(btrim(coalesce(p, '')), max_len), '');
$$;

create or replace function private.clamp_int(p text, lo integer, hi integer, fallback integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p ~ '^\s*-?\d{1,6}\s*$' then least(greatest(p::integer, lo), hi)
    else fallback
  end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  vendor boolean := coalesce((meta ->> 'is_vendor')::boolean, false);
  color text := meta ->> 'brand_color';
  logo text := meta ->> 'logo_url';
  site text := private.clean_text(meta ->> 'website', 200);
  insta text := regexp_replace(coalesce(meta ->> 'instagram', ''), '^(https?://(www\.)?instagram\.com/|@)', '');
  mail text := private.clean_text(meta ->> 'shop_email', 120);
  hours jsonb := meta -> 'opening_hours';
  tz text := coalesce(private.clean_text(meta ->> 'timezone', 60), 'Europe/London');
  days smallint[];
begin
  insert into public.profiles (id, full_name, is_vendor)
  values (new.id, private.clean_text(meta ->> 'full_name', 120), vendor);

  if vendor then
    select coalesce(array_agg(distinct d::smallint order by d::smallint), '{}')
      into days
      from jsonb_array_elements_text(
        case when jsonb_typeof(meta -> 'double_stamp_days') = 'array' then meta -> 'double_stamp_days' else '[]'::jsonb end
      ) as d
      where d ~ '^[0-6]$';

    if not exists (select 1 from pg_timezone_names where name = tz) then
      tz := 'Europe/London';
    end if;
    insta := btrim(regexp_replace(insta, '/.*$', ''));

    insert into public.vendors (
      user_id, business_name, address, description, logo_url, brand_color, phone, email, website,
      instagram, opening_hours, timezone, stamps_required, reward_name, reward_description,
      stamp_validity_months, reward_validity_days, welcome_bonus, double_stamp_days, birthday_treat,
      setup_completed_at
    )
    values (
      new.id,
      coalesce(case when char_length(btrim(coalesce(meta ->> 'business_name', ''))) >= 2
                    then left(btrim(meta ->> 'business_name'), 80) end, 'My Shop'),
      private.clean_text(meta ->> 'business_address', 200),
      private.clean_text(meta ->> 'description', 500),
      case when logo like 'https://fzhxshnrdxquivyoxbrn.supabase.co/storage/v1/object/public/shop-logos/%' then logo end,
      case when color ~ '^#[0-9A-Fa-f]{6}$' then color else '#C2410C' end,
      private.clean_text(meta ->> 'shop_phone', 30),
      case when mail ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then mail end,
      case when site ~ '^https?://' then site when site is not null then 'https://' || site end,
      case when insta ~ '^[A-Za-z0-9._]{1,30}$' then insta end,
      case when jsonb_typeof(hours) = 'object' then hours else '{}'::jsonb end,
      tz,
      private.clamp_int(meta ->> 'stamps_required', 3, 20, 6),
      coalesce(case when char_length(btrim(coalesce(meta ->> 'reward_name', ''))) >= 2
                    then left(btrim(meta ->> 'reward_name'), 60) end, 'Free drink'),
      private.clean_text(meta ->> 'reward_description', 200),
      private.clamp_int(meta ->> 'stamp_validity_months', 1, 24, 6),
      private.clamp_int(meta ->> 'reward_validity_days', 7, 365, 30),
      coalesce((meta ->> 'welcome_bonus')::boolean, false),
      days,
      coalesce((meta ->> 'birthday_treat')::boolean, false),
      case when (meta ->> 'setup_form') = 'true' then now() end
    );
  end if;

  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- Rewards carry their own title (each shop names its reward) ----------
alter table public.rewards add column title text;

create or replace function private.new_reward_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  c text;
begin
  -- 6 characters without look-alikes (no 0/O, 1/I/L)
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::integer, 1);
    end loop;
    exit when not exists (select 1 from public.rewards where code = c);
  end loop;
  return c;
end;
$$;
revoke all on function private.new_reward_code() from public, anon, authenticated;

-- ---------- Stamps: grouped by visit, with bonus stamps ----------
alter table public.stamps
  add column visit_id uuid,
  add column bonus_reason text check (bonus_reason in ('welcome', 'double'));
create index stamps_visit_id_idx on public.stamps (visit_id);

-- Bonus stamps arrive together with the normal one, so they skip the repeat limit
create or replace function private.limit_repeat_stamps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.bonus_reason is null and exists (
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

-- Stamps are now only given through give_stamp(), which applies each shop's offers
drop policy if exists "Vendors can give stamps" on public.stamps;

create or replace function public.give_stamp(p_customer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  v public.vendors;
  visit uuid := gen_random_uuid();
  added integer := 1;
  reasons text[] := '{}';
  local_now timestamp;
  dob date;
  birthday_title text;
begin
  select * into v from public.vendors where user_id = uid and approved;
  if v.id is null then
    raise exception 'Only approved shops can give stamps' using errcode = '42501';
  end if;
  if p_customer_id is null or p_customer_id = uid then
    raise exception 'You can''t stamp your own account';
  end if;
  if not private.has_verified_phone(p_customer_id) then
    raise exception 'This customer needs to confirm their phone number in the Stampo app first.';
  end if;

  local_now := now() at time zone v.timezone;

  -- The normal stamp (the repeat-limit trigger checks the 5-minute rule)
  insert into public.stamps (user_id, vendor_id, visit_id) values (p_customer_id, v.id, visit);

  -- Welcome bonus: an extra stamp on the customer's first ever visit to this shop
  if v.welcome_bonus and not exists (
    select 1 from public.stamps
    where user_id = p_customer_id and vendor_id = v.id and visit_id is distinct from visit
  ) then
    insert into public.stamps (user_id, vendor_id, visit_id, bonus_reason) values (p_customer_id, v.id, visit, 'welcome');
    added := added + 1;
    reasons := array_append(reasons, 'welcome');
  end if;

  -- Double-stamp days (in the shop's own time zone; 0 = Sunday)
  if extract(dow from local_now)::smallint = any (v.double_stamp_days) then
    insert into public.stamps (user_id, vendor_id, visit_id, bonus_reason) values (p_customer_id, v.id, visit, 'double');
    added := added + 1;
    reasons := array_append(reasons, 'double');
  end if;

  -- Birthday treat: once a year, during the customer's birthday month
  if v.birthday_treat then
    select date_of_birth into dob from public.profiles where id = p_customer_id;
    if dob is not null
      and extract(month from dob) = extract(month from local_now)
      and not exists (
        select 1 from public.rewards
        where customer_id = p_customer_id and vendor_id = v.id and type = 'birthday'
          and created_at > now() - interval '300 days'
      )
    then
      birthday_title := 'Birthday treat: ' || v.reward_name;
      insert into public.rewards (customer_id, vendor_id, type, status, stamps_used, code, expires_at, title)
      values (p_customer_id, v.id, 'birthday', 'earned', 0, private.new_reward_code(),
              now() + make_interval(days => v.reward_validity_days), birthday_title);
    end if;
  end if;

  return jsonb_build_object(
    'stamps_added', added,
    'reasons', to_jsonb(reasons),
    'visit_id', visit,
    'birthday_treat', birthday_title
  );
end;
$$;
revoke all on function public.give_stamp(uuid) from public, anon;
grant execute on function public.give_stamp(uuid) to authenticated;

-- ---------- Claim uses the shop's own rules ----------
create or replace function public.claim_reward(p_vendor_id uuid, p_type public.reward_type default 'coffee')
returns public.rewards
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  v public.vendors;
  needed integer;
  available integer;
  valid_since timestamptz;
  new_reward public.rewards;
begin
  if uid is null then
    raise exception 'Please sign in first' using errcode = '42501';
  end if;

  select * into v from public.vendors where id = p_vendor_id;
  if v.id is null then
    raise exception 'Shop not found';
  end if;

  -- Only the shop's own reward can be claimed; share-based rewards are coming soon
  needed := case p_type when 'coffee' then v.stamps_required else null end;
  if needed is null then
    raise exception 'This reward is coming soon';
  end if;

  valid_since := now() - make_interval(months => v.stamp_validity_months);

  -- Lock this customer's unspent stamps from this shop so two claims can't spend the same ones
  perform 1 from public.stamps
  where user_id = uid and vendor_id = v.id and reward_id is null and collected_at > valid_since
  for update;

  select count(*) into available from public.stamps
  where user_id = uid and vendor_id = v.id and reward_id is null and collected_at > valid_since;

  if available < needed then
    raise exception 'You need % stamps from this shop for a reward. You have %.', needed, available;
  end if;

  insert into public.rewards (customer_id, vendor_id, type, status, stamps_used, code, expires_at, title)
  values (uid, v.id, p_type, 'earned', needed, private.new_reward_code(),
          now() + make_interval(days => v.reward_validity_days), v.reward_name)
  returning * into new_reward;

  -- Spend the oldest stamps first (they would expire soonest)
  update public.stamps set reward_id = new_reward.id
  where id in (
    select id from public.stamps
    where user_id = uid and vendor_id = v.id and reward_id is null and collected_at > valid_since
    order by collected_at asc
    limit needed
  );

  return new_reward;
end;
$$;

-- ---------- Redeem returns the reward's title for the till ----------
drop function if exists public.redeem_reward(text);
create function public.redeem_reward(p_code text)
returns table (reward_type public.reward_type, claimed_at timestamptz, title text)
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

  return query select r.type, r.created_at, r.title;
end;
$$;
revoke all on function public.redeem_reward(text) from public, anon;
grant execute on function public.redeem_reward(text) to authenticated;
