"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PhotoGallery } from "@/components/photo-gallery";
import { ProfileConnectionsClient } from "@/components/profile-connections-client";
import { ProfilePageClient } from "@/components/profile-page-client";
import { ProfileSummaryTabs } from "@/components/profile-summary-tabs";
import { UserProfileHeader } from "@/components/user-profile-header";
import { LOCAL_PROFILES_EVENT, findProfileByUsername } from "@/lib/local-profiles";
import { getProfileByUsername, getProfilePhotos, getProfileTrips } from "@/lib/profile-data";
import { PUBLISHED_TRIPS_EVENT, readPublishedTrips } from "@/lib/published-trips";
import { PublishedTrip, UserProfile } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { useFollowing } from "@/providers/following-provider";

type ProfileSection = "overview" | "photos" | "followers" | "following";

export function ProfileRouteClient({
  username,
  section
}: {
  username: string;
  section: ProfileSection;
}) {
  const { user } = useAuth();
  const { followingMap } = useFollowing();
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfileByUsername(username));
  const [localTrips, setLocalTrips] = useState(() => readPublishedTrips());

  useEffect(() => {
    const sync = () => {
      const nextProfile = findProfileByUsername(username) ?? getProfileByUsername(username);
      setProfile(nextProfile);
      setLocalTrips(readPublishedTrips());
    };

    sync();

    window.addEventListener(LOCAL_PROFILES_EVENT, sync);
    window.addEventListener(PUBLISHED_TRIPS_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(LOCAL_PROFILES_EVENT, sync);
      window.removeEventListener(PUBLISHED_TRIPS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [user?.id, username]);

  const profileTrips = useMemo(() => (profile ? getProfileTrips(profile.id) : []), [profile]);
  const profilePhotos = useMemo(() => (profile ? getProfilePhotos(profile.id) : []), [profile]);
  const visibleLocalTrips = useMemo(() => {
    if (!profile) {
      return [] as PublishedTrip[];
    }

    const isOwnProfile = user?.id === profile.id;
    return localTrips
      .filter((trip) => trip.author.id === profile.id)
      .filter((trip) => (isOwnProfile ? true : trip.publicVisibility));
  }, [localTrips, profile, user?.id]);
  const mergedTripsCount = profileTrips.length + visibleLocalTrips.length;
  const mergedPhotos = useMemo(
    () => [...profilePhotos, ...visibleLocalTrips.flatMap((trip) => trip.photos)],
    [profilePhotos, visibleLocalTrips]
  );
  const followersCount = profile
    ? Object.values(followingMap).filter((ids) => ids.includes(profile.id)).length
    : 0;
  const followingCount = profile ? (followingMap[profile.id] ?? []).length : 0;

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl rounded-[32px] border border-border bg-surface p-8 text-center shadow-glow">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Perfil indisponível</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Esse perfil ainda não foi encontrado</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Se você acabou de criar a conta, entre novamente ou complete o cadastro do seu perfil para ativar a sua
          página pública.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-text"
          >
            Criar conta
          </Link>
        </div>
      </section>
    );
  }

  if (section === "overview") {
    return <ProfilePageClient profile={profile} profileTrips={profileTrips} profilePhotos={profilePhotos} />;
  }

  if (section === "photos") {
    return (
      <div className="space-y-8">
        <UserProfileHeader profile={profile} />
        <ProfileSummaryTabs
          username={profile.username}
          activeTab="photos"
          tripCount={mergedTripsCount}
          photoCount={mergedPhotos.length}
          followersCount={followersCount}
          followingCount={followingCount}
        />

        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Fotos</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">Registros de estrada de {profile.name}</h1>
          </div>

          {mergedPhotos.length > 0 ? (
            <PhotoGallery photos={mergedPhotos} />
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
              Este perfil ainda não publicou fotos.
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile} />
      <ProfileSummaryTabs
        username={profile.username}
        activeTab={section === "followers" ? "followers" : "following"}
        tripCount={mergedTripsCount}
        photoCount={mergedPhotos.length}
        followersCount={followersCount}
        followingCount={followingCount}
      />
      <ProfileConnectionsClient profile={profile} mode={section === "followers" ? "followers" : "following"} />
    </div>
  );
}
