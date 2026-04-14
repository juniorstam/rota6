"use client";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return browserClient;
}
