"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { readFollowing, saveFollowing, type FollowingState } from "@/lib/following";
import { followingByUserId } from "@/lib/mock-data";
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

export function FollowingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const defaultState = hasSupabaseEnv() ? {} : followingByUserId;
  const [state, setState] = useState<FollowingState>(defaultState);

  useEffect(() => {
    setState(readFollowing(defaultState));
  }, [defaultState]);

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
        const nextFollowing = currentFollowing.includes(targetUserId)
          ? currentFollowing.filter((id) => id !== targetUserId)
          : [...currentFollowing, targetUserId];

        const nextState = {
          ...state,
          [currentUserId]: nextFollowing
        };

        setState(nextState);
        saveFollowing(nextState);
      }
    }),
    [currentUserId, defaultState, state]
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
