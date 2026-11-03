-- STEP 1 of 2: safe to run any time. Only ADDS functions; changes nothing that exists today.

-- views RPC (already exists) must run with owner rights once direct show updates are locked down
do $$
declare r record;
begin
  for r in select oid::regprocedure as sig from pg_proc
           where proname = 'record_show_view' and pronamespace = 'public'::regnamespace loop
    execute 'alter function ' || r.sig || ' security definer set search_path = public';
  end loop;
end $$;

-- likes on shows: signed-in users only, +1 / -1 only
create or replace function public.adjust_show_likes(p_show_id text, p_delta int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update shows set likes_count = greatest(0, coalesce(likes_count, 0) + sign(p_delta)::int)
   where id::text = p_show_id;
end $$;

-- inquiry counter on shows
create or replace function public.bump_show_inquiries(p_show_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update shows set inquiries_count = coalesce(inquiries_count, 0) + 1 where id::text = p_show_id;
end $$;

-- likes on LaffWire posts
create or replace function public.adjust_post_likes(p_post_id text, p_delta int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update posts set likes_count = greatest(0, coalesce(likes_count, 0) + sign(p_delta)::int)
   where id::text = p_post_id;
end $$;

-- invitation claim: the new member claims THEIR OWN pending invitation (matched on their login email).
-- Returns the invitation type ('founding', 'access', ...) or null. Sets the founding badge safely.
create or replace function public.claim_invitation()
returns text language plpgsql security definer set search_path = public as $$
declare
  me text := lower(trim(coalesce(auth.email(), '')));
  me_n text;
  inv record;
begin
  if auth.uid() is null or me = '' then return null; end if;
  me_n := case when split_part(me, '@', 2) in ('gmail.com', 'googlemail.com')
               then replace(split_part(me, '@', 1), '.', '') || '@gmail.com' else me end;
  select * into inv from invitations
   where status = 'pending'
     and (case when split_part(lower(trim(email)), '@', 2) in ('gmail.com', 'googlemail.com')
               then replace(split_part(lower(trim(email)), '@', 1), '.', '') || '@gmail.com'
               else lower(trim(email)) end) = me_n
   order by created_at desc limit 1;
  if not found then return null; end if;
  update invitations set status = 'used', password = null where id = inv.id;
  if inv.type = 'founding' then
    perform set_config('app.allow_profile_flags', '1', true);
    update profiles set is_founding = true where id = auth.uid();
  end if;
  return inv.type;
end $$;

grant execute on function public.adjust_show_likes(text, int) to authenticated;
grant execute on function public.bump_show_inquiries(text) to authenticated;
grant execute on function public.adjust_post_likes(text, int) to authenticated;
grant execute on function public.claim_invitation() to authenticated;
