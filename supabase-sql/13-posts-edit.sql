-- LaffWire: authors can edit and delete their own posts. Admin can delete any post.
-- Run in Supabase SQL Editor BEFORE the new website version goes live. Safe to run more than once.
alter table public.posts add column if not exists edited_at timestamptz;

create or replace function public.edit_post(p_post_id text, p_content text, p_type text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if length(trim(coalesce(p_content, ''))) = 0 or length(p_content) > 500 then
    raise exception 'post must be 1 to 500 characters';
  end if;
  update posts
     set content = trim(p_content),
         type = coalesce(nullif(p_type, ''), type),
         edited_at = now()
   where id::text = p_post_id and user_id = auth.uid();
  if not found then raise exception 'not allowed'; end if;
end $$;

create or replace function public.delete_post(p_post_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from posts
   where id::text = p_post_id
     and (user_id = auth.uid() or auth.email() = 'bacinhos@gmail.com');
  if not found then raise exception 'not allowed'; end if;
end $$;

revoke all on function public.edit_post(text, text, text) from public, anon;
revoke all on function public.delete_post(text) from public, anon;
grant execute on function public.edit_post(text, text, text) to authenticated;
grant execute on function public.delete_post(text) to authenticated;
