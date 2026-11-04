-- Outreach list for the admin (people you plan to invite). Only the admin can see or change it.
create table if not exists public.outreach (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  org text,
  country text,
  status text not null default 'to_contact',
  note text,
  created_at timestamptz not null default now()
);
alter table public.outreach enable row level security;
drop policy if exists "admin outreach all" on public.outreach;
create policy "admin outreach all" on public.outreach for all
  using (auth.email() = 'bacinhos@gmail.com')
  with check (auth.email() = 'bacinhos@gmail.com');
