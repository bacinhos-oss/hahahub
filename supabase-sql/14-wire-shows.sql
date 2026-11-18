-- LaffWire: a post can point to a show (automatic "NEW SHOW" post when a member lists a show).
-- Run in Supabase SQL Editor BEFORE the new website version goes live. Safe to run more than once.
alter table public.posts add column if not exists show_id text;
