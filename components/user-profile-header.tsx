import Image from "next/image";
import { Bike, Instagram, MapPin, Phone } from "lucide-react";

import { UserProfile } from "@/lib/types";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function UserProfileHeader({
  profile,
  children,
  tripCountOverride
}: {
  profile: UserProfile;
  children?: React.ReactNode;
  tripCountOverride?: number;
}) {
  const locationParts = [profile.city, profile.state].filter(Boolean);
  const locationLabel = locationParts.length > 0 ? locationParts.join(", ") : "Localizacao ainda nao informada";
  const regionLabel = profile.region?.trim();

  return (
    <section className="overflow-hidden rounded-[20px] border border-border bg-surface">
      <div className="relative h-28 sm:h-32 lg:h-36">
        <Image
          src={
            profile.coverUrl ??
            "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1400&q=80"
          }
          alt={profile.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="relative px-4 pb-4 pt-4 sm:px-5 md:px-6">
        <div className="-mt-10 flex flex-col gap-4 lg:-mt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative h-20 w-20 overflow-hidden rounded-[18px] border-2 border-surface shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:h-22 sm:w-22">
              <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 rounded-[18px] border border-border bg-surfaceAlt/88 px-4 py-3 sm:max-w-[34rem]">
              <h1 className="text-2xl font-semibold leading-tight text-text">{profile.name}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            {children}
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <div className="rounded-[16px] border border-border bg-surfaceAlt/88 px-3 py-2.5">
                <p className="text-xs text-muted">viagens</p>
                <p className="text-base font-semibold text-text">{tripCountOverride ?? profile.publishedTripsCount}</p>
              </div>
              <div className="rounded-[16px] border border-border bg-surfaceAlt/88 px-3 py-2.5">
                <p className="text-xs text-muted">recomendações</p>
                <p className="text-base font-semibold text-text">{profile.publishedRecommendationsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          {profile.bio || "Perfil em configuracao. Complete sua bio para contar sua historia na estrada."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <MapPin size={16} />
            {regionLabel ? `${locationLabel} • ${regionLabel}` : locationLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <Bike size={16} />
            {profile.motorcycle || "Moto ainda nao informada"}
          </span>
          {profile.phone ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
              <Phone size={16} />
              {formatPhone(profile.phone)}
            </span>
          ) : null}
          {profile.instagramHandle ? (
            <a
              href={`https://www.instagram.com/${profile.instagramHandle.replace(/^@+/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 transition hover:text-text"
            >
              <Instagram size={16} />
              {profile.instagramHandle.replace(/^@+/, "")}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
