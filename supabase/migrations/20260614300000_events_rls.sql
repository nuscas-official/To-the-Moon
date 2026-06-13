-- ==========================================================
-- NUSCAS Website — Events Row-Level Security Policies
-- Version 1.0 · June 2026
-- ==========================================================

-- 1. Ensure RLS is enabled on events and event_photos
alter table public.events enable row level security;
alter table public.event_photos enable row level security;

-- 2. Policy: Public can read events where status is not 'cancelled'
drop policy if exists "Allow public read access to active events" on public.events;
create policy "Allow public read access to active events" on public.events
  for select
  using (status != 'cancelled');

-- 3. Policy: Committee and Admins have full control over events
drop policy if exists "Allow committee and admin full access to events" on public.events;
create policy "Allow committee and admin full access to events" on public.events
  for all
  using (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'user_role', 
      'member'
    ) in ('committee', 'admin')
  );

-- 4. Policy: Public can read event photos for visible (non-cancelled) events
drop policy if exists "Allow public read access to event photos of active events" on public.event_photos;
create policy "Allow public read access to event photos of active events" on public.event_photos
  for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_photos.event_id
        and events.status != 'cancelled'
    )
  );

-- 5. Policy: Committee and Admins have full control over event photos
drop policy if exists "Allow committee and admin full access to event photos" on public.event_photos;
create policy "Allow committee and admin full access to event photos" on public.event_photos
  for all
  using (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'user_role', 
      'member'
    ) in ('committee', 'admin')
  );
