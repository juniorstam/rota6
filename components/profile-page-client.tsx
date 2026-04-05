"use client";

import Link from "next/link";
import { Camera, Heart, Route, UserPlus } from "lucide-react";

import { FollowButton } from "@/components/follow-button";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlaceCard } from "@/components/place-card";
import { TripCard } from "@/components/trip-card";
import { BikerCard } from "@/components/biker-card";
import { UserProfileHeader } from "@/components/user-profile-header";
import { Place, PublishedTrip, UserProfile } from "@/lib/types";
import { useFollowing } from "@/providers/following-provider";
import { users } from "@/lib/mock-data";

export function ProfilePageClient({
  profile,
  profileTrips,
  profilePlaces,
  profilePhotos,
  relatedUsers
}: {
  profile: UserProfile;
  profileTrips: PublishedTrip[];
  profilePlaces: Place[];
  profilePhotos: string[];
  relatedUsers: Array<{
    user: UserProfile;
    tripCount: number;
    photoCount: number;
  }>;
}) {
  const { currentUserId, followingIds, followingMap } = useFollowing();
  const isOwnProfile = profile.id === currentUserId;
  const followers = users.filter((user) => (followingMap[user.id] ?? []).includes(profile.id));
  const following = users.filter((user) => (followingMap[profile.id] ?? []).includes(user.id));
  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile}>
        <FollowButton targetUserId={profile.id} />
      </UserProfileHeader>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <p className="text-xs text-muted">viagens no perfil</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Route size={18} />
            {profileTrips.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <p className="text-xs text-muted">fotos publicadas</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Camera size={18} />
            {profilePhotos.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <p className="text-xs text-muted">lugares recomendados</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <Heart size={18} />
            {profilePlaces.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <p className="text-xs text-muted">seguido por você</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-text">
            <UserPlus size={18} />
            {isOwnProfile ? "você" : followingIds.includes(profile.id) ? "sim" : "não"}
          </p>
        </div>
      </section>

      <section id="viagens" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagens publicadas</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Roteiros compartilhados por {profile.name}</h2>
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

      <section id="fotos" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Fotos</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Memórias de estrada do perfil</h2>
        </div>
        {profilePhotos.length > 0 ? (
          <PhotoGallery photos={profilePhotos.slice(0, 6)} />
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não publicou fotos de viagem.
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Recomendações</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Lugares marcantes no radar do perfil</h2>
        </div>
        {profilePlaces.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {profilePlaces.slice(0, 4).map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não recomendou lugares.
          </div>
        )}
      </section>

      <section id="seguidores" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Seguidores</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Quem acompanha este perfil</h2>
        </div>
        {followers.length > 0 ? (
          <div className="rounded-[24px] border border-border bg-surface">
            {followers.map((user) => (
              <a
                key={user.id}
                href={`/perfil/${user.username}`}
                className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0"
              >
                <span>
                  <span className="block font-medium text-text">{user.name}</span>
                  <span className="block text-sm text-muted">@{user.username}</span>
                </span>
                <span className="text-sm text-muted">
                  {user.city}, {user.state}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não tem seguidores visíveis.
          </div>
        )}
      </section>

      <section id="seguindo" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Seguindo</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Quem este perfil acompanha</h2>
        </div>
        {following.length > 0 ? (
          <div className="rounded-[24px] border border-border bg-surface">
            {following.map((user) => (
              <a
                key={user.id}
                href={`/perfil/${user.username}`}
                className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0"
              >
                <span>
                  <span className="block font-medium text-text">{user.name}</span>
                  <span className="block text-sm text-muted">@{user.username}</span>
                </span>
                <span className="text-sm text-muted">
                  {user.city}, {user.state}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não segue ninguém.
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Rede próxima</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">
              {isOwnProfile ? "Bikers que combinam com sua tocada" : `Outros bikers para ver a partir de ${profile.name}`}
            </h2>
          </div>
          <Link href="/bikers" className="text-sm text-muted">
            ver mais bikers
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {relatedUsers.map(({ user, tripCount, photoCount }) => (
            <BikerCard key={user.id} user={user} tripCount={tripCount} photoCount={photoCount} />
          ))}
        </div>
      </section>
    </div>
  );
}
