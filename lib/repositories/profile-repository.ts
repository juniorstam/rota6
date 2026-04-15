import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRowToUserProfile } from "@/lib/supabase/mappers";
import { UserProfile } from "@/lib/types";

async function getPublicTripCountsByUserId(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select("user_id, visibility")
    .in("user_id", userIds)
    .eq("visibility", "public");

  if (error) {
    throw error;
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return counts;
}

function attachDerivedProfileCounts(profiles: UserProfile[], tripCounts: Map<string, number>) {
  return profiles.map((profile) => ({
    ...profile,
    publishedTripsCount: tripCounts.get(profile.id) ?? 0
  }));
}

export async function listProfilesFromDb(): Promise<UserProfile[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").order("name", { ascending: true });

  if (error) {
    throw error;
  }

  const profiles = (data ?? []).map(mapProfileRowToUserProfile);
  const tripCounts = await getPublicTripCountsByUserId(profiles.map((profile) => profile.id));

  return attachDerivedProfileCounts(profiles, tripCounts);
}

export async function getProfileByUsernameFromDb(username: string): Promise<UserProfile | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const profile = mapProfileRowToUserProfile(data);
  const tripCounts = await getPublicTripCountsByUserId([profile.id]);

  return attachDerivedProfileCounts([profile], tripCounts)[0] ?? null;
}

export async function isUsernameAvailable(username: string, excludeUserId?: string) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("profiles").select("id").eq("username", username);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw error;
  }

  return !data || data.length === 0;
}
