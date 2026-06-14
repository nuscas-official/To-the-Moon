-- ==========================================================
-- NUSCAS Website — Invite Tokens and Audit Log RLS Policies
-- Milestone 7 · June 2026
-- ==========================================================

-- 1. invite_tokens RLS Policies: only admin role can SELECT/INSERT/UPDATE/DELETE
create policy "Allow admins full access to invite_tokens" on public.invite_tokens
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 2. audit_log RLS Policies: only admin can SELECT
create policy "Allow admins SELECT access on audit_log" on public.audit_log
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 3. Update public.users policies to grant admins SELECT and UPDATE access
create policy "Allow admins SELECT access on users" on public.users
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Allow admins UPDATE access on users" on public.users
  for update using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );
