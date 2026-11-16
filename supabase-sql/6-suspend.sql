-- Temporary suspension of members. Run ONCE in Supabase SQL Editor BEFORE the new website version goes live.

-- 1) New flag on profiles
alter table public.profiles add column if not exists suspended boolean not null default false;

-- 2) Members cannot unsuspend themselves (same protection as Verified / Founding)
create or replace function public.protect_profile_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.email() = 'bacinhos@gmail.com'
     or current_setting('app.allow_profile_flags', true) = '1' then
    return new;  -- admin, backend or a trusted function
  end if;
  if tg_op = 'INSERT' then
    new.is_verified := false;
    new.is_founding := false;
    new.suspended := false;
  else
    new.is_verified := old.is_verified;
    new.is_founding := old.is_founding;
    new.user_type := old.user_type;
    new.is_paid := old.is_paid;
    new.subscription_expiry := old.subscription_expiry;
    new.suspended := old.suspended;
  end if;
  return new;
end $$;

-- 3) Catalog hides shows of suspended members (returns ids only, nothing private)
create or replace function public.suspended_member_ids()
returns setof uuid
language sql security definer set search_path = public stable as $$
  select id from profiles where suspended;
$$;
grant execute on function public.suspended_member_ids() to anon, authenticated;
