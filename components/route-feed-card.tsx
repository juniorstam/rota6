import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPinned } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import { roadLevelLabels, tripTypeLabels } from "@/lib/trip-taxonomy";
import { PublishedTrip } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";

export function RouteFeedCard({ trip }: { trip: PublishedTrip }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-glow">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <Link href={`/perfil/${trip.author.username}`} className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
            <Image src={trip.author.avatarUrl} alt={trip.author.name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-text">{trip.author.name}</p>
            <p className="truncate text-sm text-muted">@{trip.author.username}</p>
          </div>
        </Link>
        <FavoriteButton id={trip.id} type="trip" />
      </div>

      <Link href={`/viagem/${trip.slug}`} className="block">
        <div className="relative aspect-square w-full sm:h-[360px] sm:aspect-auto">
          <Image src={trip.coverUrl} alt={trip.title} fill className="object-cover" />
        </div>
      </Link>

      <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href={`/tipo/${trip.tripType}`}
            className="rounded-full bg-accent px-3 py-1 font-semibold text-white transition hover:opacity-90"
          >
            {tripTypeLabels[trip.tripType]}
          </Link>
          <Link
            href={`/estrada/${trip.roadLevel}`}
            className="rounded-full bg-surfaceAlt px-3 py-1 font-semibold text-text transition hover:bg-border"
          >
            {roadLevelLabels[trip.roadLevel]}
          </Link>
        </div>

        <Link href={`/viagem/${trip.slug}`} className="block space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-snug text-text sm:text-2xl">{trip.title}</h3>
            <p className="mt-1.5 text-sm leading-5 text-muted sm:mt-2 sm:leading-6">{trip.summary}</p>
          </div>

          <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted" title={`${trip.origin} -> ${trip.destination}`}>
            <MapPinned size={16} className="shrink-0" />
            <span className="truncate">
              {trip.origin} {"->"} {trip.destination}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 text-sm text-muted">
            <span className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-3.5 py-2">
              <MapPinned size={16} />
              {formatDistance(trip.distanceKm)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-3.5 py-2">
              <Clock3 size={16} />
              {formatDuration(trip.durationHours)}
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}
