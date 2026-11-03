-- STEP 2 of 2: run ONLY after the new website version is live (it uses the step-1 functions).

-- 1) INVITATIONS: nobody but the admin may read, create or delete them; wipe stored passwords
drop policy if exists "anyone can read pending invitations" on invitations;
drop policy if exists "allow delete invitations" on invitations;
drop policy if exists "Authenticated users can insert invitations" on invitations;
create policy "admin insert invitations" on invitations for insert
  with check (auth.email() = 'bacinhos@gmail.com');
create policy "admin delete invitations" on invitations for delete
  using (auth.email() = 'bacinhos@gmail.com');
update invitations set password = null where status = 'used';

-- 2) SHOWS: nobody can edit other people's shows any more (counters go through the functions)
drop policy if exists "Anyone can update like stats" on shows;
drop policy if exists "Anyone can update view stats" on shows;
drop policy if exists "Authenticated users can insert shows" on shows;
drop policy if exists "Users can insert shows" on shows;
create policy "Users insert own shows" on shows for insert
  with check (auth.uid() = user_id);

-- 3) POSTS: nobody can rewrite other people's posts
drop policy if exists "Anyone can update post likes" on posts;

-- 4) PROFILES: members cannot give themselves Verified / Founding / plan flags
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
  else
    new.is_verified := old.is_verified;
    new.is_founding := old.is_founding;
    new.user_type := old.user_type;
    new.is_paid := old.is_paid;
    new.subscription_expiry := old.subscription_expiry;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_flags on profiles;
create trigger protect_profile_flags before insert or update on profiles
  for each row execute function public.protect_profile_flags();
