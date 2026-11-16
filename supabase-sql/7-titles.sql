-- Member titles (Member / Verified / Special Member / Founding), set by the admin.
-- Run ONCE in Supabase SQL Editor BEFORE the new website version goes live.

-- 1) New column + fill it from the existing Verified / Founding flags
alter table public.profiles add column if not exists member_tier text;
update public.profiles
   set member_tier = case when is_founding then 'founding' when is_verified then 'verified' else 'member' end
 where member_tier is null;

-- 2) Members cannot give themselves a title (same protection as Verified / Founding / Suspended)
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
    new.member_tier := 'member';
  else
    new.is_verified := old.is_verified;
    new.is_founding := old.is_founding;
    new.user_type := old.user_type;
    new.is_paid := old.is_paid;
    new.subscription_expiry := old.subscription_expiry;
    new.suspended := old.suspended;
    new.member_tier := old.member_tier;
  end if;
  return new;
end $$;
