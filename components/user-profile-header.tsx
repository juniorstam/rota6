import Image from "next/image";
import { Bike, Instagram, Mail, MapPin, Phone } from "lucide-react";

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
    <section className="overflow-hidden rounded-[32px] border border-border bg-surface">
      <div className="relative h-44 sm:h-48 lg:h-60">
        <Image
          src={
            profile.coverUrl ??
            "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1400&q=80"
          }
          alt={profile.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 via-25% to-transparent" />
      </div>

      <div className="relative px-4 pb-5 pt-4 sm:px-5 sm:pb-6 md:px-7 md:pt-5 lg:px-8 lg:pb-7">
        <div className="-mt-16 flex flex-col gap-4 md:-mt-10 md:flex-row md:items-end md:justify-between lg:-mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-[24px] border-4 border-surface shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:h-24 sm:w-24 sm:rounded-[28px]">
              <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
            </div>
            <div className="rounded-[24px] bg-surface/92 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:pb-1 md:max-w-[38rem]">
              <h1 className="text-2xl font-semibold leading-tight text-text">{profile.name}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end md:self-start">
            {children}
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface/92 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <p className="text-xs text-muted">viagens</p>
                <p className="text-base font-semibold text-text sm:text-lg">{tripCountOverride ?? profile.publishedTripsCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface/92 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <p className="text-xs text-muted">recomendações</p>
                <p className="text-base font-semibold text-text sm:text-lg">{profile.publishedRecommendationsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
          {profile.bio || "Perfil em configuracao. Complete sua bio para contar sua historia na estrada."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <MapPin size={16} />
            {regionLabel ? `${locationLabel} • ${regionLabel}` : locationLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <Bike size={16} />
            {profile.motorcycle || "Moto ainda nao informada"}
          </span>
          {profile.contactEmail ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
              <Mail size={16} />
              {profile.contactEmail}
            </span>
          ) : null}
          {profile.phone ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
              <Phone size={16} />
              {formatPhone(profile.phone)}
            </span>
          ) : null}
          {profile.instagramHandle ? (
            <a
              href={`https://www.instagram.com/${profile.instagramHandle.replace(/^@+/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 transition hover:text-text"
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
