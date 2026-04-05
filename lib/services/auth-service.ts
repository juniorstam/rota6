import { users } from "@/lib/mock-data";
import { UserProfile } from "@/lib/types";

const STORAGE_KEY = "rota6-session";

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export function getStoredSession(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function saveSession(user: UserProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export const authService = {
  async login({ email }: AuthPayload) {
    const existingUser = users.find((user) => user.email === email) ?? users[0];
    saveSession(existingUser);
    return existingUser;
  },
  async signup({ email, name }: AuthPayload) {
    const newUser: UserProfile = {
      ...users[0],
      id: "new-user",
      username: (name ?? "novo-usuario").toLowerCase().replace(/\s+/g, ""),
      email,
      name: name ?? "Novo motociclista",
      publishedTripsCount: 0,
      publishedRecommendationsCount: 0
    };
    saveSession(newUser);
    return newUser;
  },
  async requestPasswordReset(email: string) {
    return {
      ok: true,
      message: `Se existir uma conta para ${email}, o link de recuperação foi enviado.`
    };
  },
  logout() {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
