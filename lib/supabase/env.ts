const requiredPublicEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function hasSupabaseEnv() {
  return requiredPublicEnvVars.every((key) => Boolean(process.env[key]));
}

export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL nao foi configurada.");
  }

  return value;
}

export function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY nao foi configurada.");
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao foi configurada.");
  }

  return value;
}
