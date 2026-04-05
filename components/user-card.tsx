import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Route } from "lucide-react";

import { UserProfile } from "@/lib/types";

export function UserCard({
  user,
  tripCount,
  photoCount
}: {
  user: UserProfile;
  tripCount: number;
  photoCount: number;
}) {
  return (
    <article className="rounded-[28px] border border-border bg-surface p-5">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-[20px]">
          <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-text">{user.name}</h3>
              <p className="text-sm text-muted">@{user.username}</p>
            </div>
            <Link
              href={`/perfil/${user.username}`}
              className="rounded-full border border-border px-4 py-2 text-sm text-text"
            >
              Ver perfil
            </Link>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{user.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
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
      </div>
    </article>
  );
}
