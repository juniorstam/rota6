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

create table if not exists public.reviewed_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  category text not null check (category in ('restaurant', 'cafe', 'bar', 'fuel', 'hotel', 'repair', 'viewpoint', 'tourism')),
  address text,
  city text,
  state text,
  source_provider text,
  provider_place_id text,
  average_rating numeric(3,2) not null default 0,
  ratings_count integer not null default 0,
  rota6_score numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.reviewed_places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_reviewed_places_category on public.reviewed_places(category);
create index if not exists idx_reviewed_places_provider_place_id on public.reviewed_places(source_provider, provider_place_id);
create index if not exists idx_place_reviews_place_id on public.place_reviews(place_id);
create unique index if not exists idx_place_reviews_place_user on public.place_reviews(place_id, user_id);

create or replace function public.refresh_reviewed_place_rating()
returns trigger
language plpgsql
as $$
declare
  target_place_id uuid;
begin
  target_place_id = coalesce(new.place_id, old.place_id);

  update public.reviewed_places
  set
    average_rating = coalesce((select round(avg(rating)::numeric, 2) from public.place_reviews where place_id = target_place_id), 0),
    ratings_count = coalesce((select count(*) from public.place_reviews where place_id = target_place_id), 0),
    updated_at = now()
  where id = target_place_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists routes_set_updated_at on public.routes;
create trigger routes_set_updated_at
before update on public.routes
for each row execute procedure public.set_updated_at();

drop trigger if exists reviewed_places_set_updated_at on public.reviewed_places;
create trigger reviewed_places_set_updated_at
before update on public.reviewed_places
for each row execute procedure public.set_updated_at();

drop trigger if exists place_reviews_refresh_rating on public.place_reviews;
create trigger place_reviews_refresh_rating
after insert or update or delete on public.place_reviews
for each row execute procedure public.refresh_reviewed_place_rating();

insert into public.reviewed_places (
  id,
  name,
  latitude,
  longitude,
  category,
  address,
  city,
  state,
  source_provider,
  provider_place_id,
  average_rating,
  ratings_count,
  rota6_score
) values
  ('11111111-1111-4111-8111-111111111111', 'Mirante da Serra da Graciosa', -25.3477, -48.9998, 'viewpoint', 'Estrada da Graciosa', 'Quatro Barras', 'PR', 'rota6_seed', 'serra-graciosa-viewpoint', 4.8, 42, 93),
  ('22222222-2222-4222-8222-222222222222', 'Mirante Serra do Rio do Rastro', -28.3926, -49.5487, 'viewpoint', 'SC-390', 'Bom Jardim da Serra', 'SC', 'rota6_seed', 'rio-rastro-viewpoint', 4.9, 76, 97),
  ('33333333-3333-4333-8333-333333333333', 'Parada Morretes', -25.4761, -48.8343, 'cafe', 'Centro histórico', 'Morretes', 'PR', 'rota6_seed', 'cafe-morretes', 4.5, 18, 82)
on conflict (id) do nothing;

alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.reviewed_places enable row level security;
alter table public.place_reviews enable row level security;

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

drop policy if exists "reviewed_places_read_all" on public.reviewed_places;
create policy "reviewed_places_read_all"
on public.reviewed_places
for select
using (true);

drop policy if exists "place_reviews_read_all" on public.place_reviews;
create policy "place_reviews_read_all"
on public.place_reviews
for select
using (true);

drop policy if exists "place_reviews_insert_own" on public.place_reviews;
create policy "place_reviews_insert_own"
on public.place_reviews
for insert
with check (auth.uid() = user_id);

drop policy if exists "place_reviews_update_own" on public.place_reviews;
create policy "place_reviews_update_own"
on public.place_reviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "place_reviews_delete_own" on public.place_reviews;
create policy "place_reviews_delete_own"
on public.place_reviews
for delete
using (auth.uid() = user_id);
