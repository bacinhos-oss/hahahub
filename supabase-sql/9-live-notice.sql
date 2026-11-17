-- Remembers who already got the "HahaHub.art is live" email, so nobody gets it twice.
-- Run ONCE in Supabase SQL Editor BEFORE the new website version goes live.
alter table public.invitations add column if not exists live_sent boolean not null default false;
