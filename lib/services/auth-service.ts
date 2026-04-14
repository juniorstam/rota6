import { users } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mapProfileRowToUserProfile } from "@/lib/supabase/mappers";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  clearSession,
  createBlankProfile,
  getStoredSession,
  normalizeUsername,
  readLocalUsers,
  saveSession,
  usernameExists,
  upsertLocalUser
} from "@/lib/local-profiles";
import { UserProfile } from "@/lib/types";

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export { getStoredSession };

async function getProfileFromSupabase(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfileRowToUserProfile(data) : null;
}

async function syncSessionProfile(profile: UserProfile) {
  if (!hasSupabaseEnv()) {
    upsertLocalUser(profile);
  }
  saveSession(profile);
  return profile;
}

function stripLargeInlineImage(value?: string) {
  if (!value) {
    return null;
  }

  if (value.startsWith("data:image/")) {
    return null;
  }

  return value;
}

export const authService = {
  async login({ email, password }: AuthPayload) {
    if (hasSupabaseEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password ?? ""
      });

      if (error) {
        throw new Error(error.message);
      }

      const userId = data.user?.id;
      if (!userId) {
        throw new Error("Nao foi possivel identificar o usuario autenticado.");
      }

      const profile = await getProfileFromSupabase(userId);
      if (!profile) {
        throw new Error("Perfil nao encontrado para esta conta.");
      }

      return syncSessionProfile(profile);
    }

    const localUsers = readLocalUsers();
    const existingUser = [...localUsers, ...users].find((user) => user.email === email) ?? users[0];
    saveSession(existingUser);
    return existingUser;
  },
  async signup({ email, password, name, username }: AuthPayload) {
    const nextUsername = normalizeUsername(username ?? name ?? "novo-usuario");
    if (usernameExists(nextUsername)) {
      throw new Error(`O @${nextUsername} já existe. Escolha outro username.`);
    }

    if (hasSupabaseEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", nextUsername)
        .maybeSingle();

      if (existingProfile) {
        throw new Error(`O @${nextUsername} já existe. Escolha outro username.`);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: password ?? "",
        options: {
          data: {
            name: name ?? "Novo motociclista",
            username: nextUsername
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const userId = data.user?.id;
      if (!userId) {
        throw new Error("Nao foi possivel criar a conta agora.");
      }

      const profile = await getProfileFromSupabase(userId);
      if (!profile) {
        const fallbackProfile = createBlankProfile({
          email,
          name: name ?? "Novo motociclista",
          username: nextUsername
        });

        fallbackProfile.id = userId;
        return syncSessionProfile(fallbackProfile);
      }

      return syncSessionProfile(profile);
    }

    const newUser: UserProfile = createBlankProfile({
      email,
      name: name ?? "Novo motociclista",
      username: nextUsername
    });

    upsertLocalUser(newUser);
    saveSession(newUser);
    return newUser;
  },
  async requestPasswordReset(email: string) {
    if (hasSupabaseEnv()) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw new Error(error.message);
      }

      return {
        ok: true,
        message: `Se existir uma conta para ${email}, o link de recuperação foi enviado.`
      };
    }

    return {
      ok: true,
      message: `Se existir uma conta para ${email}, o link de recuperação foi enviado.`
    };
  },
  async getCurrentSessionProfile() {
    if (!hasSupabaseEnv()) {
      return getStoredSession();
    }

    const supabase = getSupabaseBrowserClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      clearSession();
      return null;
    }

    const profile = await getProfileFromSupabase(session.user.id);
    if (!profile) {
      return null;
    }

    return syncSessionProfile(profile);
  },
  async updateProfile(profile: UserProfile) {
    if (!hasSupabaseEnv()) {
      upsertLocalUser(profile);
      saveSession(profile);
      return profile;
    }

    const supabase = getSupabaseBrowserClient();
    const sanitizedAvatarUrl = stripLargeInlineImage(profile.avatarUrl) ?? profile.avatarUrl;
    const sanitizedCoverUrl = stripLargeInlineImage(profile.coverUrl);
    const profileUpdates = {
      email: profile.email,
      username: profile.username,
      name: profile.name,
      avatar_url: sanitizedAvatarUrl,
      cover_url: sanitizedCoverUrl ?? null,
      city: profile.city,
      state: profile.state,
      region: profile.region ?? null,
      motorcycle_text: profile.motorcycle,
      motorcycle_brand: profile.motorcycleBrand ?? null,
      motorcycle_model: profile.motorcycleModel ?? null,
      bio: profile.bio,
      travel_style: profile.travelStyle,
      contact_email: profile.contactEmail ?? profile.email,
      phone: profile.phone ?? null,
      instagram_handle: profile.instagramHandle ?? null
    } as never;

    const updatePromise = supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", profile.id)
      .select("*")
      .single();

    const timeoutPromise = new Promise<never>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            "A gravacao do perfil demorou demais. Vamos salvar texto e dados principais primeiro; tente novamente em instantes."
          )
        );
      }, 12000);
    });

    const { data, error } = await Promise.race([updatePromise, timeoutPromise]);

    if (error) {
      throw new Error(error.message);
    }

    const nextProfile = mapProfileRowToUserProfile(data);
    nextProfile.avatarUrl = profile.avatarUrl;
    nextProfile.coverUrl = profile.coverUrl;

    return syncSessionProfile(nextProfile);
  },
  logout() {
    if (hasSupabaseEnv()) {
      void getSupabaseBrowserClient().auth.signOut();
    }
    clearSession();
  }
};
