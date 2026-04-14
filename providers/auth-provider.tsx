"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authService, getStoredSession, type AuthPayload } from "@/lib/services/auth-service";
import { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  signup: (payload: AuthPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredSession());
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(payload) {
        const session = await authService.login(payload);
        setUser(session);
      },
      async signup(payload) {
        const session = await authService.signup(payload);
        setUser(session);
      },
      async requestPasswordReset(email) {
        const result = await authService.requestPasswordReset(email);
        return result.message;
      },
      logout() {
        authService.logout();
        setUser(null);
      },
      updateUser(nextUser) {
        setUser(nextUser);
      },
      refreshUser() {
        setUser(getStoredSession());
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
