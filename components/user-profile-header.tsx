import Image from "next/image";
import { Bike, MapPin } from "lucide-react";

import { UserProfile } from "@/lib/types";

export function UserProfileHeader({
  profile,
  children
}: {
  profile: UserProfile;
  children?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-border bg-surface">
      <div className="relative h-40 sm:h-44">
        <Image
          src={
            profile.coverUrl ??
            "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1400&q=80"
          }
          alt={profile.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/45 via-white/5 to-transparent" />
      </div>

      <div className="relative px-4 pb-5 sm:px-5 sm:pb-6">
        <div className="-mt-12 flex flex-col gap-4 md:-mt-14 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-[24px] border-4 border-surface sm:h-24 sm:w-24 sm:rounded-[28px]">
              <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
            </div>
            <div className="sm:pb-1">
              <h1 className="text-2xl font-semibold leading-tight text-text">{profile.name}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            {children}
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-xs text-muted">viagens</p>
                <p className="text-base font-semibold text-text sm:text-lg">{profile.publishedTripsCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-xs text-muted">recomendações</p>
                <p className="text-base font-semibold text-text sm:text-lg">{profile.publishedRecommendationsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{profile.bio}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <MapPin size={16} />
            {profile.city}, {profile.state}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <Bike size={16} />
            {profile.motorcycle}
          </span>
        </div>
      </div>
    </section>
  );
}
