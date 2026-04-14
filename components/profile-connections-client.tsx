"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getMergedProfiles, LOCAL_PROFILES_EVENT } from "@/lib/local-profiles";
import { UserProfile } from "@/lib/types";
import { useFollowing } from "@/providers/following-provider";

export function ProfileConnectionsClient({
  profile,
  mode
}: {
  profile: UserProfile;
  mode: "followers" | "following";
}) {
  const { followingMap } = useFollowing();
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getMergedProfiles());

  useEffect(() => {
    const sync = () => setProfiles(getMergedProfiles());
    window.addEventListener(LOCAL_PROFILES_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(LOCAL_PROFILES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const list =
    mode === "followers"
      ? profiles.filter((user) => (followingMap[user.id] ?? []).includes(profile.id))
      : profiles.filter((user) => (followingMap[profile.id] ?? []).includes(user.id));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">
          {mode === "followers" ? "Seguidores" : "Seguindo"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-text">
          {mode === "followers" ? `Quem acompanha ${profile.name}` : `Quem ${profile.name} acompanha`}
        </h1>
      </div>

      {list.length > 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-glow">
          {list.map((user) => (
            <Link
              key={user.id}
              href={`/perfil/${user.username}`}
              className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 transition hover:bg-surfaceAlt/70 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-medium text-text">{user.name}</p>
                  <p className="text-sm text-muted">@{user.username}</p>
                </div>
              </div>

              <p className="text-sm text-muted">
                {user.city}, {user.state}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
          Nenhum perfil encontrado nesta lista.
        </div>
      )}
    </div>
  );
}
