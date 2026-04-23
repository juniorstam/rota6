"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, Flag, LocateFixed, Map, Plus, Save, Trash2, X } from "lucide-react";

import { LocationSearchField } from "@/components/rebuild/location-search-field";
import { RouteMapCard } from "@/components/rebuild/route-map-card";
import {
  RoutePayload,
  RoutePreview,
  RouteRecord,
  RouteStopInput,
  RouteSuggestion,
  SearchSuggestion,
  StopType
} from "@/lib/rebuild/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";


const ROUTE_SUGGESTION_CATEGORY_LABELS: Record<RouteSuggestion["category"], string> = {
  restaurant: "Restaurante",
  cafe: "Café",
  bar: "Bar",
  fuel: "Posto",
  hotel: "Hotel",
  repair: "Oficina",
  viewpoint: "Mirante"
};

const REVIEW_TAGS = [
  "boa comida",
  "banheiro limpo",
  "seguro para moto",
  "estacionamento fácil",
  "atendimento bom",
  "vista bonita",
  "parada rápida",
  "ideal para viagem"
];

async function authFetch(path: string, init?: RequestInit) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

function suggestionToStop(value: SearchSuggestion, index: number, previous?: RouteStopInput): RouteStopInput {
  return {
    id: previous?.id,
    name: value.fullAddress,
    lat: value.lat,
    lng: value.lng,
    type: previous?.type ?? "rest",
    orderIndex: index
  };
}

