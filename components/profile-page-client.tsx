"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FollowButton } from "@/components/follow-button";
import { ProfileSummaryTabs } from "@/components/profile-summary-tabs";
import { TripCard } from "@/components/trip-card";
import { UserProfileHeader } from "@/components/user-profile-header";
import { PUBLISHED_TRIPS_EVENT, readPublishedTrips } from "@/lib/published-trips";
import { PublishedTrip, UserProfile } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { useFollowing } from "@/providers/following-provider";

export function ProfilePageClient({
  profile,
  profileTrips,
  profilePhotos,
  useSupabase
}: {
  profile: UserProfile;
  profileTrips: PublishedTrip[];
  profilePhotos: string[];
  useSupabase: boolean;
}) {
  const { user } = useAuth();
  const { currentUserId, followingMap } = useFollowing();
  const [localTrips, setLocalTrips] = useState<PublishedTrip[]>(() => (useSupabase ? [] : []));
  const isOwnProfile = profile.id === currentUserId;
  const followersCount = Object.values(followingMap).filter((ids) => ids.includes(profile.id)).length;
  const followingCount = (followingMap[profile.id] ?? []).length;

  useEffect(() => {
    if (useSupabase) {
      setLocalTrips([]);
      return;
    }

    const sync = () => setLocalTrips(readPublishedTrips());
    sync();

    window.addEventListener(PUBLISHED_TRIPS_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(PUBLISHED_TRIPS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [useSupabase]);

  const mergedTrips = useMemo(
    () => {
      const ownLocalTrips = useSupabase ? [] : localTrips.filter((trip) => trip.author.id === profile.id);
      const visibleLocalTrips = isOwnProfile
        ? ownLocalTrips
        : ownLocalTrips.filter((trip) => trip.publicVisibility);

      return [...visibleLocalTrips, ...profileTrips];
    },
    [isOwnProfile, localTrips, profile.id, profileTrips, useSupabase]
  );
  const mergedPhotosCount = useMemo(
    () => {
      const ownLocalTrips = useSupabase ? [] : localTrips.filter((trip) => trip.author.id === profile.id);
      const visibleLocalTrips = isOwnProfile
        ? ownLocalTrips
        : ownLocalTrips.filter((trip) => trip.publicVisibility);

      return profilePhotos.length + visibleLocalTrips.reduce((count, trip) => count + trip.photos.length, 0);
    },
    [isOwnProfile, localTrips, profile.id, profilePhotos.length, useSupabase]
  );

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile} tripCountOverride={mergedTrips.length}>
        {isOwnProfile || user?.id === profile.id ? (
          <Link
            href="/perfil/editar"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-background/70"
          >
            Editar perfil
          </Link>
        ) : (
          <FollowButton targetUserId={profile.id} />
        )}
      </UserProfileHeader>

      <ProfileSummaryTabs
        username={profile.username}
        activeTab="overview"
        tripCount={mergedTrips.length}
        photoCount={mergedPhotosCount}
        followersCount={followersCount}
        followingCount={followingCount}
      />

      <section id="viagens" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagens publicadas</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">
            {isOwnProfile ? "Suas viagens publicadas" : `Roteiros compartilhados por ${profile.name}`}
          </h2>
        </div>
        {mergedTrips.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {mergedTrips.map((trip) => (
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
