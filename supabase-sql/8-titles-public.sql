-- Catalog shows each producer's title (Member / Verified / Special Member / Founding).
-- Run ONCE in Supabase SQL Editor, after 7-titles.sql and BEFORE the new website version goes live.
drop function if exists public.show_producer_flags(uuid[]);
create function public.show_producer_flags(p_ids uuid[])
returns table (id uuid, is_verified boolean, is_founding boolean, user_type text, member_tier text)
language sql security definer set search_path = public stable as $$
  select p.id, coalesce(p.is_verified,false), coalesce(p.is_founding,false), p.user_type, p.member_tier
  from profiles p where p.id = any(p_ids);
$$;
grant execute on function public.show_producer_flags(uuid[]) to anon, authenticated;
