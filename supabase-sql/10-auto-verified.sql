-- A member becomes Verified automatically when they list their first show.
-- Run ONCE in Supabase SQL Editor BEFORE the new website version goes live.
create or replace function public.claim_verified()
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  if not exists (select 1 from shows where user_id = uid) then return false; end if;
  if exists (select 1 from profiles where id = uid and (suspended or coalesce(member_tier, 'member') <> 'member')) then
    return false;  -- suspended, or already has a title
  end if;
  perform set_config('app.allow_profile_flags', '1', true);
  update profiles set member_tier = 'verified', is_verified = true where id = uid;
  return true;
end $$;
revoke all on function public.claim_verified() from public, anon;
grant execute on function public.claim_verified() to authenticated;

-- Members who already listed a show become Verified now (titles you gave by hand stay as they are).
update public.profiles p
   set member_tier = 'verified', is_verified = true
 where coalesce(p.member_tier, 'member') = 'member'
   and not coalesce(p.suspended, false)
   and exists (select 1 from public.shows s where s.user_id = p.id);
