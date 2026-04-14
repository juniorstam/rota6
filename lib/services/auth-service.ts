import { users } from "@/lib/mock-data";
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

export const authService = {
  async login({ email }: AuthPayload) {
    const localUsers = readLocalUsers();
    const existingUser = [...localUsers, ...users].find((user) => user.email === email) ?? users[0];
    saveSession(existingUser);
    return existingUser;
  },
  async signup({ email, name, username }: AuthPayload) {
    const nextUsername = normalizeUsername(username ?? name ?? "novo-usuario");
    if (usernameExists(nextUsername)) {
      throw new Error(`O @${nextUsername} já existe. Escolha outro username.`);
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
    return {
      ok: true,
      message: `Se existir uma conta para ${email}, o link de recuperação foi enviado.`
    };
  },
  logout() {
    clearSession();
  }
};
