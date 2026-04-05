"use client";

import Link from "next/link";
import { Camera, Route, Users } from "lucide-react";

import { FollowButton } from "@/components/follow-button";
import { TripCard } from "@/components/trip-card";
import { UserProfileHeader } from "@/components/user-profile-header";
import { PublishedTrip, UserProfile } from "@/lib/types";
import { useFollowing } from "@/providers/following-provider";

export function ProfilePageClient({
  profile,
  profileTrips,
  profilePhotos,
}: {
  profile: UserProfile;
  profileTrips: PublishedTrip[];
  profilePhotos: string[];
}) {
  const { currentUserId, followingMap } = useFollowing();
  const isOwnProfile = profile.id === currentUserId;
  const followersCount = Object.values(followingMap).filter((ids) => ids.includes(profile.id)).length;
  const followingCount = (followingMap[profile.id] ?? []).length;

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile}>
        <FollowButton targetUserId={profile.id} />
      </UserProfileHeader>

      <section className="grid gap-4 md:grid-cols-4">
        <Link href={`/perfil/${profile.username}`} className="rounded-[24px] border border-border bg-surface p-4 transition hover:bg-surfaceAlt/70">
          <p className="text-xs text-muted">viagens no perfil</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Route size={18} />
            {profileTrips.length}
          </p>
        </Link>
        <Link href={`/perfil/${profile.username}/fotos`} className="rounded-[24px] border border-border bg-surface p-4 transition hover:bg-surfaceAlt/70">
          <p className="text-xs text-muted">fotos publicadas</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Camera size={18} />
            {profilePhotos.length}
          </p>
        </Link>
        <Link href={`/perfil/${profile.username}/seguidores`} className="rounded-[24px] border border-border bg-surface p-4 transition hover:bg-surfaceAlt/70">
          <p className="text-xs text-muted">seguidores</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Users size={18} />
            {followersCount}
          </p>
        </Link>
        <Link href={`/perfil/${profile.username}/seguindo`} className="rounded-[24px] border border-border bg-surface p-4 transition hover:bg-surfaceAlt/70">
          <p className="text-xs text-muted">seguindo</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Users size={18} />
            {followingCount}
          </p>
        </Link>
      </section>

      <section id="viagens" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagens publicadas</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">
            {isOwnProfile ? "Suas viagens publicadas" : `Roteiros compartilhados por ${profile.name}`}
          </h2>
        </div>
        {profileTrips.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {profileTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não publicou viagens.
          </div>
        )}
      </section>
    </div>
  );
}
