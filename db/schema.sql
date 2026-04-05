create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  username text unique not null,
  name text not null,
  avatar_url text,
  cover_url text,
  city text,
  state text,
  motorcycle_text text,
  bio text,
  travel_style text check (travel_style in ('solo', 'casal', 'grupo', 'bate-volta', 'longa-distancia')),
  published_trips_count integer not null default 0,
  published_recommendations_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
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
  created_by_user_id uuid references users(id),
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
  user_id uuid not null references users(id) on delete cascade,
  slug text unique not null,
  title text not null,
  origin_label text not null,
  destination_label text not null,
  summary text,
  cover_photo_path text,
  road_level text not null check (road_level in ('tranquila', 'moderada', 'tecnica')),
  trip_type text not null check (trip_type in ('solo', 'casal', 'grupo')),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  distance_km numeric(8,2),
  duration_hours numeric(6,2),
  route_source text,
  route_polyline jsonb,
  tips text[] not null default '{}',
  moderation_status text not null default 'approved' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
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
  user_id uuid not null references users(id) on delete cascade,
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
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
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
  created_by_user_id uuid references users(id) on delete set null,
  assigned_admin_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_places_category_id on places(category_id);
create index if not exists idx_places_featured on places(is_featured);
create index if not exists idx_places_geo on places(latitude, longitude);
create index if not exists idx_reviews_place_id on reviews(place_id);
create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_trip_stops_trip_id on trip_stops(trip_id);
create index if not exists idx_comments_trip_id on comments(trip_id);
create index if not exists idx_comments_place_id on comments(place_id);
create index if not exists idx_favorites_user_id on favorites(user_id);
