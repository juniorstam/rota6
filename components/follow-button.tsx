"use client";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { useFollowing } from "@/providers/following-provider";
import { cn } from "@/lib/utils";

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { currentUserId, isFollowing, toggleFollowing } = useFollowing();
  const supabaseMode = hasSupabaseEnv();

  if (targetUserId === currentUserId) {
    return (
      <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">
        seu perfil
      </span>
    );
  }

  if (supabaseMode) {
    return (
      <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">
        seguir em breve
      </span>
    );
  }

  const active = isFollowing(targetUserId);

  return (
    <button
      type="button"
      onClick={() => toggleFollowing(targetUserId)}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active ? "border-accent bg-accent text-background" : "border-border text-text"
      )}
    >
      {active ? "Seguindo" : "Seguir"}
    </button>
  );
}
