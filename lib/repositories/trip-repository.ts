import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapTripRowToPublishedTrip } from "@/lib/supabase/mappers";
import { PublishedTrip } from "@/lib/types";

export async function listPublicTripsFromDb() {
  const supabase = createSupabaseServerClient();
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
        distance_km,
        duration_hours,
        tips,
        tags,
        comments_count,
        profiles:user_id (
          id,
          username,
          name,
          avatar_url,
          motorcycle_text
        ),
        trip_stops (
          id,
          label,
          city,
          state,
          stop_type,
          notes
        ),
        trip_photos (
          storage_path,
          is_cover
        )
      `
    )
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTripRowToPublishedTrip);
}

export async function getTripByAuthorAndSlugFromDb(
  username: string,
  slug: string
): Promise<PublishedTrip | null> {
  const trips = await listPublicTripsFromDb();
  return trips.find((trip) => trip.author.username === username && trip.slug === slug) ?? null;
}
