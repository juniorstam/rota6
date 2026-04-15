import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRowToUserProfile } from "@/lib/supabase/mappers";
import { UserProfile } from "@/lib/types";

function normalizeUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function ensureProfilesForAuthUsers() {
  const supabase = createSupabaseAdminClient();
  const [{ data: profileRows, error: profilesError }, { data: authRows, error: authError }] = await Promise.all([
    supabase.from("profiles").select("id, username, email"),
    supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  ]);

  if (profilesError) {
    throw profilesError;
  }

  if (authError) {
    throw authError;
  }

  const existingIds = new Set((profileRows ?? []).map((row) => row.id));
  const existingUsernames = new Set((profileRows ?? []).map((row) => row.username));
  const missingProfiles =
    authRows.users?.filter((authUser) => authUser.email && !existingIds.has(authUser.id)) ?? [];

  if (missingProfiles.length === 0) {
    return;
  }

  const rowsToInsert = missingProfiles.map((authUser) => {
    const email = authUser.email ?? "";
    const metadata = authUser.user_metadata ?? {};
    const preferredUsername = normalizeUsername(String(metadata.username ?? email.split("@")[0] ?? "motociclista"));
    let username = preferredUsername || `biker${authUser.id.slice(0, 6)}`;

    while (existingUsernames.has(username)) {
      username = `${preferredUsername || "biker"}${authUser.id.slice(0, 4)}`;
    }

    existingUsernames.add(username);

    return {
      id: authUser.id,
      email,
      username,
      name: String(metadata.name ?? email.split("@")[0] ?? "Novo motociclista"),
      contact_email: email,
      travel_style: "solo"
    };
  });

  const { error } = await supabase.from("profiles").upsert(rowsToInsert as never[], { onConflict: "id" });

  if (error) {
    throw error;
  }
}

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
  await ensureProfilesForAuthUsers();
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
  await ensureProfilesForAuthUsers();
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
