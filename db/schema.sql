create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique not null,
  name text not null,
  avatar_url text,
  cover_url text,
  city text,
  state text,
  region text,
  motorcycle_text text,
  motorcycle_brand text,
  motorcycle_model text,
  bio text,
  travel_style text check (travel_style in ('solo', 'casal', 'grupo', 'bate-volta', 'longa-distancia')),
  contact_email text,
  phone text,
  instagram_handle text,
  published_trips_count integer not null default 0,
  published_recommendations_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_username text;
  full_name text;
begin
  full_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Novo motociclista');
  next_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9]+', '', 'g'));

  insert into public.profiles (
    id,
    email,
    username,
    name,
    contact_email,
    travel_style
  )
  values (
    new.id,
    new.email,
    next_username,
    full_name,
    new.email,
    'solo'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  brand text,
  model text,
  year integer,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists place_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid not null references place_categories(id),
  created_by_user_id uuid references profiles(id),
  created_by_role text not null default 'usuario' check (created_by_role in ('usuario', 'admin')),
  name text not null,
  description text,
  address text,
  city text,
  state text,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  average_rating numeric(3,2) not null default 0,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  moderation_status text not null default 'approved' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists place_photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  origin_label text not null,
  destination_label text not null,
  summary text,
  road_level text not null check (road_level in ('tranquila', 'moderada', 'tecnica')),
  trip_type text not null check (trip_type in ('solo', 'casal', 'grupo')),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  distance_km numeric(8,2),
  duration_hours numeric(6,2),
  route_source text,
  route_polyline jsonb,
  tips text[] not null default '{}',
  tags text[] not null default '{}',
  comments_count integer not null default 0,
  moderation_status text not null default 'approved' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_user_slug_unique unique (user_id, slug)
);

create table if not exists trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  place_id uuid references places(id) on delete set null,
  stop_order integer not null,
  label text not null,
  city text,
  state text,
  stop_type text,
  notes text,
  planned_arrival_at timestamptz,
  latitude numeric(9,6),
  longitude numeric(9,6)
);

create table if not exists trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  storage_path text not null,
  is_cover boolean not null default false,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 0 and rating <= 5),
  comment text,
  safe_for_motorcycle boolean,
  good_for_groups boolean,
  price_perception text check (price_perception in ('barato', 'medio', 'caro')),
  traveler_structure text check (traveler_structure in ('ruim', 'ok', 'boa', 'otima')),
  would_recommend boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  place_id uuid references places(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_target_check check (
    (trip_id is not null and place_id is null) or
    (trip_id is null and place_id is not null)
  )
);

create table if not exists favorite_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  favorite_list_id uuid references favorite_lists(id) on delete set null,
  place_id uuid references places(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_target_check check (
    (place_id is not null and trip_id is null) or
    (place_id is null and trip_id is not null)
  )
);

create table if not exists admin_flags (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('place', 'review', 'trip', 'comment')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_by_user_id uuid references profiles(id) on delete set null,
  assigned_admin_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_places_category_id on places(category_id);
create index if not exists idx_places_featured on places(is_featured);
create index if not exists idx_places_geo on places(latitude, longitude);
create index if not exists idx_reviews_place_id on reviews(place_id);
create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_trips_visibility on trips(visibility);
create index if not exists idx_trip_stops_trip_id on trip_stops(trip_id);
create index if not exists idx_trip_photos_trip_id on trip_photos(trip_id);
create index if not exists idx_comments_trip_id on comments(trip_id);
create index if not exists idx_comments_place_id on comments(place_id);
create index if not exists idx_favorites_user_id on favorites(user_id);

alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_stops enable row level security;
alter table trip_photos enable row level security;
alter table favorite_lists enable row level security;
alter table favorites enable row level security;

create policy "profiles are public for read"
on profiles for select
using (true);

create policy "users manage own profile"
on profiles for update
using (auth.uid() = id);

create policy "users insert own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "public trips are readable"
on trips for select
using (visibility = 'public' or auth.uid() = user_id);

create policy "users insert own trips"
on trips for insert
with check (auth.uid() = user_id);

create policy "users update own trips"
on trips for update
using (auth.uid() = user_id);

create policy "users delete own trips"
on trips for delete
using (auth.uid() = user_id);

create policy "trip stops follow trip visibility"
on trip_stops for select
using (
  exists (
    select 1 from trips
    where trips.id = trip_stops.trip_id
      and (trips.visibility = 'public' or trips.user_id = auth.uid())
  )
);

create policy "users manage own trip stops"
on trip_stops for all
using (
  exists (
    select 1 from trips
    where trips.id = trip_stops.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from trips
    where trips.id = trip_stops.trip_id
      and trips.user_id = auth.uid()
  )
);

create policy "trip photos follow trip visibility"
on trip_photos for select
using (
  exists (
    select 1 from trips
    where trips.id = trip_photos.trip_id
      and (trips.visibility = 'public' or trips.user_id = auth.uid())
  )
);

create policy "users manage own trip photos"
on trip_photos for all
using (
  exists (
    select 1 from trips
    where trips.id = trip_photos.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from trips
    where trips.id = trip_photos.trip_id
      and trips.user_id = auth.uid()
  )
);

create policy "users manage own favorite lists"
on favorite_lists for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own favorites"
on favorites for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
