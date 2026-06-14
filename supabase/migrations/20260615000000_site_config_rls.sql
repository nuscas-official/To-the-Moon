-- ==========================================================
-- NUSCAS Website — Row-Level Security Policies for site_config
-- Milestone 8 · June 2026
-- ==========================================================

-- Drop any existing policies on site_config
drop policy if exists "Allow public SELECT on site_config" on public.site_config;
drop policy if exists "Allow admins and committee INSERT on site_config" on public.site_config;
drop policy if exists "Allow admins and committee UPDATE on site_config" on public.site_config;
drop policy if exists "Allow admins and committee DELETE on site_config" on public.site_config;

-- 1. Allow public SELECT (read-only access for anyone including guests)
create policy "Allow public SELECT on site_config" on public.site_config
  for select using (true);

-- 2. Allow admins and committee members full write access
create policy "Allow admins and committee INSERT on site_config" on public.site_config
  for insert with check (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') in ('admin', 'committee')
  );

create policy "Allow admins and committee UPDATE on site_config" on public.site_config
  for update using (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') in ('admin', 'committee')
  );

create policy "Allow admins and committee DELETE on site_config" on public.site_config
  for delete using (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') in ('admin', 'committee')
  );
