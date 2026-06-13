-- ==========================================================
-- NUSCAS Website — Posts Row-Level Security Policies
-- Version 1.0 · June 2026
-- ==========================================================

-- 1. Enable RLS on public.posts
alter table public.posts enable row level security;

-- 2. Policy: Public can read published posts
create policy "Allow public read access to published posts" on public.posts
  for select
  using (status = 'published');

-- 3. Policy: Members can read their own posts (any status)
create policy "Allow members to read their own posts" on public.posts
  for select
  using (auth.uid() = author_id);

-- 4. Policy: Members can insert posts with status 'draft' or 'pending_review' only
create policy "Allow members to insert their own drafts or pending reviews" on public.posts
  for insert
  with check (
    auth.uid() = author_id 
    and status in ('draft', 'pending_review')
  );

-- 5. Policy: Members can update their own posts only when status is 'draft'
create policy "Allow members to update their own draft posts" on public.posts
  for update
  using (auth.uid() = author_id and status = 'draft')
  with check (
    auth.uid() = author_id 
    and status in ('draft', 'pending_review')
  );

-- 6. Policy: Committee and Admins have full control (all operations)
create policy "Allow committee and admin full access to posts" on public.posts
  for all
  using (
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'user_role', 
      'member'
    ) in ('committee', 'admin')
  );
