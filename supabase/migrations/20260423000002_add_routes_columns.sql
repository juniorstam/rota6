-- Migration: add stops_count, name, is_public to routes table

alter table public.routes
  add column if not exists stops_count int         not null default 0,
  add column if not exists name        text,
  add column if not exists is_public   bool        not null default false;

-- Partial index to efficiently list public routes for discovery
create index if not exists idx_routes_public
  on public.routes(user_id, updated_at desc)
  where is_public = true;

-- Trigger to keep stops_count in sync automatically
create or replace function public.refresh_route_stops_count()
returns trigger language plpgsql as $$
begin
  update public.routes
  set stops_count = (
    select count(*) from public.route_stops
    where route_id = coalesce(new.route_id, old.route_id)
  )
  where id = coalesce(new.route_id, old.route_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists route_stops_sync_count on public.route_stops;
create trigger route_stops_sync_count
  after insert or delete on public.route_stops
  for each row execute procedure public.refresh_route_stops_count();

-- Allow public routes to be read by anyone
drop policy if exists "routes_read_public" on public.routes;
create policy "routes_read_public"
  on public.routes
  for select
  using (is_public = true);
