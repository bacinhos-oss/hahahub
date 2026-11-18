-- New show fields: Still in repertoire, Audience, Gender-flexible roles, Full recording on request, Excerpt language.
-- "Deal type" now also covers co-production (old "Rights status: Co-production Only").
-- Run in Supabase SQL Editor BEFORE the new website version goes live. Safe to run more than once.
alter table public.shows add column if not exists still_running boolean;
alter table public.shows add column if not exists audience text;
alter table public.shows add column if not exists gender_flexible boolean;
alter table public.shows add column if not exists full_recording boolean;
alter table public.shows add column if not exists script_excerpt_language text;

update public.shows
set license_type = 'Co-production'
where rights_status = 'Co-production Only'
  and coalesce(license_type, 'License') = 'License';
