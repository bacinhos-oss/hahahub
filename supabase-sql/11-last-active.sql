-- Admin sees when each member last signed in and when they joined.
-- Run ONCE in Supabase SQL Editor, BEFORE the new website version goes live.
create or replace function public.admin_last_seen()
returns table (id uuid, last_sign_in_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path = public, auth stable as $$
begin
  if coalesce(auth.email(), '') <> 'bacinhos@gmail.com' then
    raise exception 'not allowed';
  end if;
  return query select u.id, u.last_sign_in_at, u.created_at from auth.users u;
end;
$$;
revoke all on function public.admin_last_seen() from public, anon;
grant execute on function public.admin_last_seen() to authenticated;