export function RoutePlannerScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const routeId = params.get("route");
  const { user, loading } = useAuth();

  const [origin, setOrigin] = useState<SearchSuggestion | null>(null);
  const [destination, setDestination] = useState<SearchSuggestion | null>(null);
  const [stops, setStops] = useState<Array<{ suggestion: SearchSuggestion | null; type: StopType; id?: string }>>([]);
  const [preview, setPreview] = useState<RoutePreview | null>(null);
  const [routeSuggestions, setRouteSuggestions] = useState<RouteSuggestion[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busyPreview, setBusyPreview] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<RouteSuggestion | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [pendingStop, setPendingStop] = useState<SearchSuggestion | null>(null);
  const [locatingOrigin, setLocatingOrigin] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  function clearPreviewWithFeedback(message?: string) {
    setPreview(null);
    setRouteSuggestions([]);
    if (message) {
      setFeedback(message);
      return;
    }

    setFeedback((current) =>
      current === "Rota salva com sucesso." ? current : "Você alterou o trajeto. Recalcule para atualizar a prévia."
    );
  }

  function handleOriginSelect(value: SearchSuggestion | null) {
    setOrigin(value);
    clearPreviewWithFeedback();
  }

  function handleDestinationSelect(value: SearchSuggestion | null) {
    setDestination(value);
    clearPreviewWithFeedback();
  }

  function handleAddStop() {
    setPendingStop(null);
    setShowStopModal(true);
  }

  function handleRemoveStop(index: number) {
    setStops((current) => current.filter((_, itemIndex) => itemIndex !== index));
    clearPreviewWithFeedback("Parada removida. Recalcule para atualizar a rota.");
  }

  async function fillOriginWithCurrentLocation() {
    if (!navigator.geolocation) {
      setFeedback("Seu navegador não oferece geolocalização.");
      return;
    }

    setLocatingOrigin(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(current);
          const params = new URLSearchParams({
            latitude: current.lat.toString(),
            longitude: current.lng.toString()
          });
          const response = await fetch(`/api/maps/reverse?${params.toString()}`);
          const payload = response.ok ? ((await response.json()) as { label: string }) : null;
          const label = payload?.label ?? "Minha posição atual";

          setOrigin({
            id: `current-${position.coords.latitude}-${position.coords.longitude}`,
            name: "Minha posição",
            fullAddress: label,
            lat: current.lat,
            lng: current.lng
          });
          clearPreviewWithFeedback();
        } catch {
          const current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(current);
          setOrigin({
            id: `current-${position.coords.latitude}-${position.coords.longitude}`,
            name: "Minha posição",
            fullAddress: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
            lat: current.lat,
            lng: current.lng
          });
          clearPreviewWithFeedback();
        } finally {
          setLocatingOrigin(false);
        }
      },
      () => {
        setFeedback("Não consegui acessar sua localização atual.");
        setLocatingOrigin(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  function confirmStop() {
    if (!pendingStop) {
      return;
    }

    setStops((current) => [...current, { suggestion: pendingStop, type: "rest" }]);
    setShowStopModal(false);
    setPendingStop(null);
    clearPreviewWithFeedback("Parada adicionada. Recalcule para atualizar a rota.");
  }

  useEffect(() => {
    if (!routeId || !user) {
      return;
    }

    authFetch(`/api/routes/${routeId}`)
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(payload?.message ?? "Não foi possível abrir a rota.");
        }
        return (await response.json()) as RouteRecord;
      })
      .then(async (route) => {
        setOrigin({
          id: `origin-${route.id}`,
          name: route.origin.name,
          fullAddress: route.origin.name,
          lat: route.origin.lat,
          lng: route.origin.lng
        });
        setDestination({
          id: `destination-${route.id}`,
          name: route.destination.name,
          fullAddress: route.destination.name,
          lat: route.destination.lat,
          lng: route.destination.lng
        });
        setStops(
          route.stops.map((stop) => ({
            id: stop.id,
            type: stop.type,
            suggestion: {
              id: stop.id ?? crypto.randomUUID(),
              name: stop.name,
              fullAddress: stop.name,
              lat: stop.lat,
              lng: stop.lng
            }
          }))
        );
        setPreview({
          geometry: [],
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          staticMapUrl: null,
          live: false
        });

        const response = await fetch("/api/route-preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            origin: route.origin,
            destination: route.destination,
            distanceKm: route.distanceKm,
            durationMinutes: route.durationMinutes,
            stops: route.stops
          } satisfies RoutePayload)
        });

        if (response.ok) {
          setPreview((await response.json()) as RoutePreview);
        }
      })
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : "Não foi possível abrir a rota.");
      });
  }, [routeId, user]);

  const canCalculate = Boolean(origin && destination);
  const canSave = Boolean(origin && destination);
  const readyStops = stops.filter((stop) => stop.suggestion).length;
  const routePoints = [origin, ...stops.map((stop) => stop.suggestion), destination].filter(Boolean).length;
  const waypointMarkers = useMemo(
    () =>
      [
        origin ? { lat: origin.lat, lng: origin.lng, kind: "origin" as const } : null,
        ...stops.flatMap((stop) =>
          stop.suggestion ? [{ lat: stop.suggestion.lat, lng: stop.suggestion.lng, kind: "stop" as const }] : []
        ),
        destination ? { lat: destination.lat, lng: destination.lng, kind: "destination" as const } : null
      ].filter((point): point is { lat: number; lng: number; kind: "origin" | "stop" | "destination" } => Boolean(point)),
    [destination, origin, stops]
  );

  const payload = useMemo<RoutePayload | null>(() => {
    if (!origin || !destination) {
      return null;
    }

    return {
      origin: {
        name: origin.fullAddress,
        lat: origin.lat,
        lng: origin.lng,
        placeType: origin.type
      },
      destination: {
        name: destination.fullAddress,
        lat: destination.lat,
        lng: destination.lng,
        placeType: destination.type
      },
      distanceKm: preview?.distanceKm ?? null,
      durationMinutes: preview?.durationMinutes ?? null,
      stops: stops.flatMap((stop, index) => {
        if (!stop.suggestion) {
          return [];
        }

        return [
          suggestionToStop(stop.suggestion, index, {
            id: stop.id,
            name: stop.suggestion.fullAddress,
            lat: stop.suggestion.lat,
            lng: stop.suggestion.lng,
            type: stop.type,
            orderIndex: index
          })
        ];
      })
    };
  }, [destination, origin, preview?.distanceKm, preview?.durationMinutes, stops]);

  async function calculateRoute() {
    if (!payload) {
      setFeedback("Escolha origem e destino para calcular a rota.");
      return;
    }

    setBusyPreview(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/route-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as RoutePreview | { message?: string };
      if (!response.ok) {
        throw new Error("message" in result ? result.message : "Não foi possível calcular a rota.");
      }

      setPreview(result as RoutePreview);

      const suggestionsResponse = await fetch("/api/route-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payload,
          geometry: (result as RoutePreview).geometry
        })
      });

      if (suggestionsResponse.ok) {
        setRouteSuggestions((await suggestionsResponse.json()) as RouteSuggestion[]);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível calcular a rota.");
    } finally {
      setBusyPreview(false);
    }
  }

  async function saveRoute() {
    if (!payload) {
      setFeedback("Preencha origem e destino antes de salvar.");
      return;
    }

    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    setBusySave(true);
    setFeedback(null);

    try {
      const response = await authFetch(routeId ? `/api/routes/${routeId}` : "/api/routes", {
        method: routeId ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as RouteRecord | { message?: string };
      if (!response.ok) {
        throw new Error("message" in result ? result.message : "Não foi possível salvar a rota.");
      }

      const savedRoute = result as RouteRecord;
      setFeedback("Rota salva com sucesso.");
      router.replace(`/planejar?route=${savedRoute.id}`);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar a rota.");
    } finally {
      setBusySave(false);
    }
  }

  async function savePlaceRating() {
    if (!reviewTarget) {
      return;
    }

    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    try {
      const response = await authFetch("/api/place-reviews", {
        method: "POST",
        body: JSON.stringify({
          placeId: reviewTarget.id,
          rating: reviewRating,
          comment: reviewComment,
          tags: reviewTags
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Não foi possível salvar a avaliação.");
      }

      setReviewTarget(null);
      setReviewComment("");
      setReviewTags([]);
      setReviewRating(5);
      setFeedback("Avaliação salva. Obrigado por fortalecer a comunidade Rota 6.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar a avaliação.");
    }
  }

  function swapOriginAndDestination() {
    setOrigin(destination);
    setDestination(origin);
    setPreview(null);
    setRouteSuggestions([]);
    setFeedback("Origem e destino foram invertidos. Recalcule para atualizar a prévia.");
  }

  function resetPlanner() {
    setOrigin(null);
    setDestination(null);
    setStops([]);
    setPreview(null);
    setRouteSuggestions([]);
    setFeedback("Planejador limpo para começar uma rota nova.");

    if (routeId) {
      router.replace("/planejar");
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <RouteMapCard preview={preview} hasRoutePoints={routePoints > 1} waypoints={waypointMarkers}>
        <div className="pointer-events-auto space-y-1.5">
          <div className="grid gap-1.5">
            <LocationSearchField
              label="Origem"
              value={origin}
              onSelect={handleOriginSelect}
              placeholder="Origem"
              compact
              icon={<LocateFixed size={13} />}
              onIconClick={fillOriginWithCurrentLocation}
              iconButtonLabel="Usar localização atual"
              iconLoading={locatingOrigin}
              proximity={userLocation}
            />

            <LocationSearchField
              label="Destino"
              value={destination}
              onSelect={handleDestinationSelect}
              placeholder="Destino"
              compact
              icon={<Flag size={13} />}
              proximity={userLocation}
            />

            <div className="flex justify-end pr-1 pt-0">
              <button
                type="button"
                onClick={swapOriginAndDestination}
                disabled={!origin && !destination}
                className="text-xs text-muted transition hover:text-text disabled:opacity-50"
              >
                inverter
              </button>
            </div>
          </div>
        </div>
      </RouteMapCard>

      <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(15,21,30,0.78)_0%,rgba(11,16,23,0.84)_100%)] px-3.5 py-3 md:px-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddStop}
            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border/80 bg-background/82 px-3 text-[13px] font-medium text-text md:px-4 md:text-sm"
          >
            <Plus size={14} />
            + adicionar parada
          </button>

          <button
            type="button"
            onClick={calculateRoute}
            disabled={!canCalculate || busyPreview}
            className="inline-flex h-10 min-w-0 items-center justify-center whitespace-nowrap rounded-full bg-accent px-3 text-[13px] font-semibold text-background shadow-[0_18px_40px_rgba(47,128,237,0.24)] disabled:opacity-50 md:px-4 md:text-sm"
          >
            {busyPreview ? "Calculando..." : "Calcular rota"}
          </button>
        </div>

        {stops.length === 0 ? null : (
          <div className="mt-4 space-y-2">
            {stops.map((stop, index) => (
              <div key={`${stop.id ?? "new"}-${index}`} className="flex items-center justify-between gap-3 rounded-[18px] px-1 py-1">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Parada {index + 1}</p>
                  <p className="truncate text-sm text-text">{stop.suggestion?.fullAddress}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(index)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 text-muted"
                  aria-label="Remover parada"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(18,24,32,0.74)_0%,rgba(12,17,24,0.84)_100%)] px-3.5 py-3 md:px-4">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <button
            type="button"
            onClick={saveRoute}
            disabled={!canSave || busySave}
            className="inline-flex h-10 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-3 text-[13px] font-semibold text-background shadow-[0_18px_40px_rgba(47,128,237,0.24)] disabled:opacity-50 md:px-4 md:text-sm"
          >
            <Save size={14} />
            {busySave ? "Salvando..." : routeId ? "Atualizar" : "Salvar"}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {preview ? (
            <p className="text-xs text-muted">
              {preview.provider === "mapbox"
                ? "Rota por estrada com Mapbox."
                : preview.provider === "osrm"
                  ? "Rota por estrada com engine de fallback."
                  : "Rota em modo básico."}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={resetPlanner}
            disabled={!origin && !destination && stops.length === 0 && !preview}
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-border/80 bg-background/82 px-3 text-xs text-text disabled:opacity-50"
          >
            <Trash2 size={13} />
            limpar
          </button>
        </div>

        {feedback ? (
          <div className="mt-3 flex items-start gap-3 rounded-[18px] border border-border/80 bg-background/76 px-3 py-3">
            <CircleAlert size={16} className="mt-0.5 shrink-0 text-accentSoft" />
            <p className="text-sm leading-6 text-muted">{feedback}</p>
          </div>
        ) : null}
      </section>

      {payload ? (
        <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(18,24,32,0.58)_0%,rgba(12,17,24,0.72)_100%)] px-3.5 py-3 md:px-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Rota</p>
              <p className="mt-1 text-sm text-text">{origin?.name} → {destination?.name}</p>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted">
              {readyStops} parada{readyStops === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-muted">
            <p className="truncate"><span className="text-text">Origem:</span> {origin?.fullAddress}</p>
            {stops.map((stop, index) =>
              stop.suggestion ? (
                <p key={`${stop.id ?? "route-stop"}-${index}`} className="truncate">
                  <span className="text-text">Parada {index + 1}:</span> {stop.suggestion.fullAddress}
                </p>
              ) : null
            )}
            <p className="truncate"><span className="text-text">Destino:</span> {destination?.fullAddress}</p>
          </div>
        </section>
      ) : null}

      {routeSuggestions.length > 0 ? (
        <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(18,24,32,0.58)_0%,rgba(12,17,24,0.72)_100%)] px-3.5 py-3 md:px-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Sugestões na sua rota</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {routeSuggestions.map((place) => (
              <article key={place.id} className="rounded-[18px] border border-white/10 bg-background/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{place.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {ROUTE_SUGGESTION_CATEGORY_LABELS[place.category]} · {place.city}/{place.state}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accentSoft">
                    {place.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {place.ratingsCount} avaliações · desvio aprox. {place.detourKm} km
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedback(`${place.name} fica a aproximadamente ${place.detourKm} km do trajeto.`)}
                    className="h-9 rounded-full border border-border/80 text-xs text-text"
                  >
                    Ver no mapa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewTarget(place);
                      setReviewRating(5);
                      setReviewComment("");
                      setReviewTags([]);
                    }}
                    className="h-9 rounded-full bg-accent text-xs font-semibold text-background"
                  >
                    Avaliar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {showLoginAlert ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(5,9,14,0.68)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[rgba(11,17,25,0.96)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            <p className="text-base font-semibold text-text">Faça login para salvar sua rota</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLoginAlert(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-border/80 bg-background/82 px-4 text-sm font-medium text-text"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-background"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showStopModal ? (
        <div className="fixed inset-0 z-[82] flex items-end justify-center bg-[rgba(5,9,14,0.68)] p-3 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-md rounded-[26px] border border-white/10 bg-[rgba(11,17,25,0.98)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-text">Adicionar parada</p>
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  setPendingStop(null);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-muted"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <LocationSearchField
              label="Parada"
              value={pendingStop}
              onSelect={setPendingStop}
              placeholder="Buscar parada"
              compact
              icon={<Map size={13} />}
              proximity={userLocation}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  setPendingStop(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-background/82 px-4 text-sm font-medium text-text"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmStop}
                disabled={!pendingStop}
                className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-background disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reviewTarget ? (
        <div className="fixed inset-0 z-[84] flex items-end justify-center bg-[rgba(5,9,14,0.68)] p-3 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-md rounded-[26px] border border-white/10 bg-[rgba(11,17,25,0.98)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text">Avaliar parada</p>
                <p className="mt-1 text-sm text-muted">{reviewTarget.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-muted"
                aria-label="Fechar avaliação"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewRating(rating)}
                  className={`h-10 flex-1 rounded-full border text-sm font-semibold ${
                    reviewRating >= rating
                      ? "border-accent bg-accent text-background"
                      : "border-border/80 bg-background/82 text-muted"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Comentário opcional"
              className="mt-3 min-h-24 w-full rounded-[18px] border border-white/10 bg-background/70 px-3 py-3 text-[16px] text-text outline-none placeholder:text-muted/65 focus:border-accent/80 md:text-sm"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => {
                const selected = reviewTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setReviewTags((current) =>
                        selected ? current.filter((item) => item !== tag) : [...current, tag]
                      )
                    }
                    className={`rounded-full border px-3 py-2 text-xs ${
                      selected ? "border-accent bg-accent/15 text-accentSoft" : "border-border/80 text-muted"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-background/82 px-4 text-sm font-medium text-text"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={savePlaceRating}
                className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-background"
              >
                Salvar avaliação
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
