import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Route } from "lucide-react";

import { FollowButton } from "@/components/follow-button";
import { UserProfile } from "@/lib/types";

export function BikerCard({
  user,
  tripCount,
  photoCount
}: {
  user: UserProfile;
  tripCount: number;
  photoCount: number;
}) {
  const locationLabel = [user.city, user.state].filter(Boolean).join(", ") || "Localizacao em configuracao";

  return (
    <article className="rounded-[18px] border border-border bg-surface p-4 shadow-glow sm:p-5">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Link href={`/perfil/${user.username}`} className="flex min-w-0 flex-1 items-start gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] sm:h-20 sm:w-20 sm:rounded-[18px]">
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-text sm:text-xl">{user.name}</h3>
              <p className="text-sm text-muted">@{user.username}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{user.bio}</p>
            </div>
          </Link>
          <div className="shrink-0">
            <FollowButton targetUserId={user.id} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
            <MapPin size={14} />
            {locationLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
            <Route size={14} />
            {tripCount} viagens
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
            <Camera size={14} />
            {photoCount} fotos
          </span>
        </div>
      </div>
    </article>
  );
}
