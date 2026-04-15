"use client";

import { useState } from "react";

import { AuthGateModal } from "@/components/auth-gate-modal";
import { useFollowing } from "@/providers/following-provider";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { currentUserId, isFollowing, toggleFollowing } = useFollowing();
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (targetUserId === currentUserId) {
    return (
      <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">
        seu perfil
      </span>
    );
  }

  if (!loading && !user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
        >
          Seguir
        </button>
        <AuthGateModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
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
