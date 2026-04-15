"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";

import { LocationSearchField } from "@/components/rebuild/location-search-field";
import { RouteMapCard } from "@/components/rebuild/route-map-card";
import { RoutePayload, RoutePreview, RouteRecord, RouteStopInput, SearchSuggestion, StopType } from "@/lib/rebuild/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

const STOP_TYPES: Array<{ value: StopType; label: string }> = [
  { value: "fuel", label: "Combustível" },
  { value: "food", label: "Comida" },
  { value: "rest", label: "Descanso" },
  { value: "viewpoint", label: "Mirante" },
  { value: "lodging", label: "Hospedagem" },
  { value: "custom", label: "Outro" }
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busyPreview, setBusyPreview] = useState(false);
  const [busySave, setBusySave] = useState(false);

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
  const canSave = Boolean(user && origin && destination);

  const payload = useMemo<RoutePayload | null>(() => {
    if (!origin || !destination) {
      return null;
    }

    return {
      origin: {
        name: origin.fullAddress,
        lat: origin.lat,
        lng: origin.lng
      },
      destination: {
        name: destination.fullAddress,
        lat: destination.lat,
        lng: destination.lng
      },
      distanceKm: preview?.distanceKm ?? null,
      durationMinutes: preview?.durationMinutes ?? null,
      stops: stops
        .map((stop, index) =>
          stop.suggestion
            ? suggestionToStop(stop.suggestion, index, stop.id ? { ...suggestionToStop(stop.suggestion, index), id: stop.id, type: stop.type } : undefined)
            : null
        )
        .filter((stop): stop is RouteStopInput => Boolean(stop))
        .map((stop, index) => ({
          ...stop,
          orderIndex: index,
          type: stops[index]?.type ?? stop.type
        }))
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
      router.push("/login");
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

  return (
    <div className="space-y-4">
      <RouteMapCard preview={preview} />

      <section className="rounded-[20px] border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-accentSoft">Core</p>
            <h1 className="mt-2 text-xl font-semibold text-text">Planejar rota</h1>
          </div>
          {loading ? null : user ? (
            <span className="rounded-[10px] border border-border px-3 py-2 text-xs text-muted">
              {routeId ? "Editando rota" : "Salvando como autenticado"}
            </span>
          ) : (
            <Link href="/login" className="rounded-[10px] border border-border px-3 py-2 text-xs text-muted">
              entrar para salvar
            </Link>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <LocationSearchField
            label="Origem"
            value={origin}
            onSelect={setOrigin}
            placeholder="Digite a origem"
          />

          <LocationSearchField
            label="Destino"
            value={destination}
            onSelect={setDestination}
            placeholder="Digite o destino"
          />

          <div className="space-y-3 rounded-[16px] border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Paradas</p>
                <p className="mt-1 text-sm text-text">Adicione somente o que fizer sentido na rota.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setStops((current) => [...current, { suggestion: null, type: "rest" }])
                }
                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-border px-3 text-sm text-text"
              >
                <Plus size={14} />
                adicionar
              </button>
            </div>

            {stops.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma parada adicionada ainda.</p>
            ) : (
              <div className="space-y-3">
                {stops.map((stop, index) => (
                  <div key={`${stop.id ?? "new"}-${index}`} className="space-y-2 rounded-[14px] border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        Parada {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStops((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-border text-muted"
                        aria-label="Remover parada"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <LocationSearchField
                      label="Local"
                      value={stop.suggestion}
                      onSelect={(value) =>
                        setStops((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, suggestion: value } : item
                          )
                        )
                      }
                      placeholder="Digite a parada"
                    />

                    <label className="block space-y-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Tipo</span>
                      <select
                        value={stop.type}
                        onChange={(event) =>
                          setStops((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, type: event.target.value as StopType } : item
                            )
                          )
                        }
                        className="h-10 w-full rounded-[12px] border border-border bg-background px-3 text-sm text-text outline-none transition focus:border-accent"
                      >
                        {STOP_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {feedback ? <p className="text-sm text-muted">{feedback}</p> : null}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={calculateRoute}
              disabled={!canCalculate || busyPreview}
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-border bg-background px-4 text-sm font-medium text-text disabled:opacity-50"
            >
              {busyPreview ? "Calculando..." : "Ver rota"}
            </button>

            <button
              type="button"
              onClick={saveRoute}
              disabled={!canSave || busySave}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-accent px-4 text-sm font-semibold text-background disabled:opacity-50"
            >
              <Save size={14} />
              {busySave ? "Salvando..." : "Salvar rota"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
