-- Enable Realtime for the users table
do $$
begin
  if not exists (
    select 1 from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'users'
  ) then
    alter publication supabase_realtime add table public.users;
  end if;
end $$;

-- Allow users to SELECT their own profile (even if deactivated, to receive the update)
drop policy if exists "Allow users to select their own profile" on public.users;
create policy "Allow users to select their own profile" on public.users
  for select using (auth.uid() = id);
