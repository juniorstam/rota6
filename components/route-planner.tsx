"use client";

import { FormEvent, useState } from "react";
import { Bookmark, LocateFixed, Plus, Route, Save, Search, Trash2, X } from "lucide-react";

import { MapView } from "@/components/map-view";
import { PlaceAutocompleteInput } from "@/components/place-autocomplete-input";
import {
  deleteSavedRoute,
  readSavedRoutes,
  SAVED_ROUTES_EVENT,
  SavedRouteRecord,
  upsertSavedRoute
} from "@/lib/saved-routes";
import { mapService } from "@/lib/services/map-service";
import { RouteResult } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, useMemo } from "react";

export function RoutePlanner({
  initialRoute,
  initialOrigin,
  initialDestination,
  initialStops
}: {
  initialRoute: RouteResult;
  initialOrigin?: string;
  initialDestination?: string;
  initialStops?: string[];
}) {
  const { user } = useAuth();
  const [origin, setOrigin] = useState(initialOrigin ?? "Curitiba, PR");
  const [destination, setDestination] = useState(initialDestination ?? "Pontal do Paraná, PR");
  const [stops, setStops] = useState(initialStops?.length ? initialStops : ["Morretes, PR"]);
  const [route, setRoute] = useState<RouteResult>(initialRoute);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteRecord[]>([]);

  useEffect(() => {
    const sync = () => setSavedRoutes(readSavedRoutes());
    sync();

    window.addEventListener(SAVED_ROUTES_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(SAVED_ROUTES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const result = await mapService.getRoute({
        origin,
        destination,
        stops: stops.filter(Boolean)
      });
      setRoute(result);
      if (!result.usingLiveRouting) {
        setFeedback("Mapa e rota estão em modo demo. Assim que o token do Mapbox entrar, este fluxo passa a usar endereços e rota reais.");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível calcular a rota agora.");
    } finally {
      setLoading(false);
    }
  }

  async function fillCurrentLocation() {
    if (!navigator.geolocation) {
      setFeedback("Seu navegador não oferece geolocalização.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const label = await mapService.reverseGeocode({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setOrigin(label);
        } catch {
          setOrigin(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setFeedback("Não consegui obter sua posição. Verifique a permissão do navegador.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  function saveCurrentRoute() {
    const trimmedOrigin = origin.trim();
    const trimmedDestination = destination.trim();

    if (!trimmedOrigin || !trimmedDestination) {
      setFeedback("Preencha origem e destino antes de salvar a rota.");
      return;
    }

    const cleanStops = stops.map((stop) => stop.trim()).filter(Boolean);
    const title = `${trimmedOrigin} -> ${trimmedDestination}`;

    upsertSavedRoute({
      id: crypto.randomUUID(),
      ownerId: user?.id ?? "local-user",
      title,
      origin: trimmedOrigin,
      destination: trimmedDestination,
      stops: cleanStops,
      route,
      updatedAt: new Date().toISOString()
    });

    setFeedback("Rota salva no navegador. Ela fica disponível na lista “Minhas rotas salvas”.");
  }

  function openSavedRoute(savedRoute: SavedRouteRecord) {
    setOrigin(savedRoute.origin);
    setDestination(savedRoute.destination);
    setStops(savedRoute.stops.length ? savedRoute.stops : [""]);
    setRoute(savedRoute.route);
    setFeedback(`Rota "${savedRoute.title}" carregada para continuar o planejamento.`);
  }

  const ownSavedRoutes = useMemo(
    () => savedRoutes.filter((entry) => entry.ownerId === (user?.id ?? "local-user")),
    [savedRoutes, user?.id]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Planejador</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Desenhe o caminho com apoio real de estrada</h2>
            <p className="mt-2 text-sm text-muted">
              O motor da Rota 6 separa a regra de negócio do provedor de mapas para evoluir a plataforma sem travar o produto.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted"
            onClick={fillCurrentLocation}
          >
            <LocateFixed size={16} />
            usar minha posição
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PlaceAutocompleteInput
            label="Origem"
            value={origin}
            onChange={setOrigin}
            placeholder="Ex.: Curitiba, PR ou minha posição atual"
          />

          <PlaceAutocompleteInput
            label="Destino"
            value={destination}
            onChange={setDestination}
            placeholder="Ex.: Serra do Rio do Rastro, SC"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Paradas intermediárias</span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-text"
                onClick={() => setStops((current) => [...current, ""])}
              >
                <Plus size={16} />
                adicionar
              </button>
            </div>

            {stops.map((stop, index) => (
              <div key={`${index}-${stop}`} className="flex items-center gap-2">
                <div className="flex-1">
                  <PlaceAutocompleteInput
                    label={index === 0 ? "Parada" : `Parada ${index + 1}`}
                    value={stop}
                    onChange={(value) =>
                      setStops((current) =>
                        current.map((entry, stopIndex) => (stopIndex === index ? value : entry))
                      )
                    }
                    placeholder="Ex.: Morretes, PR"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStops((current) => current.filter((_, stopIndex) => stopIndex !== index))}
                  className="mt-7 inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-border bg-background text-muted"
                  aria-label="Remover parada"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "Serra do Rio do Rastro",
                origin: "Florianópolis, SC",
                destination: "Bom Jardim da Serra, SC",
                stops: ["Tubarão, SC", "Orleans, SC"]
              },
              {
                label: "Serra da Graciosa",
                origin: "Curitiba, PR",
                destination: "Morretes, PR",
                stops: ["Quatro Barras, PR"]
              }
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setOrigin(preset.origin);
                  setDestination(preset.destination);
                  setStops(preset.stops);
                }}
                className="rounded-full border border-border bg-background/70 px-4 py-2 text-xs text-muted transition hover:border-accent hover:text-text"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-accent px-5 text-sm font-semibold text-background"
          >
            {loading ? <Search size={18} className="animate-pulse" /> : <Route size={18} />}
            {loading ? "Lendo a estrada..." : "Traçar caminho"}
          </button>

          <button
            type="button"
            onClick={saveCurrentRoute}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border border-border bg-background px-5 text-sm font-semibold text-text"
          >
            <Save size={18} />
            Salvar rota
          </button>
        </form>

        {feedback ? (
          <div className="mt-4 rounded-[20px] border border-border bg-background/60 p-4 text-sm text-muted">
            {feedback}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Distância</p>
            <p className="mt-2 text-xl font-semibold text-text">{formatDistance(route.distanceKm)}</p>
          </div>
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Duração estimada</p>
            <p className="mt-2 text-xl font-semibold text-text">{formatDuration(route.durationHours)}</p>
          </div>
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Pontos sugeridos</p>
            <p className="mt-2 text-xl font-semibold text-text">{route.suggestedPlaces.length}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-border bg-background/60 p-4">
          <p className="text-sm text-muted">{route.summary}</p>
        </div>

        <section className="mt-6 rounded-[24px] border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">Minhas rotas salvas</p>
              <p className="mt-1 text-sm text-muted">
                Cada conta guarda sua própria lista local para retomar o planejamento depois.
              </p>
            </div>
            <span className="rounded-full border border-border px-3 py-2 text-xs text-muted">
              {ownSavedRoutes.length} salvas
            </span>
          </div>

          {ownSavedRoutes.length ? (
            <div className="mt-4 space-y-3">
              {ownSavedRoutes.map((savedRoute) => (
                <div
                  key={savedRoute.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-surface p-4"
                >
                  <div>
                    <p className="font-medium text-text">{savedRoute.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {savedRoute.stops.length
                        ? `${savedRoute.stops.length} parada(s) intermediaria(s)`
                        : "Sem paradas intermediarias"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openSavedRoute(savedRoute)}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text"
                    >
                      <Bookmark size={16} />
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedRoute(savedRoute.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[20px] border border-dashed border-border bg-surface p-4 text-sm text-muted">
              Nenhuma rota salva ainda. Trace um caminho e use o botão “Salvar rota”.
            </div>
          )}
        </section>
      </section>

      <div className="space-y-6">
        <MapView
          polyline={route.polyline}
          mapImageUrl={route.mapImageUrl}
          live={Boolean(route.usingLiveRouting)}
        />

        <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Ao longo da rota</p>
            <h3 className="mt-2 text-xl font-semibold text-text">Pontos que fazem sentido para essa tocada</h3>
          </div>

          <div className="space-y-3">
            {route.suggestedPlaces.map((place) => (
              <article key={place.id} className="rounded-[22px] border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-accentSoft">{place.category}</p>
                    <h4 className="mt-1 font-medium text-text">{place.name}</h4>
                    <p className="mt-2 text-sm text-muted">{place.reason}</p>
                  </div>
                  <span className="rounded-full bg-surfaceAlt px-3 py-1 text-xs text-muted">
                    {place.distanceFromRouteKm.toFixed(1)} km da rota
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
