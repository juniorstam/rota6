import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPinned, Route } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import { PublishedTrip } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";

export function RouteFeedCard({ trip }: { trip: PublishedTrip }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-glow">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full">
            <Image src={trip.author.avatarUrl} alt={trip.author.name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text">{trip.author.name}</p>
            <p className="truncate text-sm text-muted" title={`${trip.origin} -> ${trip.destination}`}>
              {trip.origin} {"->"} {trip.destination}
            </p>
          </div>
        </div>
        <FavoriteButton id={trip.id} type="trip" />
      </div>

      <div className="relative h-[320px] w-full sm:h-[360px]">
        <Image src={trip.coverUrl} alt={trip.title} fill className="object-cover" />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-accent px-3 py-1 font-semibold text-white">{trip.tripType}</span>
          <span className="rounded-full bg-surfaceAlt px-3 py-1 font-semibold capitalize text-text">
            estrada {trip.roadLevel}
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-text">{trip.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{trip.summary}</p>
        </div>

        <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted" title={`${trip.origin} -> ${trip.destination}`}>
          <MapPinned size={16} className="shrink-0" />
          <span className="truncate">
            {trip.origin} {"->"} {trip.destination}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-4 py-2">
            <MapPinned size={16} />
            {formatDistance(trip.distanceKm)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-4 py-2">
            <Clock3 size={16} />
            {formatDuration(trip.durationHours)}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/viagem/${trip.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-background"
          >
            Ver rota
          </Link>
          <Link
            href={`/planejar?origem=${encodeURIComponent(trip.origin)}&destino=${encodeURIComponent(trip.destination)}`}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-3 text-sm text-text"
          >
            <Route size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
