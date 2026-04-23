-- Migration: create proper follows table
-- Run this on Supabase before deploying follow-repository changes.
-- After running, update lib/repositories/follow-repository.ts to use this table.

create table if not exists public.follows (
  id          uuid        primary key default gen_random_uuid(),
  follower_id uuid        not null references auth.users(id) on delete cascade,
  following_id uuid       not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;

create index if not exists idx_follows_follower  on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- Owner can insert / delete their own follows; everyone can read (needed for follower counts)
drop policy if exists "users can manage own follows" on public.follows;
create policy "users can manage own follows"
  on public.follows
  for all
  using  (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

drop policy if exists "follows_read_all" on public.follows;
create policy "follows_read_all"
  on public.follows
  for select
  using (true);
