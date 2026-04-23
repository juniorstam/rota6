-- Rota 6 security hardening.
-- Idempotent: safe to run even when some tables have not been created yet.

alter table if exists public.profiles enable row level security;
alter table if exists public.motorcycles enable row level security;
alter table if exists public.trips enable row level security;
alter table if exists public.trip_stops enable row level security;
alter table if exists public.trip_photos enable row level security;
alter table if exists public.place_categories enable row level security;
alter table if exists public.routes enable row level security;
alter table if exists public.route_stops enable row level security;
alter table if exists public.reviewed_places enable row level security;
alter table if exists public.place_reviews enable row level security;

do $$
begin
  if to_regclass('public.profiles') is not null then
    execute 'drop policy if exists "profiles_read_public" on public.profiles';
    execute 'create policy "profiles_read_public" on public.profiles for select using (true)';
    execute 'drop policy if exists "profiles_insert_own" on public.profiles';
    execute 'create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id)';
    execute 'drop policy if exists "profiles_update_own" on public.profiles';
    execute 'create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;

  if to_regclass('public.motorcycles') is not null then
    execute 'drop policy if exists "motorcycles_read_public" on public.motorcycles';
    execute 'create policy "motorcycles_read_public" on public.motorcycles for select using (true)';
    execute 'drop policy if exists "motorcycles_insert_own" on public.motorcycles';
    execute 'create policy "motorcycles_insert_own" on public.motorcycles for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "motorcycles_update_own" on public.motorcycles';
    execute 'create policy "motorcycles_update_own" on public.motorcycles for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'drop policy if exists "motorcycles_delete_own" on public.motorcycles';
    execute 'create policy "motorcycles_delete_own" on public.motorcycles for delete using (auth.uid() = user_id)';
  end if;

  if to_regclass('public.trips') is not null then
    execute 'drop policy if exists "trips_read_public_or_own" on public.trips';
    execute 'create policy "trips_read_public_or_own" on public.trips for select using (visibility = ''public'' or auth.uid() = user_id)';
    execute 'drop policy if exists "trips_insert_own" on public.trips';
    execute 'create policy "trips_insert_own" on public.trips for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "trips_update_own" on public.trips';
    execute 'create policy "trips_update_own" on public.trips for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'drop policy if exists "trips_delete_own" on public.trips';
    execute 'create policy "trips_delete_own" on public.trips for delete using (auth.uid() = user_id)';
  end if;

  if to_regclass('public.trip_stops') is not null then
    execute 'drop policy if exists "trip_stops_read_public_or_own" on public.trip_stops';
    execute 'create policy "trip_stops_read_public_or_own" on public.trip_stops for select using (exists (select 1 from public.trips where trips.id = trip_stops.trip_id and (trips.visibility = ''public'' or trips.user_id = auth.uid())))';
    execute 'drop policy if exists "trip_stops_insert_own" on public.trip_stops';
    execute 'create policy "trip_stops_insert_own" on public.trip_stops for insert with check (exists (select 1 from public.trips where trips.id = trip_stops.trip_id and trips.user_id = auth.uid()))';
    execute 'drop policy if exists "trip_stops_update_own" on public.trip_stops';
    execute 'create policy "trip_stops_update_own" on public.trip_stops for update using (exists (select 1 from public.trips where trips.id = trip_stops.trip_id and trips.user_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = trip_stops.trip_id and trips.user_id = auth.uid()))';
    execute 'drop policy if exists "trip_stops_delete_own" on public.trip_stops';
    execute 'create policy "trip_stops_delete_own" on public.trip_stops for delete using (exists (select 1 from public.trips where trips.id = trip_stops.trip_id and trips.user_id = auth.uid()))';
  end if;

  if to_regclass('public.trip_photos') is not null then
    execute 'drop policy if exists "trip_photos_read_public_or_own" on public.trip_photos';
    execute 'create policy "trip_photos_read_public_or_own" on public.trip_photos for select using (exists (select 1 from public.trips where trips.id = trip_photos.trip_id and (trips.visibility = ''public'' or trips.user_id = auth.uid())))';
    execute 'drop policy if exists "trip_photos_insert_own" on public.trip_photos';
    execute 'create policy "trip_photos_insert_own" on public.trip_photos for insert with check (exists (select 1 from public.trips where trips.id = trip_photos.trip_id and trips.user_id = auth.uid()))';
    execute 'drop policy if exists "trip_photos_update_own" on public.trip_photos';
    execute 'create policy "trip_photos_update_own" on public.trip_photos for update using (exists (select 1 from public.trips where trips.id = trip_photos.trip_id and trips.user_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = trip_photos.trip_id and trips.user_id = auth.uid()))';
    execute 'drop policy if exists "trip_photos_delete_own" on public.trip_photos';
    execute 'create policy "trip_photos_delete_own" on public.trip_photos for delete using (exists (select 1 from public.trips where trips.id = trip_photos.trip_id and trips.user_id = auth.uid()))';
  end if;

  if to_regclass('public.place_categories') is not null then
    execute 'drop policy if exists "place_categories_read_public" on public.place_categories';
    execute 'create policy "place_categories_read_public" on public.place_categories for select using (true)';
  end if;

  if to_regclass('public.routes') is not null then
    execute 'drop policy if exists "routes_read_own" on public.routes';
    execute 'create policy "routes_read_own" on public.routes for select using (auth.uid() = user_id)';
    execute 'drop policy if exists "routes_insert_own" on public.routes';
    execute 'create policy "routes_insert_own" on public.routes for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "routes_update_own" on public.routes';
    execute 'create policy "routes_update_own" on public.routes for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'drop policy if exists "routes_delete_own" on public.routes';
    execute 'create policy "routes_delete_own" on public.routes for delete using (auth.uid() = user_id)';
  end if;

  if to_regclass('public.route_stops') is not null then
    execute 'drop policy if exists "route_stops_read_own" on public.route_stops';
    execute 'create policy "route_stops_read_own" on public.route_stops for select using (exists (select 1 from public.routes where routes.id = route_stops.route_id and routes.user_id = auth.uid()))';
    execute 'drop policy if exists "route_stops_insert_own" on public.route_stops';
    execute 'create policy "route_stops_insert_own" on public.route_stops for insert with check (exists (select 1 from public.routes where routes.id = route_stops.route_id and routes.user_id = auth.uid()))';
    execute 'drop policy if exists "route_stops_update_own" on public.route_stops';
    execute 'create policy "route_stops_update_own" on public.route_stops for update using (exists (select 1 from public.routes where routes.id = route_stops.route_id and routes.user_id = auth.uid())) with check (exists (select 1 from public.routes where routes.id = route_stops.route_id and routes.user_id = auth.uid()))';
    execute 'drop policy if exists "route_stops_delete_own" on public.route_stops';
    execute 'create policy "route_stops_delete_own" on public.route_stops for delete using (exists (select 1 from public.routes where routes.id = route_stops.route_id and routes.user_id = auth.uid()))';
  end if;

  if to_regclass('public.reviewed_places') is not null then
    execute 'drop policy if exists "reviewed_places_read_all" on public.reviewed_places';
    execute 'create policy "reviewed_places_read_all" on public.reviewed_places for select using (true)';
  end if;

  if to_regclass('public.place_reviews') is not null then
    execute 'drop policy if exists "place_reviews_read_all" on public.place_reviews';
    execute 'create policy "place_reviews_read_all" on public.place_reviews for select using (true)';
    execute 'drop policy if exists "place_reviews_insert_own" on public.place_reviews';
    execute 'create policy "place_reviews_insert_own" on public.place_reviews for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "place_reviews_update_own" on public.place_reviews';
    execute 'create policy "place_reviews_update_own" on public.place_reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'drop policy if exists "place_reviews_delete_own" on public.place_reviews';
    execute 'create policy "place_reviews_delete_own" on public.place_reviews for delete using (auth.uid() = user_id)';
  end if;
end $$;
