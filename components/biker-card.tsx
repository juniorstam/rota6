import Image from "next/image";
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
  return (
    <article className="rounded-[24px] border border-border bg-surface p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <a href={`/perfil/${user.username}`} className="flex items-start gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-[24px]">
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text">{user.name}</h3>
              <p className="text-sm text-muted">@{user.username}</p>
              <p className="mt-2 text-sm text-muted">{user.bio}</p>
            </div>
          </a>
          <FollowButton targetUserId={user.id} />
        </div>

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
      </div>
    </article>
  );
}
