import Image from "next/image";
import { Bike, MapPin, Route } from "lucide-react";

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
      <div className="relative h-44">
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

      <div className="relative px-5 pb-6">
        <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-[28px] border-4 border-surface">
              <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-semibold text-text">{profile.name}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            {children}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-xs text-muted">viagens</p>
                <p className="text-lg font-semibold text-text">{profile.publishedTripsCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-xs text-muted">recomendações</p>
                <p className="text-lg font-semibold text-text">{profile.publishedRecommendationsCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-3 md:block">
                <p className="text-xs text-muted">estilo</p>
                <p className="text-sm font-medium capitalize text-text">{profile.travelStyle}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{profile.bio}</p>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <MapPin size={16} />
            {profile.city}, {profile.state}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <Bike size={16} />
            {profile.motorcycle}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <Route size={16} />
            viagens {profile.travelStyle}
          </span>
        </div>
      </div>
    </section>
  );
}
