import { users } from "@/lib/mock-data";
import { isAdminEmail } from "@/lib/admin";
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

async function ensureSupabaseProfile(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const existingProfile = await getProfileFromSupabase(authUser.id);
  if (existingProfile) {
    return existingProfile;
  }

  const email = authUser.email ?? "";
  const metadata = authUser.user_metadata ?? {};
  const baseUsername = normalizeUsername(
    String(metadata.username ?? email.split("@")[0] ?? "motociclista")
  );
  const fallbackUsername = baseUsername || `biker${authUser.id.slice(0, 6)}`;
  const name = String(metadata.name ?? email.split("@")[0] ?? "Novo motociclista");

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: authUser.id,
        email,
        username: fallbackUsername,
        name,
        contact_email: email,
        travel_style: "solo"
      } as never,
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileRowToUserProfile(data);
}

async function syncSessionProfile(profile: UserProfile) {
  const nextProfile = {
    ...profile,
    isAdmin: isAdminEmail(profile.email)
  };
  if (!hasSupabaseEnv()) {
    upsertLocalUser(nextProfile);
  }
  saveSession(nextProfile);
  return nextProfile;
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
    clearSession();

    if (hasSupabaseEnv()) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
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

      const profile = await ensureSupabaseProfile(data.user);

      return syncSessionProfile(profile);
    }

    const localUsers = readLocalUsers();
    const existingUser = [...localUsers, ...users].find((user) => user.email === email);

    if (!existingUser) {
      throw new Error("Credenciais inválidas. Verifique o e-mail e a senha.");
    }

    if (!password || password !== "123456") {
      throw new Error("Credenciais inválidas. Verifique o e-mail e a senha.");
    }

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

      await ensureSupabaseProfile({
        id: userId,
        email,
        user_metadata: {
          ...(data.user?.user_metadata ?? {}),
          name: name ?? "Novo motociclista",
          username: nextUsername
        }
      });

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: password ?? ""
        });

        if (signInError) {
          throw new Error(
            "Conta criada, mas a sessao nao foi iniciada automaticamente. Confirme o e-mail se necessario e entre pela tela de login."
          );
        }
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
    let {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      const { data } = await supabase.auth.refreshSession();
      session = data.session;
    }

    if (!session?.user?.id) {
      clearSession();
      return null;
    }

    const profile = await getProfileFromSupabase(session.user.id);
    if (!profile) {
      return syncSessionProfile(await ensureSupabaseProfile(session.user));
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
    let {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      const { data } = await supabase.auth.refreshSession();
      session = data.session;
    }

    const user = session?.user;

    if (!user?.id) {
      clearSession();
      throw new Error("Sua sessao expirou. Entre novamente para salvar o perfil.");
    }

    const sanitizedAvatarUrl = stripLargeInlineImage(profile.avatarUrl) ?? profile.avatarUrl;
    const sanitizedCoverUrl = stripLargeInlineImage(profile.coverUrl);
    const profileUpdates = {
      email: user.email ?? profile.email,
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
    };

    const updatePromise = supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          ...profileUpdates
        } as never,
        { onConflict: "id" }
      )
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

    return syncSessionProfile(nextProfile);
  },
  logout() {
    if (hasSupabaseEnv()) {
      void getSupabaseBrowserClient().auth.signOut();
    }
    clearSession();
  }
};
