"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Flag,
  LoaderCircle,
  Lock,
  LocateFixed,
  Map,
  Navigation,
  Plus,
  Save,
  Trash2,
  X
} from "lucide-react";

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

function formatDuration(durationMinutes: number | null) {
  if (!durationMinutes || durationMinutes <= 0) return "—";
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

function formatDistanceMask(km: number | null | undefined): string {
  if (!km) return "—";
  return km.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " km";
}

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
  const { user } = useAuth();

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
  const [topCollapsed, setTopCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);

  function clearPreviewWithFeedback(message?: string) {
    setPreview(null);
    setRouteSuggestions([]);
    if (message) {
      setFeedback(message);
      return;
    }
    setFeedback((current) =>
      current === "Rota salva com sucesso." ? current : "Trajeto alterado. Recalcule para atualizar."
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
    setStops((current) => current.filter((_, i) => i !== index));
    clearPreviewWithFeedback("Parada removida. Recalcule a rota.");
  }

  async function fillOriginWithCurrentLocation() {
    if (!navigator.geolocation) {
      setFeedback("Seu navegador não suporta geolocalização.");
      return;
    }
    setLocatingOrigin(true);
    setFeedback(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const current = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(current);
          const p = new URLSearchParams({ latitude: current.lat.toString(), longitude: current.lng.toString() });
          const res = await fetch(`/api/maps/reverse?${p.toString()}`);
          const payload = res.ok ? ((await res.json()) as { label: string }) : null;
          setOrigin({
            id: `current-${current.lat}-${current.lng}`,
            name: "Minha posição",
            fullAddress: payload?.label ?? "Minha posição atual",
            lat: current.lat,
            lng: current.lng
          });
          clearPreviewWithFeedback();
        } catch {
          const current = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(current);
          setOrigin({
            id: `current-${current.lat}-${current.lng}`,
            name: "Minha posição",
            fullAddress: `${current.lat.toFixed(5)}, ${current.lng.toFixed(5)}`,
            lat: current.lat,
            lng: current.lng
          });
          clearPreviewWithFeedback();
        } finally {
          setLocatingOrigin(false);
        }
      },
      () => {
        setFeedback("Não foi possível acessar sua localização.");
        setLocatingOrigin(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function confirmStop() {
    if (!pendingStop) return;
    setStops((current) => [...current, { suggestion: pendingStop, type: "rest" }]);
    setShowStopModal(false);
    setPendingStop(null);
    clearPreviewWithFeedback("Parada adicionada. Recalcule a rota.");
  }

  useEffect(() => {
    if (!routeId || !user) return;

    authFetch(`/api/routes/${routeId}`)
      .then(async (res) => {
        if (!res.ok) {
          const p = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(p?.message ?? "Não foi possível abrir a rota.");
        }
        return (await res.json()) as RouteRecord;
      })
      .then(async (route) => {
        setOrigin({ id: `origin-${route.id}`, name: route.origin.name, fullAddress: route.origin.name, lat: route.origin.lat, lng: route.origin.lng });
        setDestination({ id: `destination-${route.id}`, name: route.destination.name, fullAddress: route.destination.name, lat: route.destination.lat, lng: route.destination.lng });
        setStops(route.stops.map((stop) => ({
          id: stop.id,
          type: stop.type,
          suggestion: { id: stop.id ?? crypto.randomUUID(), name: stop.name, fullAddress: stop.name, lat: stop.lat, lng: stop.lng }
        })));
        setPreview({ geometry: [], distanceKm: route.distanceKm, durationMinutes: route.durationMinutes, staticMapUrl: null, live: false });

        const res = await fetch("/api/route-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: route.origin, destination: route.destination, distanceKm: route.distanceKm, durationMinutes: route.durationMinutes, stops: route.stops } satisfies RoutePayload)
        });
        if (res.ok) setPreview((await res.json()) as RoutePreview);
      })
      .catch((err) => setFeedback(err instanceof Error ? err.message : "Não foi possível abrir a rota."));
  }, [routeId, user]);

  const canCalculate = Boolean(origin && destination);
  const canSave = Boolean(origin && destination);
  const routePoints = [origin, ...stops.map((s) => s.suggestion), destination].filter(Boolean).length;

  const waypointMarkers = useMemo(
    () =>
      [
        origin ? { lat: origin.lat, lng: origin.lng, kind: "origin" as const } : null,
        ...stops.flatMap((s) => s.suggestion ? [{ lat: s.suggestion.lat, lng: s.suggestion.lng, kind: "stop" as const }] : []),
        destination ? { lat: destination.lat, lng: destination.lng, kind: "destination" as const } : null
      ].filter((p): p is { lat: number; lng: number; kind: "origin" | "stop" | "destination" } => Boolean(p)),
    [destination, origin, stops]
  );

  const payload = useMemo<RoutePayload | null>(() => {
    if (!origin || !destination) return null;
    return {
      origin: { name: origin.fullAddress, lat: origin.lat, lng: origin.lng, placeType: origin.type },
      destination: { name: destination.fullAddress, lat: destination.lat, lng: destination.lng, placeType: destination.type },
      distanceKm: preview?.distanceKm ?? null,
      durationMinutes: preview?.durationMinutes ?? null,
      stops: stops.flatMap((s, i) =>
        s.suggestion ? [suggestionToStop(s.suggestion, i, { id: s.id, name: s.suggestion.fullAddress, lat: s.suggestion.lat, lng: s.suggestion.lng, type: s.type, orderIndex: i })] : []
      )
    };
  }, [destination, origin, preview?.distanceKm, preview?.durationMinutes, stops]);

  async function calculateRoute() {
    if (!payload) { setFeedback("Escolha origem e destino para calcular."); return; }
    setBusyPreview(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/route-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await res.json()) as RoutePreview | { message?: string };
      if (!res.ok) throw new Error("message" in result ? result.message : "Não foi possível calcular a rota.");
      setPreview(result as RoutePreview);

      const sugRes = await fetch("/api/route-suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload, geometry: (result as RoutePreview).geometry }) });
      if (sugRes.ok) setRouteSuggestions((await sugRes.json()) as RouteSuggestion[]);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Não foi possível calcular a rota.");
    } finally {
      setBusyPreview(false);
    }
  }

  async function saveRoute() {
    if (!payload) { setFeedback("Preencha origem e destino antes de salvar."); return; }
    if (!user) { setShowLoginAlert(true); return; }
    setBusySave(true);
    setFeedback(null);
    try {
      const res = await authFetch(routeId ? `/api/routes/${routeId}` : "/api/routes", {
        method: routeId ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });
      const result = (await res.json()) as RouteRecord | { message?: string };
      if (!res.ok) throw new Error("message" in result ? result.message : "Não foi possível salvar a rota.");
      const saved = result as RouteRecord;
      setFeedback("Rota salva com sucesso.");
      router.replace(`/planejar?route=${saved.id}`);
      router.refresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Não foi possível salvar a rota.");
    } finally {
      setBusySave(false);
    }
  }

  async function savePlaceRating() {
    if (!reviewTarget) return;
    if (!user) { setShowLoginAlert(true); return; }
    try {
      const res = await authFetch("/api/place-reviews", { method: "POST", body: JSON.stringify({ placeId: reviewTarget.id, rating: reviewRating, comment: reviewComment, tags: reviewTags }) });
      if (!res.ok) { const p = (await res.json().catch(() => null)) as { message?: string } | null; throw new Error(p?.message ?? "Não foi possível salvar a avaliação."); }
      setReviewTarget(null);
      setReviewComment("");
      setReviewTags([]);
      setReviewRating(5);
      setFeedback("Avaliação salva. Obrigado por fortalecer a comunidade Rota 6.");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Não foi possível salvar a avaliação.");
    }
  }

  function swapOriginAndDestination() {
    setOrigin(destination);
    setDestination(origin);
    setPreview(null);
    setRouteSuggestions([]);
    setFeedback("Origem e destino invertidos. Recalcule a rota.");
  }

  function resetPlanner() {
    setOrigin(null);
    setDestination(null);
    setStops([]);
    setPreview(null);
    setRouteSuggestions([]);
    setFeedback(null);
    if (routeId) router.replace("/planejar");
  }

  function startNavigation() {
    if (!origin || !destination) return;
    setShowNavModal(true);
  }

  function openNavigationApp(app: "google" | "waze") {
    if (!origin || !destination) return;
    const parts = [
      `${origin.lat},${origin.lng}`,
      ...stops.flatMap((s) => (s.suggestion ? [`${s.suggestion.lat},${s.suggestion.lng}`] : [])),
      `${destination.lat},${destination.lng}`
    ];
    if (app === "google") {
      window.open(`https://www.google.com/maps/dir/${parts.join("/")}`, "_blank");
    } else {
      window.open(
        `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes&from=${origin.lat},${origin.lng}`,
        "_blank"
      );
    }
    setShowNavModal(false);
  }

  /* ── waypoints for leg scroll ── */
  const legPoints = useMemo(() => {
    const points: { id: string; name: string; kind: "origin" | "stop" | "destination" }[] = [];
    if (origin) points.push({ id: origin.id, name: origin.name, kind: "origin" });
    stops.forEach((s) => { if (s.suggestion) points.push({ id: s.suggestion.id, name: s.suggestion.name, kind: "stop" }); });
    if (destination) points.push({ id: destination.id, name: destination.name, kind: "destination" });
    return points;
  }, [origin, stops, destination]);

  const legDistances = useMemo(() => {
    if (!preview?.distanceKm || legPoints.length < 2) return [] as number[];
    const perLeg = preview.distanceKm / (legPoints.length - 1);
    return Array.from({ length: legPoints.length - 1 }, () => perLeg);
  }, [preview?.distanceKm, legPoints.length]);

  const dotColor = (kind: "origin" | "stop" | "destination") =>
    kind === "origin" ? "#4ade80" : kind === "destination" ? "#fb7185" : "#fbbf24";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">

      {/* ── MAP AREA ── */}
      <div className="absolute inset-0">
        <RouteMapCard
          preview={preview}
          hasRoutePoints={routePoints > 1}
          waypoints={waypointMarkers}
        />
      </div>

      {/* ── TOP PANEL — fixo no topo ── */}
      <div className="pointer-events-auto relative z-20 w-full p-3 pb-0 md:p-4 md:pb-0">
        <div className="overflow-hidden rounded-[22px] border border-white/15 bg-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">

            {/* Handle retrátil */}
            <button
              type="button"
              onClick={() => setTopCollapsed((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-white/50 transition hover:text-white/80"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                {topCollapsed
                  ? (origin && destination ? `${origin.name} → ${destination.name}` : "Planejar rota")
                  : "Rota"}
              </span>
              {topCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {!topCollapsed && (
            <div className="px-4 pt-0 pb-3">

              {/* ORIGIN row */}
              <div className="flex items-start gap-3">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="mt-[18px] flex h-5 w-5 items-center justify-center rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="mt-1.5 border-l-2 border-dashed border-white/25" style={{ height: stops.length > 0 ? 28 : 20 }} />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <LocationSearchField
                      label="Origem"
                      value={origin}
                      onSelect={handleOriginSelect}
                      placeholder="De onde você sai?"
                      compact
                      proximity={userLocation}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fillOriginWithCurrentLocation}
                    aria-label="Usar minha localização"
                    className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition active:bg-white/20"
                  >
                    {locatingOrigin
                      ? <LoaderCircle size={18} className="animate-spin" />
                      : <LocateFixed size={18} />}
                  </button>
                </div>
              </div>

              {/* STOPS */}
              {stops.map((stop, index) => (
                <div key={`${stop.id ?? "new"}-${index}`} className="flex items-start gap-3">
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="mt-[18px] h-4 w-4 shrink-0 rounded-full border-2 border-white/80 bg-[#fbbf24] shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                    <div className="mt-1.5 border-l-2 border-dashed border-white/25" style={{ height: 20 }} />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-[52px] min-w-0 flex-1 items-center rounded-[16px] border border-white/20 bg-white/10 px-4">
                      <p className="truncate text-[16px] font-medium text-white">
                        {stop.suggestion?.name ?? "Parada " + (index + 1)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      aria-label="Remover parada"
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition active:bg-white/20"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* DESTINATION row */}
              <div className="flex items-start gap-3">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="mt-[18px] flex h-5 w-5 shrink-0 items-center justify-center">
                    <Flag size={18} className="text-[#fb7185] drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <LocationSearchField
                    label="Destino"
                    value={destination}
                    onSelect={handleDestinationSelect}
                    placeholder="Para onde você vai?"
                    compact
                    proximity={userLocation}
                  />
                </div>
              </div>
            </div>
            )}

            {/* Swap + invert */}
            {!topCollapsed && (origin || destination) ? (
              <div className="flex items-center justify-end border-t border-white/10 px-4 py-2">
                <button
                  type="button"
                  onClick={swapOriginAndDestination}
                  className="text-[12px] font-semibold text-white/50 transition hover:text-white/80"
                >
                  {"⇅"} inverter origem e destino
                </button>
              </div>
            ) : null}
          </div>
        </div>

      {/* ── BOTTOM SHEET — fixo na base, arrastável ── */}
      <div
        className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20 pb-24 md:pb-6"
        style={{ touchAction: "none" }}
      >
        {/* Sugestões acima do painel */}
        {routeSuggestions.length > 0 ? (
          <div className="mx-3 mb-2 rounded-[18px] border border-white/10 bg-black/80 p-3 backdrop-blur-md md:mx-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Sugestões na rota</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {routeSuggestions.map((place) => (
                <article key={place.id} className="flex shrink-0 w-[160px] flex-col overflow-hidden rounded-[14px] border border-white/10 bg-white/10">
                  <div className="relative h-[72px] w-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">
                      {ROUTE_SUGGESTION_CATEGORY_LABELS[place.category]}
                    </span>
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {"★"} {place.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    <p className="truncate text-[12px] font-semibold text-white">{place.name}</p>
                    <p className="text-[10px] text-white/50">{place.city}</p>
                    <button
                      type="button"
                      onClick={() => { setReviewTarget(place); setReviewRating(5); setReviewComment(""); setReviewTags([]); }}
                      className="mt-1.5 h-6 w-full rounded-full bg-accent/80 text-[10px] font-semibold text-white"
                    >
                      + Parada
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {/* Painel principal */}
        <div className="mx-3 rounded-[22px] border border-white/15 bg-black/80 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl md:mx-4">

          {/* Handle de arrastar */}
          <button
            type="button"
            onClick={() => setBottomCollapsed((v) => !v)}
            className="flex w-full flex-col items-center gap-1 px-4 pt-2.5 pb-1"
          >
            <div className="h-1 w-10 rounded-full bg-white/25" />
            <div className="flex w-full items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">
                {preview
                  ? `${formatDistanceMask(preview.distanceKm)} · ${formatDuration(preview.durationMinutes)}`
                  : "Ações"}
              </span>
              {bottomCollapsed ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
            </div>
          </button>

          {!bottomCollapsed && (
          <div className="px-4 pb-4 pt-1">

          {/* LEG SCROLL */}
          {preview && legPoints.length >= 2 ? (
            <div className="mb-3">
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
                {legPoints.map((point, index) => (
                  <Fragment key={point.id}>
                    <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-[14px] border border-white/15 bg-white/10 px-3 py-2">
                      <div
                        className="h-3 w-3 rounded-full border border-white/60"
                        style={{ background: dotColor(point.kind) }}
                      />
                      <p className="max-w-[64px] truncate text-center text-[11px] font-semibold leading-tight text-white">
                        {point.name}
                      </p>
                    </div>
                    {index < legPoints.length - 1 ? (
                      <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <span className="text-[16px] leading-none text-white/30">{"→"}</span>
                        <span className="text-[9px] font-semibold text-white/40">
                          {legDistances[index] != null
                            ? legDistances[index].toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " km"
                            : ""}
                        </span>
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>
          ) : null}

            {/* STATS */}
            {preview ? (
              <div className="mb-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-[16px] bg-white/10 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Distância</p>
                  <p className="mt-1 text-[20px] font-bold leading-tight text-white">
                    {formatDistanceMask(preview.distanceKm)}
                  </p>
                </div>
                <div className="rounded-[16px] bg-white/10 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Tempo</p>
                  <p className="mt-1 text-[20px] font-bold leading-tight text-white">
                    {formatDuration(preview.durationMinutes)}
                  </p>
                </div>
              </div>
            ) : null}

            {/* ACTION BUTTONS */}
            {!preview ? (
              /* No route yet */
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 text-[14px] font-semibold text-white transition active:bg-white/20"
                >
                  <Plus size={15} />
                  <span className="truncate">Adicionar parada</span>
                </button>
                <button
                  type="button"
                  onClick={calculateRoute}
                  disabled={!canCalculate || busyPreview}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(47,128,237,0.45)] transition disabled:opacity-50 active:scale-[0.98]"
                >
                  {busyPreview
                    ? <LoaderCircle size={15} className="animate-spin" />
                    : <ArrowRight size={15} />}
                  <span className="truncate">{busyPreview ? "Calculando..." : "Calcular rota"}</span>
                </button>
              </div>
            ) : (
              /* Route calculated */
              <div className="flex flex-col gap-2.5">
                {/* Iniciar navegação — destaque verde */}
                <button
                  type="button"
                  onClick={startNavigation}
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#16a34a] text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(22,163,74,0.45)] transition active:scale-[0.98]"
                >
                  <Navigation size={18} />
                  Iniciar navegação
                </button>

                {/* Salvar + Limpar */}
                <div className="flex gap-2.5">
                  {user ? (
                    <button
                      type="button"
                      onClick={saveRoute}
                      disabled={!canSave || busySave}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(47,128,237,0.4)] transition disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save size={15} />
                      <span className="truncate">{busySave ? "Salvando..." : routeId ? "Atualizar" : "Salvar"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLoginAlert(true)}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 text-[14px] font-semibold text-white/55 transition active:bg-white/20"
                    >
                      <Lock size={15} />
                      Salvar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetPlanner}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 text-[14px] font-semibold text-white transition active:bg-white/20"
                  >
                    <Trash2 size={15} />
                    Limpar
                  </button>
                </div>
              </div>
            )}

            {/* FEEDBACK */}
            {feedback ? (
              <div className="mt-3 flex items-start gap-2.5 rounded-[14px] bg-white/8 px-3 py-3">
                <CircleAlert size={15} className="mt-0.5 shrink-0 text-accentSoft" />
                <p className="text-[13px] leading-5 text-white/85">{feedback}</p>
              </div>
            ) : null}

          </div>
          )}
        </div>
      </div>

      {/* ── MODAL: Escolha do app de navegação ── */}
      {showNavModal ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-sm rounded-[26px] border border-white/15 bg-[rgba(11,17,25,0.98)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <p className="text-[18px] font-bold text-white">Abrir no app de navegação</p>
            <p className="mt-1 text-[13px] text-white/50">Escolha o app que prefere usar</p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => openNavigationApp("google")}
                className="flex h-14 w-full items-center gap-4 rounded-[18px] border border-white/10 bg-white/10 px-4 text-left transition active:bg-white/20"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4285F4] text-[13px] font-bold text-white">G</div>
                <div>
                  <p className="text-[15px] font-bold text-white">Google Maps</p>
                  <p className="text-[12px] text-white/50">Suporta múltiplas paradas</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => openNavigationApp("waze")}
                className="flex h-14 w-full items-center gap-4 rounded-[18px] border border-white/10 bg-white/10 px-4 text-left transition active:bg-white/20"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#33CCFF] text-[13px] font-bold text-white">W</div>
                <div>
                  <p className="text-[15px] font-bold text-white">Waze</p>
                  <p className="text-[12px] text-white/50">Origem ao destino direto</p>
                </div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowNavModal(false)}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-white/15 text-[14px] text-white/50 transition hover:text-white/80"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {/* ── LOGIN ALERT MODAL ── */}
      {showLoginAlert ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] border border-white/15 bg-[rgba(11,17,25,0.97)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <p className="text-[19px] font-bold text-white">Crie uma conta gratuita</p>
            <p className="mt-1.5 text-[14px] text-white/60">Salve suas rotas e acesse de qualquer dispositivo.</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLoginAlert(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[15px] font-medium text-white"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white"
              >
                Entrar / Criar conta
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── ADD STOP MODAL ── */}
      {showStopModal ? (
        <div className="fixed inset-0 z-[82] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-md rounded-[26px] border border-white/15 bg-[rgba(11,17,25,0.98)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[18px] font-semibold text-white">Adicionar parada</p>
              <button
                type="button"
                onClick={() => { setShowStopModal(false); setPendingStop(null); }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <LocationSearchField
              label="Parada"
              value={pendingStop}
              onSelect={setPendingStop}
              placeholder="Buscar parada"
              compact
              icon={<Map size={14} />}
              proximity={userLocation}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setShowStopModal(false); setPendingStop(null); }}
                className="flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[15px] font-medium text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmStop}
                disabled={!pendingStop}
                className="flex h-12 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── REVIEW MODAL ── */}
      {reviewTarget ? (
        <div className="fixed inset-0 z-[84] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-md rounded-[26px] border border-white/15 bg-[rgba(11,17,25,0.98)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[18px] font-semibold text-white">Avaliar parada</p>
                <p className="mt-0.5 text-[14px] text-white/60">{reviewTarget.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70"
                aria-label="Fechar avaliação"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewRating(rating)}
                  className={`h-11 flex-1 rounded-full border text-[15px] font-bold transition ${
                    reviewRating >= rating ? "border-accent bg-accent text-white" : "border-white/20 bg-white/10 text-white/60"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Comentário opcional"
              className="mt-3 min-h-24 w-full rounded-[18px] border border-white/20 bg-white/10 px-3 py-3 text-[16px] text-white outline-none placeholder:text-white/35 focus:border-accent/70"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => {
                const selected = reviewTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setReviewTags((c) => selected ? c.filter((t) => t !== tag) : [...c, tag])}
                    className={`rounded-full border px-3 py-2 text-[13px] transition ${
                      selected ? "border-accent bg-accent/15 text-accentSoft" : "border-white/20 text-white/60"
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
                className="flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[15px] font-medium text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={savePlaceRating}
                className="flex h-12 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white"
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
