-- ==========================================================
-- NUSCAS Website — Optimize RLS Policies using JWT Claims
-- Milestone 7 · June 2026
-- ==========================================================

-- Drop old subquery-based policies to avoid recursion
drop policy if exists "Allow admins full access to invite_tokens" on public.invite_tokens;
drop policy if exists "Allow admins SELECT access on audit_log" on public.audit_log;
drop policy if exists "Allow admins SELECT access on users" on public.users;
drop policy if exists "Allow admins UPDATE access on users" on public.users;

-- Create optimized policies using the JWT user_role claim
create policy "Allow admins full access to invite_tokens" on public.invite_tokens
  for all using (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  );

create policy "Allow admins SELECT access on audit_log" on public.audit_log
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  );

create policy "Allow admins SELECT access on users" on public.users
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  );

create policy "Allow admins UPDATE access on users" on public.users
  for update using (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  );
