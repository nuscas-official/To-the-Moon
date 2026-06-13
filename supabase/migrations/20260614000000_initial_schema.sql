-- ==========================================================
-- NUSCAS Website — Initial Schema Migration
-- Version 1.0 · June 2026
-- ==========================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. TABLES

-- users: extended profile, synced from auth.users via triggers
create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  display_name    text not null,
  role            text not null default 'member' check (role in ('member','committee','admin')),
  telegram_id     bigint unique,
  created_at      timestamptz default now(),
  last_sign_in    timestamptz,
  is_active       boolean default true
);

-- posts: blog reviews, news, essays, interviews
create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references public.users(id),
  title           text not null,
  slug            text unique not null,
  content_mdx     text not null,
  type            text not null check (type in ('news','review','essay','interview')),
  status          text not null default 'draft' check (status in ('draft','pending_review','published','archived')),
  cover_image_key text,
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- events: club activities
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  created_by      uuid references public.users(id),
  title           text not null,
  slug            text unique not null,
  description     text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  location        text,
  status          text not null default 'upcoming' check (status in ('upcoming','past','cancelled')),
  cover_image_key text,
  created_at      timestamptz default now()
);

-- event_photos: image galleries associated with events
create table public.event_photos (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references public.events(id) on delete cascade,
  storage_key     text not null,
  alt_text        text,
  display_order   integer default 0,
  uploaded_by     uuid references public.users(id),
  created_at      timestamptz default now()
);

-- gallery_artworks: curated member artwork
create table public.gallery_artworks (
  id              uuid primary key default gen_random_uuid(),
  storage_key     text not null,
  title           text,
  artist_credit   text not null,
  uploaded_by     uuid references public.users(id),
  display_order   integer default 0,
  status          text not null default 'visible' check (status in ('visible','removed')),
  created_at      timestamptz default now()
);

-- gallery_consent: audit logs of artwork permissions and takedowns
create table public.gallery_consent (
  id                    uuid primary key default gen_random_uuid(),
  artwork_id            uuid references public.gallery_artworks(id) on delete cascade,
  consented_by          uuid references public.users(id),
  consented_at          timestamptz not null,
  consent_method        text not null,
  artist_credit         text not null,
  removal_requested_at  timestamptz,
  removed_at            timestamptz
);

-- ratings: member score inputs for anime / manga / etc.
create table public.ratings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade,
  anilist_id      integer not null,
  media_type      text not null check (media_type in ('anime','manga','other')),
  title_en        text not null,
  cover_image_url text,
  score           smallint not null check (score between 1 and 10),
  note            text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, anilist_id)
);

-- invite_tokens: JWT single-use registration tokens
create table public.invite_tokens (
  id              uuid primary key default gen_random_uuid(),
  token           text unique not null,
  generated_by    uuid references public.users(id),
  generated_at    timestamptz default now(),
  expires_at      timestamptz not null,
  used_by         uuid references public.users(id),
  used_at         timestamptz,
  revoked_at      timestamptz
);

-- audit_log: append-only tracing log for admin operations
create table public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  actor_id        uuid references public.users(id),
  action          text not null,
  target_id       uuid,
  metadata        jsonb,
  created_at      timestamptz default now()
);

-- site_config: dynamic key-value settings editable by admins
create table public.site_config (
  key             text primary key,
  value           jsonb not null,
  updated_by      uuid references public.users(id),
  updated_at      timestamptz default now()
);

-- telegram_link_codes: transient alphanumeric codes for bot account pairing
create table public.telegram_link_codes (
  code            text primary key,
  user_id         uuid references public.users(id) on delete cascade,
  created_at      timestamptz default now(),
  expires_at      timestamptz not null,
  used            boolean default false
);

-- ==========================================================
-- 3. VIEWS

-- public_rating_aggregates: query source for public ratings (anonymity threshold >= 3)
create or replace view public.public_rating_aggregates as
select
  anilist_id,
  media_type,
  title_en,
  cover_image_url,
  round(avg(score)::numeric, 1) as average_score,
  count(*) as rating_count
from public.ratings
group by anilist_id, media_type, title_en, cover_image_url
having count(*) >= 3;

-- ==========================================================
-- 4. ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.events enable row level security;
alter table public.event_photos enable row level security;
alter table public.gallery_artworks enable row level security;
alter table public.gallery_consent enable row level security;
alter table public.ratings enable row level security;
alter table public.invite_tokens enable row level security;
alter table public.audit_log enable row level security;
alter table public.site_config enable row level security;
alter table public.telegram_link_codes enable row level security;

-- ==========================================================
-- 5. BASE POLICIES FOR USERS TABLE (Milestone 1)
create policy "Allow active user profiles to be viewed by authenticated users" on public.users
  for select using (is_active = true);

create policy "Allow users to update their own profiles" on public.users
  for update using (auth.uid() = id);

-- ==========================================================
-- 6. TRIGGER FUNCTIONS

-- Sync trigger function on auth.users INSERT
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'member',
    true
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(new.raw_user_meta_data->>'name', public.users.display_name),
    last_sign_in = now();
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger function on auth.users UPDATE to sync last_sign_in
create or replace function public.handle_user_login_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.users
  set last_sign_in = now()
  where id = new.id;
  return new;
end;
$$;

create or replace trigger on_auth_user_sign_in
  after update of last_sign_in_at on auth.users
  for each row execute procedure public.handle_user_login_update();

-- ==========================================================
-- 7. AUTHENTICATION JWT CUSTOM CLAIM HOOK
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  claims jsonb;
  user_role text;
begin
  -- Fetch the user role from our public profiles table
  select role into user_role from public.users where id = (event->>'user_id')::uuid;

  -- Default to member if not set
  if user_role is null then
    user_role := 'member';
  end if;

  claims := event->'claims';
  
  -- Set claim under app_metadata
  claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));

  -- Return the modified session token event
  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
