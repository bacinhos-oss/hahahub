-- STEP B: run ONLY after the new website version is live. Profiles (with e-mails) become visible to logged-in members only.
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname='public' and tablename='profiles' and cmd='SELECT' loop
    execute format('drop policy %I on public.profiles', r.policyname);
  end loop;
end $$;
create policy "members read profiles" on public.profiles for select to authenticated using (true);
