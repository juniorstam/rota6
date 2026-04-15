import { createClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function getApiUserIdFromAuthHeader(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Sessão ausente.");
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Error("Sessão ausente.");
  }

  const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.id) {
    throw new Error("Sessão inválida.");
  }

  return data.user.id;
}
