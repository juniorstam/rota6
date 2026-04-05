import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock3, MapPinned, Route } from "lucide-react";

import { MapView } from "@/components/map-view";
import { PhotoGallery } from "@/components/photo-gallery";
import { trips } from "@/lib/mock-data";
import { formatDistance, formatDuration } from "@/lib/utils";

export default async function TripDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = trips.find((entry) => entry.slug === slug);

  if (!trip) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-border bg-surface shadow-glow">
        <div className="relative h-[320px] md:h-[420px]">
          <Image src={trip.coverUrl} alt={trip.title} fill className="object-cover" />
        </div>

        <div className="space-y-5 p-6 md:p-8">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-accent px-3 py-1 font-semibold text-white">{trip.tripType}</span>
            <span className="rounded-full bg-surfaceAlt px-3 py-1 font-semibold capitalize text-text">
              estrada {trip.roadLevel}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagem publicada</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-semibold text-text md:text-5xl">{trip.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{trip.summary}</p>
          </div>

          <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted">
            <MapPinned size={16} className="shrink-0" />
            <span className="truncate">
              {trip.origin} {"->"} {trip.destination}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-4 py-2">
              <Route size={16} />
              {formatDistance(trip.distanceKm)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-4 py-2">
              <Clock3 size={16} />
              {formatDuration(trip.durationHours)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
          <div>
            <h2 className="text-xl font-semibold text-text">Paradas e roteiro</h2>
            <div className="mt-4 space-y-3">
              {trip.routeStops.map((stop) => (
                <article key={stop.id} className="rounded-[22px] border border-border bg-surfaceAlt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-accentSoft">{stop.type}</p>
                  <h3 className="mt-1 font-medium text-text">{stop.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {stop.city}, {stop.state}
                  </p>
                  {stop.notes && <p className="mt-2 text-sm text-muted">{stop.notes}</p>}
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-text">Dicas do autor</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {trip.tips.map((tip) => (
                <span key={tip} className="rounded-full bg-surfaceAlt px-4 py-2 text-sm text-muted">
                  {tip}
                </span>
              ))}
            </div>
          </div>
        </section>

        <MapView
          title="Rota publicada"
          subtitle={`Autor: ${trip.author.name} • ${trip.author.motorcycle}`}
          polyline={[
            { lat: -25.4284, lng: -49.2733 },
            { lat: -25.498, lng: -48.834 },
            { lat: -25.5762, lng: -48.5483 }
          ]}
        />
      </div>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Galeria</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Fotos da viagem</h2>
        </div>
        <PhotoGallery photos={trip.photos} />
      </section>
    </div>
  );
}
