-- STEP A: run FIRST (safe, changes nothing visible). Lets the public catalog show badges without reading profiles.
create or replace function public.show_producer_flags(p_ids uuid[])
returns table (id uuid, is_verified boolean, is_founding boolean, user_type text)
language sql security definer set search_path = public stable as $$
  select p.id, coalesce(p.is_verified,false), coalesce(p.is_founding,false), p.user_type
  from profiles p where p.id = any(p_ids);
$$;
grant execute on function public.show_producer_flags(uuid[]) to anon, authenticated;
