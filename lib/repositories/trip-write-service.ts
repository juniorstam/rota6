import { createSupabaseAdminClient } from "@/lib/supabase/server";

type DraftStopType = "parada" | "combustivel" | "paisagem" | "hospedagem";
type TripVisibility = "public" | "private" | "unlisted";
type TripRoadLevel = "tranquila" | "moderada" | "tecnica";
type TripType = "solo" | "casal" | "grupo";

export interface TripPhotoInput {
  name: string;
  url?: string | null;
  dataUrl?: string | null;
}

export interface UpsertTripInput {
  tripId?: string | null;
  userId: string;
  username: string;
  title: string;
  summary: string;
  origin: string;
  destination: string;
  tripType: TripType;
  roadLevel: TripRoadLevel;
  visibility: TripVisibility;
  tags: string[];
  tips: string[];
  stops: Array<{
    label: string;
    type: DraftStopType;
    notes: string;
  }>;
  coverPhoto?: TripPhotoInput | null;
  galleryPhotos: TripPhotoInput[];
}

const MEDIA_BUCKET = "profile-media";
const DEFAULT_TRIP_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="rota6TripBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff3e8" />
          <stop offset="52%" stop-color="#ffe1c4" />
          <stop offset="100%" stop-color="#ffd2a6" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#rota6TripBg)" rx="48" />
      <circle cx="1320" cy="180" r="130" fill="#ff7a1a" opacity="0.16" />
      <circle cx="260" cy="720" r="180" fill="#f8d6b6" opacity="0.55" />
      <text x="120" y="420" fill="#1b2740" font-size="88" font-family="Arial, sans-serif" font-weight="700">Rota 6</text>
      <text x="120" y="510" fill="#5d7091" font-size="42" font-family="Arial, sans-serif">Viagem publicada sem foto de capa</text>
    </svg>
  `);

function slugifyTripTitle(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "viagem";
}

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de imagem inválido para upload.");
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

async function buildUniqueTripSlug({
  userId,
  title,
  tripId
}: {
  userId: string;
  title: string;
  tripId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const baseSlug = slugifyTripTitle(title);
  let attempt = 0;

  while (attempt < 50) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("trips")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data?.length || data[0].id === tripId) {
      return candidate;
    }

    attempt += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

async function ensureProfileRow({
  userId,
  username
}: {
  userId: string;
  username: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    return;
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    email: `${username}@rota6.dev`,
    username,
    name: username,
    contact_email: `${username}@rota6.dev`,
    travel_style: "solo"
  } as never);

  if (insertError) {
    throw insertError;
  }
}

async function uploadTripPhoto({
  userId,
  tripId,
  kind,
  index,
  photo
}: {
  userId: string;
  tripId: string;
  kind: "cover" | "gallery";
  index: number;
  photo: TripPhotoInput;
}) {
  if (photo.url && !photo.url.startsWith("data:")) {
    return photo.url;
  }

  if (!photo.dataUrl && !photo.url) {
    return null;
  }

  const source = photo.dataUrl ?? photo.url;
  if (!source) {
    return null;
  }

  const { buffer, contentType } = decodeDataUrl(source);
  const extension = contentType.includes("png") ? "png" : "jpg";
  const filePath = `trips/${userId}/${tripId}/${kind}-${index + 1}-${Date.now()}.${extension}`;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, buffer, {
    upsert: true,
    contentType
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export async function getOwnedTripForEditing({
  tripId,
  userId
}: {
  tripId: string;
  userId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      `
        id,
        slug,
        title,
        origin_label,
        destination_label,
        summary,
        road_level,
        trip_type,
        visibility,
        tags,
        tips,
        trip_stops (
          id,
          label,
          stop_type,
          notes,
          stop_order
        ),
        trip_photos (
          storage_path,
          is_cover,
          sort_order
        )
      `
    )
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const orderedStops = [...(data.trip_stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
  const orderedPhotos = [...(data.trip_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const coverPhoto = orderedPhotos.find((photo) => photo.is_cover)?.storage_path ?? null;
  const galleryPhotos = orderedPhotos.filter((photo) => !photo.is_cover).map((photo) => photo.storage_path);

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? "",
    origin: data.origin_label,
    destination: data.destination_label,
    tripType: data.trip_type as TripType,
    roadLevel: data.road_level as TripRoadLevel,
    visibility: data.visibility as TripVisibility,
    tags: data.tags ?? [],
    tips: data.tips ?? [],
    stops: orderedStops.map((stop) => ({
      id: stop.id,
      label: stop.label,
      type: (stop.stop_type ?? "parada") as DraftStopType,
      notes: stop.notes ?? ""
    })),
    coverPhotoUrl: coverPhoto,
    galleryPhotoUrls: galleryPhotos
  };
}

export async function upsertTrip(input: UpsertTripInput) {
  const supabase = createSupabaseAdminClient();
  await ensureProfileRow({ userId: input.userId, username: input.username });

  if (input.tripId) {
    const { data: ownedTrip, error: ownedTripError } = await supabase
      .from("trips")
      .select("id")
      .eq("id", input.tripId)
      .eq("user_id", input.userId)
      .maybeSingle();

    if (ownedTripError) {
      throw ownedTripError;
    }

    if (!ownedTrip?.id) {
      throw new Error("Voce nao tem permissao para editar esta viagem.");
    }
  }

  const tripId = input.tripId ?? crypto.randomUUID();
  const slug = await buildUniqueTripSlug({
    userId: input.userId,
    title: input.title,
    tripId: input.tripId
  });

  const tripPayload = {
    id: tripId,
    user_id: input.userId,
    slug,
    title: input.title,
    origin_label: input.origin,
    destination_label: input.destination,
    summary: input.summary,
    road_level: input.roadLevel,
    trip_type: input.tripType,
    visibility: input.visibility,
    tags: input.tags,
    tips: input.tips
  };

  const { error: tripError } = await supabase
    .from("trips")
    .upsert(tripPayload as never, { onConflict: "id" });

  if (tripError) {
    throw tripError;
  }

  const coverPhotoUrl =
    (await uploadTripPhoto({
      userId: input.userId,
      tripId,
      kind: "cover",
      index: 0,
      photo: input.coverPhoto ?? { name: "cover", url: null, dataUrl: null }
    })) ??
    input.galleryPhotos[0]?.url ??
    DEFAULT_TRIP_COVER;

  const galleryPhotoUrls = (
    await Promise.all(
      input.galleryPhotos.map((photo, index) =>
        uploadTripPhoto({
          userId: input.userId,
          tripId,
          kind: "gallery",
          index,
          photo
        })
      )
    )
  ).filter((entry): entry is string => Boolean(entry));

  const tripPhotos = [
    { storage_path: coverPhotoUrl, is_cover: true, sort_order: 0 },
    ...galleryPhotoUrls.map((storage_path, index) => ({
      storage_path,
      is_cover: false,
      sort_order: index + 1
    }))
  ];

  const tripStops = input.stops
    .filter((stop) => stop.label.trim())
    .map((stop, index) => ({
      trip_id: tripId,
      stop_order: index,
      label: stop.label.trim(),
      stop_type: stop.type,
      notes: stop.notes.trim() || null
    }));

  const { error: deleteStopsError } = await supabase.from("trip_stops").delete().eq("trip_id", tripId);
  if (deleteStopsError) {
    throw deleteStopsError;
  }

  const { error: deletePhotosError } = await supabase.from("trip_photos").delete().eq("trip_id", tripId);
  if (deletePhotosError) {
    throw deletePhotosError;
  }

  if (tripStops.length > 0) {
    const { error: insertStopsError } = await supabase.from("trip_stops").insert(tripStops as never);
    if (insertStopsError) {
      throw insertStopsError;
    }
  }

  const { error: insertPhotosError } = await supabase
    .from("trip_photos")
    .insert(tripPhotos.map((photo) => ({ ...photo, trip_id: tripId })) as never);

  if (insertPhotosError) {
    throw insertPhotosError;
  }

  return {
    id: tripId,
    slug
  };
}

export async function updateTripVisibility({
  tripId,
  userId,
  visibility
}: {
  tripId: string;
  userId: string;
  visibility: TripVisibility;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("trips")
    .update({ visibility } as never)
    .eq("id", tripId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function deleteOwnedTrip({
  tripId,
  userId
}: {
  tripId: string;
  userId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", userId);

  if (error) {
    throw error;
  }
}
