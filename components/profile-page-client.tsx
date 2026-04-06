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

      <section className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Link href={`/perfil/${profile.username}`} className="rounded-[20px] border border-border bg-surface p-3 transition hover:bg-surfaceAlt/70 sm:rounded-[24px] sm:p-4">
          <p className="text-[11px] text-muted sm:text-xs">viagens</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold text-text sm:mt-2 sm:gap-2 sm:text-2xl">
            <Route size={14} className="sm:h-[18px] sm:w-[18px]" />
            {profileTrips.length}
          </p>
        </Link>
        <Link href={`/perfil/${profile.username}/fotos`} className="rounded-[20px] border border-border bg-surface p-3 transition hover:bg-surfaceAlt/70 sm:rounded-[24px] sm:p-4">
          <p className="text-[11px] text-muted sm:text-xs">fotos</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold text-text sm:mt-2 sm:gap-2 sm:text-2xl">
            <Camera size={14} className="sm:h-[18px] sm:w-[18px]" />
            {profilePhotos.length}
          </p>
        </Link>
        <Link href={`/perfil/${profile.username}/seguidores`} className="rounded-[20px] border border-border bg-surface p-3 transition hover:bg-surfaceAlt/70 sm:rounded-[24px] sm:p-4">
          <p className="text-[11px] text-muted sm:text-xs">seguidores</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold text-text sm:mt-2 sm:gap-2 sm:text-2xl">
            <Users size={14} className="sm:h-[18px] sm:w-[18px]" />
            {followersCount}
          </p>
        </Link>
        <Link href={`/perfil/${profile.username}/seguindo`} className="rounded-[20px] border border-border bg-surface p-3 transition hover:bg-surfaceAlt/70 sm:rounded-[24px] sm:p-4">
          <p className="text-[11px] text-muted sm:text-xs">seguindo</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold text-text sm:mt-2 sm:gap-2 sm:text-2xl">
            <Users size={14} className="sm:h-[18px] sm:w-[18px]" />
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
