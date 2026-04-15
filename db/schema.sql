create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin_name text not null,
  origin_lat double precision not null,
  origin_lng double precision not null,
  destination_name text not null,
  destination_lat double precision not null,
  destination_lng double precision not null,
  distance_km numeric(8,2),
  duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  type text not null,
  order_index integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_routes_user_id on public.routes(user_id);
create index if not exists idx_route_stops_route_id on public.route_stops(route_id);
create index if not exists idx_route_stops_order on public.route_stops(route_id, order_index);

drop trigger if exists routes_set_updated_at on public.routes;
create trigger routes_set_updated_at
before update on public.routes
for each row execute procedure public.set_updated_at();

alter table public.routes enable row level security;
alter table public.route_stops enable row level security;

drop policy if exists "routes_read_own" on public.routes;
create policy "routes_read_own"
on public.routes
for select
using (auth.uid() = user_id);

drop policy if exists "routes_insert_own" on public.routes;
create policy "routes_insert_own"
on public.routes
for insert
with check (auth.uid() = user_id);

drop policy if exists "routes_update_own" on public.routes;
create policy "routes_update_own"
on public.routes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "routes_delete_own" on public.routes;
create policy "routes_delete_own"
on public.routes
for delete
using (auth.uid() = user_id);

drop policy if exists "route_stops_read_own" on public.route_stops;
create policy "route_stops_read_own"
on public.route_stops
for select
using (
  exists (
    select 1
    from public.routes
    where routes.id = route_stops.route_id
      and routes.user_id = auth.uid()
  )
);

drop policy if exists "route_stops_insert_own" on public.route_stops;
create policy "route_stops_insert_own"
on public.route_stops
for insert
with check (
  exists (
    select 1
    from public.routes
    where routes.id = route_stops.route_id
      and routes.user_id = auth.uid()
  )
);

drop policy if exists "route_stops_update_own" on public.route_stops;
create policy "route_stops_update_own"
on public.route_stops
for update
using (
  exists (
    select 1
    from public.routes
    where routes.id = route_stops.route_id
      and routes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.routes
    where routes.id = route_stops.route_id
      and routes.user_id = auth.uid()
  )
);

drop policy if exists "route_stops_delete_own" on public.route_stops;
create policy "route_stops_delete_own"
on public.route_stops
for delete
using (
  exists (
    select 1
    from public.routes
    where routes.id = route_stops.route_id
      and routes.user_id = auth.uid()
  )
);
