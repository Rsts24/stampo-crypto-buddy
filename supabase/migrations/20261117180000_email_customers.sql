-- Customers can now sign up with email + password instead of a text code
-- (text messages cost money per message). An account can collect stamps
-- once it has a confirmed email OR a confirmed phone number.
--
-- Supabase allows each email on only one account and only marks it
-- confirmed after the owner clicks the link we email them, so made-up
-- addresses can't collect stamps. Phone sign-in stays for existing
-- phone accounts (the admin).
--
-- The function keeps its old name so the stamp rules that use it carry on working.
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
      and (
        (u.phone is not null and u.phone_confirmed_at is not null)
        or (u.email is not null and u.email_confirmed_at is not null)
      )
  );
$$;

revoke all on function private.has_verified_phone(uuid) from public, anon;
grant execute on function private.has_verified_phone(uuid) to authenticated;

-- Same stamp function as before, with an updated message for unconfirmed customers.
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
    raise exception 'This customer needs to confirm their email in the Stampo app first.';
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
