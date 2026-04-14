"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Clock3, FilePenLine, MapPinned, Route, Trash2 } from "lucide-react";

import { MapView } from "@/components/map-view";
import { PhotoGallery } from "@/components/photo-gallery";
import { trips } from "@/lib/mock-data";
import {
  deletePublishedTripRecord,
  findPublishedTripRecord,
  PUBLISHED_TRIPS_EVENT,
  readPublishedTrips,
  updatePublishedTripRecord
} from "@/lib/published-trips";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PublishedTrip } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function TripDetailsClient({
  username,
  slug,
  initialTrip,
  useSupabase
}: {
  username?: string;
  slug: string;
  initialTrip: PublishedTrip | null;
  useSupabase: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [localTrips, setLocalTrips] = useState<PublishedTrip[]>(() => (useSupabase ? [] : []));
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (useSupabase) {
      setHydrated(true);
      return;
    }

    const sync = () => {
      setLocalTrips(readPublishedTrips());
      setHydrated(true);
    };

    sync();
    window.addEventListener(PUBLISHED_TRIPS_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(PUBLISHED_TRIPS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [useSupabase]);

  const trip = useMemo(() => {
    if (useSupabase) {
      return initialTrip;
    }

    if (username) {
      return (
        localTrips.find((entry) => entry.author.username === username && entry.slug === slug) ??
        trips.find((entry) => entry.author.username === username && entry.slug === slug) ??
        null
      );
    }

    return trips.find((entry) => entry.slug === slug) ?? null;
  }, [initialTrip, localTrips, slug, useSupabase, username]);
  const localTripRecord = useMemo(
    () => (useSupabase ? null : username ? findPublishedTripRecord(username, slug) : null),
    [hydrated, slug, username, localTrips, useSupabase]
  );
  const isOwnLocalTrip = Boolean(localTripRecord && user && localTripRecord.author.id === user.id);
  const isOwnSupabaseTrip = Boolean(useSupabase && user && trip && trip.author.id === user.id);

  function handleTogglePublished() {
    if (useSupabase && trip) {
      void (async () => {
        try {
          const supabase = getSupabaseBrowserClient();
          const {
            data: { session }
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            throw new Error("Sua sessao expirou. Entre novamente antes de ajustar a publicacao.");
          }

          const response = await fetch(`/api/trips/${trip.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              visibility: trip.publicVisibility ? "private" : "public"
            })
          });
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error ?? "Nao foi possivel atualizar a publicacao.");
          }

          setFeedback(
            trip.publicVisibility
              ? "Viagem marcada como não publicada. Ela sai da vitrine pública."
              : "Viagem marcada como publicada. Ela volta para as vitrines públicas."
          );
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Nao foi possivel atualizar a publicacao.");
        }
      })();
      return;
    }

    if (!localTripRecord) {
      return;
    }

    updatePublishedTripRecord(localTripRecord.id, (record) => ({
      ...record,
      visibility: record.visibility === "public" ? "private" : "public"
    }));
    setFeedback(
      localTripRecord.visibility === "public"
        ? "Viagem marcada como não publicada. Ela sai da home pública, mas continua acessível para você no perfil."
        : "Viagem marcada como publicada. Ela volta a aparecer na home e no perfil público."
    );
  }

  function handleDeleteTrip() {
    if (useSupabase && trip) {
      void (async () => {
        try {
          const supabase = getSupabaseBrowserClient();
          const {
            data: { session }
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            throw new Error("Sua sessao expirou. Entre novamente antes de apagar a publicacao.");
          }

          const response = await fetch(`/api/trips/${trip.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error ?? "Nao foi possivel apagar a viagem.");
          }

          router.push(`/perfil/${trip.author.username}`);
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Nao foi possivel apagar a viagem.");
        }
      })();
      return;
    }

    if (!localTripRecord) {
      return;
    }

    deletePublishedTripRecord(localTripRecord.id);
    router.push(`/perfil/${localTripRecord.author.username}`);
    router.refresh();
  }

  if (!trip && hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-accentSoft">404</p>
          <h1 className="text-4xl font-semibold text-text">Conteúdo não encontrado</h1>
          <p className="max-w-xl text-sm leading-6 text-muted">
            A viagem pode ter sido removida, ainda não ter sido publicada neste navegador ou o link não corresponder ao perfil de quem publicou.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            Voltar para a home
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return <div className="min-h-[40vh]" />;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-border bg-surface shadow-glow">
        <div className="relative h-[320px] md:h-[420px]">
          <Image src={trip.coverUrl} alt={trip.title} fill sizes="100vw" className="object-cover" />
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

          {(isOwnLocalTrip && localTripRecord) || isOwnSupabaseTrip ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={useSupabase && trip ? `/publicar?edit-online=${trip.id}` : `/publicar?edit=${localTripRecord?.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text"
              >
                <FilePenLine size={16} />
                Editar
              </Link>
              <button
                type="button"
                onClick={handleTogglePublished}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text"
              >
                {trip.publicVisibility ? "Deixar não publicada" : "Publicar viagem"}
              </button>
              <button
                type="button"
                onClick={handleDeleteTrip}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
              >
                <Trash2 size={16} />
                Apagar publicação
              </button>
            </div>
          ) : null}

          <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted">
            <MapPinned size={16} className="shrink-0" />
            <span className="truncate">
              {trip.origin} {"->"} {trip.destination}
            </span>
          </div>

          {feedback ? (
            <div className="rounded-[20px] border border-border bg-surfaceAlt/70 p-4 text-sm text-muted">
              {feedback}
            </div>
          ) : null}

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
                  {(stop.city || stop.state) && (
                    <p className="mt-1 text-sm text-muted">
                      {stop.city}
                      {stop.city && stop.state ? ", " : ""}
                      {stop.state}
                    </p>
                  )}
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
