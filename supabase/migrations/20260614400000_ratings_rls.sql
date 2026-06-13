-- ==========================================================
-- NUSCAS Website — Ratings Row-Level Security Policies
-- Version 1.0 · June 2026
-- ==========================================================

-- 1. Ensure RLS is enabled on ratings
alter table public.ratings enable row level security;

-- 2. Policy: Members can read their own ratings
drop policy if exists "Allow users to view their own ratings" on public.ratings;
create policy "Allow users to view their own ratings" on public.ratings
  for select
  using (auth.uid() = user_id);

-- 3. Policy: Members can insert their own ratings
drop policy if exists "Allow users to insert their own ratings" on public.ratings;
create policy "Allow users to insert their own ratings" on public.ratings
  for insert
  with check (auth.uid() = user_id);

-- 4. Policy: Members can update their own ratings
drop policy if exists "Allow users to update their own ratings" on public.ratings;
create policy "Allow users to update their own ratings" on public.ratings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Policy: Members can delete their own ratings
drop policy if exists "Allow users to delete their own ratings" on public.ratings;
create policy "Allow users to delete their own ratings" on public.ratings
  for delete
  using (auth.uid() = user_id);
