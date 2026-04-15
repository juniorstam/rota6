"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { readFollowing, saveFollowing, type FollowingState } from "@/lib/following";
import { followingByUserId } from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { useAuth } from "@/providers/auth-provider";

interface FollowingContextValue {
  currentUserId: string | null;
  followingIds: string[];
  followingMap: FollowingState;
  isFollowing: (targetUserId: string) => boolean;
  toggleFollowing: (targetUserId: string) => void;
}

const FollowingContext = createContext<FollowingContextValue | undefined>(undefined);

export function FollowingProvider({
  children,
  initialState = {}
}: {
  children: React.ReactNode;
  initialState?: FollowingState;
}) {
  const { user } = useAuth();
  const supabaseMode = hasSupabaseEnv();
  const currentUserId = user?.id ?? null;
  const defaultState = supabaseMode ? {} : followingByUserId;
  const [state, setState] = useState<FollowingState>(supabaseMode ? initialState : defaultState);

  useEffect(() => {
    if (supabaseMode) {
      setState(initialState);
      return;
    }

    setState(readFollowing(defaultState));
  }, [defaultState, initialState, supabaseMode]);

  const value = useMemo<FollowingContextValue>(
    () => ({
      currentUserId,
      followingIds: currentUserId ? state[currentUserId] ?? defaultState[currentUserId] ?? [] : [],
      followingMap: state,
      isFollowing(targetUserId) {
        if (!currentUserId) {
          return false;
        }

        return (state[currentUserId] ?? defaultState[currentUserId] ?? []).includes(targetUserId);
      },
      toggleFollowing(targetUserId) {
        if (!currentUserId || targetUserId === currentUserId) {
          return;
        }

        const currentFollowing = state[currentUserId] ?? defaultState[currentUserId] ?? [];
        const shouldFollow = !currentFollowing.includes(targetUserId);
        const nextFollowing = shouldFollow ? [...currentFollowing, targetUserId] : currentFollowing.filter((id) => id !== targetUserId);

        const nextState = {
          ...state,
          [currentUserId]: nextFollowing
        };

        setState(nextState);

        if (!supabaseMode) {
          saveFollowing(nextState);
          return;
        }

        void (async () => {
          try {
            const supabase = getSupabaseBrowserClient();
            let {
              data: { session }
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
              const { data } = await supabase.auth.refreshSession();
              session = data.session;
            }

            if (!session?.access_token) {
              throw new Error("Sua sessao expirou. Entre novamente.");
            }

            const response = await fetch("/api/follows", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                targetUserId,
                shouldFollow
              })
            });

            const result = (await response.json().catch(() => null)) as { followingMap?: FollowingState; error?: string } | null;

            if (!response.ok || !result?.followingMap) {
              throw new Error(result?.error ?? "Nao foi possivel atualizar o follow.");
            }

            setState(result.followingMap);
          } catch {
            setState(state);
          }
        })();
      }
    }),
    [currentUserId, defaultState, state, supabaseMode]
  );

  return <FollowingContext.Provider value={value}>{children}</FollowingContext.Provider>;
}

export function useFollowing() {
  const context = useContext(FollowingContext);
  if (!context) {
    throw new Error("useFollowing must be used inside FollowingProvider");
  }
  return context;
}
