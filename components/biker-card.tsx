import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Route } from "lucide-react";

import { FollowButton } from "@/components/follow-button";
import { PublishedTrip, UserProfile } from "@/lib/types";

export function BikerCard({
  user,
  previewTrip,
  tripCount,
  photoCount
}: {
  user: UserProfile;
  previewTrip?: PublishedTrip;
  tripCount: number;
  photoCount: number;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-surface">
      <div className="relative h-44">
        <Image
          src={
            previewTrip?.coverUrl ??
            user.coverUrl ??
            "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80"
          }
          alt={user.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative -mt-10 space-y-4 p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-end gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-[20px] border-4 border-surface">
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text">{user.name}</h3>
              <p className="text-sm text-muted">@{user.username}</p>
            </div>
          </div>
          <FollowButton targetUserId={user.id} />
        </div>

        <p className="text-sm leading-6 text-muted">{user.bio}</p>

        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <MapPin size={14} />
            {user.city}, {user.state}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <Route size={14} />
            {tripCount} viagens
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <Camera size={14} />
            {photoCount} fotos
          </span>
        </div>

        {previewTrip ? (
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-accentSoft">Preview de viagem</p>
            <p className="mt-2 font-medium text-text">{previewTrip.title}</p>
            <p className="mt-1 text-sm text-muted">
              {previewTrip.origin} {"->"} {previewTrip.destination}
            </p>
          </div>
        ) : null}

        <Link
          href={`/perfil/${user.username}`}
          className="inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-3 text-sm text-text"
        >
          Abrir perfil
        </Link>
      </div>
    </article>
  );
}
