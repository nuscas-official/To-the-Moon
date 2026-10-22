-- ==========================================================
-- NUSCAS Website — Anime of the Season nominations & votes
-- Version 1.2 · October 2026
--
-- Members nominate and vote via the Telegram bot. The most-voted
-- nomination for the current season is shown in the homepage hero,
-- unless an admin pins a manual pick in Admin → Settings.
-- ==========================================================

-- season_nominations: one row per (season, AniList title)
create table public.season_nominations (
  id               uuid primary key default gen_random_uuid(),
  season           text not null check (season ~ '^\d{4}-(winter|spring|summer|fall)$'),
  anilist_id       integer not null,
  title            text not null,
  image_url        text,
  accent_hex       text,
  nominated_by     uuid references public.users(id) on delete set null,
  created_at       timestamptz default now(),
  unique(season, anilist_id)
);

-- season_votes: one vote per member per season (changing it overwrites)
create table public.season_votes (
  season           text not null,
  user_id          uuid not null references public.users(id) on delete cascade,
  nomination_id    uuid not null references public.season_nominations(id) on delete cascade,
  updated_at       timestamptz default now(),
  primary key (season, user_id)
);

create index season_votes_nomination_idx on public.season_votes(nomination_id);

-- Writes go through the bot's service-role client, so no write policies.
alter table public.season_nominations enable row level security;
alter table public.season_votes enable row level security;

-- Nominee list is public (it ends up on the homepage anyway).
create policy "Allow public SELECT on season_nominations" on public.season_nominations
  for select using (true);

-- Individual votes stay private; tallies are computed server-side.
