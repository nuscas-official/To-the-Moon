-- ==========================================================
-- NUSCAS Website — Gallery RLS Policies
-- Version 1.0 · June 2026
-- ==========================================================

-- 1. Ensure RLS is enabled on gallery tables
alter table public.gallery_artworks enable row level security;
alter table public.gallery_consent enable row level security;

-- 3. Policy: Public can read visible gallery artworks
drop policy if exists "Allow public read access to visible gallery artworks" on public.gallery_artworks;
create policy "Allow public read access to visible gallery artworks" on public.gallery_artworks
  for select
  using (status = 'visible');

-- 4. Policy: Committee and Admins have full access to gallery artworks
drop policy if exists "Allow committee and admin full access to gallery artworks" on public.gallery_artworks;
create policy "Allow committee and admin full access to gallery artworks" on public.gallery_artworks
  for all
  using (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'user_role', 
      'member'
    ) in ('committee', 'admin')
  );

-- 5. Policy: Committee and Admins have full access to gallery consent logs
drop policy if exists "Allow committee and admin full access to gallery consent" on public.gallery_consent;
create policy "Allow committee and admin full access to gallery consent" on public.gallery_consent
  for all
  using (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'user_role', 
      'member'
    ) in ('committee', 'admin')
  );
