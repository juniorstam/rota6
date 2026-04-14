import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRowToUserProfile } from "@/lib/supabase/mappers";
import { UserProfile } from "@/lib/types";

export async function listProfilesFromDb(): Promise<UserProfile[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProfileRowToUserProfile);
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

  return data ? mapProfileRowToUserProfile(data) : null;
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
