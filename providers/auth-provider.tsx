"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authService, getStoredSession, type AuthPayload } from "@/lib/services/auth-service";
import { cleanupKnownStorageEntries, clearLegacyLocalModeData } from "@/lib/storage-utils";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
    let mounted = true;
    cleanupKnownStorageEntries();

    async function bootstrap() {
      if (!hasSupabaseEnv()) {
        if (mounted) {
          setUser(getStoredSession());
          setLoading(false);
        }
        return;
      }

      try {
        clearLegacyLocalModeData();
        const profile = await authService.getCurrentSessionProfile();
        if (mounted) {
          setUser(profile);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    bootstrap();

    if (!hasSupabaseEnv()) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription }
    } = getSupabaseBrowserClient().auth.onAuthStateChange(async () => {
      const profile = await authService.getCurrentSessionProfile();
      if (mounted) {
        setUser(profile);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(payload) {
        setUser(null);
        const session = await authService.login(payload);
        setUser(session);
      },
      async signup(payload) {
        setUser(null);
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
        void authService.getCurrentSessionProfile().then((profile) => {
          setUser(profile);
        });
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
