import { PublishedTrip, UserProfile } from "@/lib/types";
import { isAdminEmail } from "@/lib/admin";

interface ProfileRow {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url: string | null;
  cover_url: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  motorcycle_text: string | null;
  motorcycle_brand: string | null;
  motorcycle_model: string | null;
  bio: string | null;
  travel_style: UserProfile["travelStyle"] | null;
  contact_email: string | null;
  phone: string | null;
  instagram_handle: string | null;
  published_trips_count: number | null;
  published_recommendations_count: number | null;
}

interface TripStopRow {
  id: string;
  label: string;
  city: string | null;
  state: string | null;
  stop_type: "parada" | "combustivel" | "paisagem" | "hospedagem" | null;
  notes: string | null;
}

interface TripPhotoRow {
  storage_path: string;
  is_cover: boolean | null;
}

interface TripRow {
  id: string;
  slug: string;
  title: string;
  origin_label: string;
  destination_label: string;
  summary: string | null;
  road_level: PublishedTrip["roadLevel"];
  trip_type: PublishedTrip["tripType"];
  visibility: "public" | "private" | "unlisted";
  distance_km: number | null;
  duration_hours: number | null;
  tips: string[] | null;
  tags: string[] | null;
  comments_count: number | null;
  profiles:
    | Array<{
        id: string;
        username: string;
        name: string;
        avatar_url: string | null;
        motorcycle_text: string | null;
      }>
    | {
        id: string;
        username: string;
        name: string;
        avatar_url: string | null;
        motorcycle_text: string | null;
      }
    | null;
  trip_stops?: TripStopRow[] | null;
  trip_photos?: TripPhotoRow[] | null;
}

const DEFAULT_AVATAR_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="120" fill="#ff7a1a" />
      <text x="120" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="88" font-weight="700" fill="#ffffff">R6</text>
    </svg>
  `);

const DEFAULT_TRIP_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" rx="48" fill="#fff3e8" />
      <circle cx="1320" cy="180" r="130" fill="#ff7a1a" opacity="0.16" />
      <circle cx="280" cy="700" r="180" fill="#f8d6b6" opacity="0.55" />
      <text x="120" y="420" fill="#1b2740" font-size="88" font-family="Arial, sans-serif" font-weight="700">Rota 6</text>
      <text x="120" y="510" fill="#5d7091" font-size="42" font-family="Arial, sans-serif">Viagem publicada</text>
    </svg>
  `);

export function mapProfileRowToUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    isAdmin: isAdminEmail(row.email),
    username: row.username,
    name: row.name,
    avatarUrl: row.avatar_url || DEFAULT_AVATAR_URL,
    coverUrl: row.cover_url || undefined,
    city: row.city || "",
    state: row.state || "",
    region: row.region || "",
    motorcycle: row.motorcycle_text || "",
    motorcycleBrand: row.motorcycle_brand || "",
    motorcycleModel: row.motorcycle_model || "",
    bio: row.bio || "",
    travelStyle: row.travel_style || "solo",
    contactEmail: row.contact_email || row.email,
    phone: row.phone || "",
    instagramHandle: row.instagram_handle || "",
    publishedTripsCount: row.published_trips_count ?? 0,
    publishedRecommendationsCount: row.published_recommendations_count ?? 0
  };
}

export function mapTripRowToPublishedTrip(row: TripRow): PublishedTrip {
  const authorProfile = Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles;
  const photos = (row.trip_photos ?? []).map((photo) => photo.storage_path);
  const coverPhoto = row.trip_photos?.find((photo) => photo.is_cover)?.storage_path ?? photos[0] ?? DEFAULT_TRIP_COVER;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    origin: row.origin_label,
    destination: row.destination_label,
    summary: row.summary || "",
    coverUrl: coverPhoto,
    photos,
    tags: row.tags ?? [],
    routeStops: (row.trip_stops ?? []).map((stop) => ({
      id: stop.id,
      name: stop.label,
      city: stop.city || "",
      state: stop.state || "",
      type: stop.stop_type || "parada",
      notes: stop.notes || undefined
    })),
    tips: row.tips ?? [],
    roadLevel: row.road_level,
    tripType: row.trip_type,
    publicVisibility: row.visibility === "public",
    author: {
      id: authorProfile?.id ?? "",
      username: authorProfile?.username ?? "",
      name: authorProfile?.name ?? "Autor desconhecido",
      avatarUrl: authorProfile?.avatar_url || DEFAULT_AVATAR_URL,
      motorcycle: authorProfile?.motorcycle_text || ""
    },
    distanceKm: row.distance_km ?? 0,
    durationHours: row.duration_hours ?? 0,
    commentsCount: row.comments_count ?? 0
  };
}
