-- Air2Ground Resilient — Stage 2 schema
-- Run in the Supabase SQL editor of the NEW Resilient project (not Meats).
-- Covers: profiles + score_snapshots, with row-level security on both.

-- ── profiles ──────────────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  living      text,
  skills      text,
  budget      text,
  constraints text[] not null default '{}',
  worry       text,
  pace        text,
  region      text,                -- coarse, consented (Stage 6)
  household   jsonb,               -- [soon] household members
  founding    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile read"   on public.profiles for select using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── score_snapshots — powers the living score & trend line ───────────
create table if not exists public.score_snapshots (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  captured_at timestamptz not null default now(),
  overall     integer not null,
  pillars     jsonb not null      -- {food, water, power, supply, skill}
);

create index if not exists score_snapshots_user_time
  on public.score_snapshots (user_id, captured_at);

alter table public.score_snapshots enable row level security;

create policy "own snapshots read"   on public.score_snapshots for select using (auth.uid() = user_id);
create policy "own snapshots insert" on public.score_snapshots for insert with check (auth.uid() = user_id);
