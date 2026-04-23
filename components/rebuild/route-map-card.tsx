"use client";

import { Clock3, Milestone, Radar } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { RoutePreview } from "@/lib/rebuild/types";

declare global {
  interface Window {
    google?: any;
  }
}

type WaypointKind = "origin" | "stop" | "destination";

type Waypoint = {
  lat: number;
  lng: number;
  kind: WaypointKind;
};

type GoogleMapsConfig = {
  apiKey: string | null;
  mapId: string | null;
};

const DEFAULT_CENTER = { lat: -25.4284, lng: -49.2733 };

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0a0f1a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060c18" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2540" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d1a30" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8fa3bf" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f1a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#253451" }] }
];

function markerColor(kind: WaypointKind): string {
  if (kind === "origin") return "#4ade80";
  if (kind === "destination") return "#fb7185";
  return "#fbbf24";
}

function createMarkerElement(kind: WaypointKind): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${markerColor(kind)};border:2px solid white;box-shadow:0 8px 20px rgba(0,0,0,0.35)`;
  return el;
}

function createCurrentLocationElement(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(47,128,237,0.22)";
  const dot = document.createElement("div");
  dot.style.cssText =
    "width:10px;height:10px;border-radius:50%;background:#2f80ed;border:1px solid rgba(255,255,255,0.9)";
  wrapper.appendChild(dot);
  return wrapper;
}

async function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps?.Map) return;

  return new Promise((resolve, reject) => {
    const cbName = `__gmcb_${Date.now()}`;
    (window as any)[cbName] = () => {
      delete (window as any)[cbName];
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=${cbName}&v=weekly`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
}

function removeMarker(marker: any) {
  if (typeof marker?.setMap === "function") {
    marker.setMap(null);
  } else if (marker && "map" in marker) {
    marker.map = null;
  }
}

function formatDuration(durationMinutes: number | null) {
  if (!durationMinutes || durationMinutes <= 0) return "—";
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function RouteMapCard({
  preview,
  hasRoutePoints,
  waypoints,
  children
}: {
  preview: RoutePreview | null;
  hasRoutePoints: boolean;
  waypoints: Waypoint[];
  children?: React.ReactNode;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const configRef = useRef<GoogleMapsConfig | null>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const currentLocationMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const stats = useMemo(
    () =>
      preview
        ? [
            {
              label: "Distância",
              value: preview.distanceKm ? `${preview.distanceKm} km` : "—",
              icon: Milestone
            },
            {
              label: "Tempo",
              value: formatDuration(preview.durationMinutes),
              icon: Clock3
            }
          ]
        : [],
    [preview]
  );

  const routeBadge = preview
    ? preview.provider === "mapbox"
      ? "Trajeto por estrada"
      : preview.provider === "osrm"
        ? "Trajeto viário"
        : "Modo básico"
    : null;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapContainerRef.current) return;

      const res = await fetch("/api/google-maps-config");
      const config = (await res.json()) as GoogleMapsConfig;
      configRef.current = config;

      if (cancelled || !mapContainerRef.current || !config.apiKey) return;

      await loadGoogleMapsScript(config.apiKey);

      if (cancelled || !mapContainerRef.current) return;

      const gm = window.google.maps;

      const mapOptions: Record<string, unknown> = {
        center: DEFAULT_CENTER,
        zoom: 6,
        disableDefaultUI: true,
        clickableIcons: false
      };

      if (config.mapId) {
        mapOptions.mapId = config.mapId;
      } else {
        mapOptions.styles = DARK_MAP_STYLES;
      }

      const map = new gm.Map(mapContainerRef.current, mapOptions);
      mapRef.current = map;

      if (!hasRoutePoints && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (cancelled || hasRoutePoints) return;
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            map.panTo(pos);
            map.setZoom(12);

            const useAdvanced = config.mapId && gm.marker?.AdvancedMarkerElement;
            if (useAdvanced) {
              currentLocationMarkerRef.current = new gm.marker.AdvancedMarkerElement({
                position: pos,
                map,
                content: createCurrentLocationElement()
              });
            } else {
              currentLocationMarkerRef.current = new gm.Marker({
                position: pos,
                map,
                icon: {
                  path: gm.SymbolPath.CIRCLE,
                  scale: 5,
                  fillColor: "#2f80ed",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 1.5
                }
              });
            }
          },
          () => undefined,
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      if (!cancelled) {
        setMapReady(true);
      }
    }

    init().catch(() => undefined);

    return () => {
      cancelled = true;
      setMapReady(false);
      markersRef.current.forEach(removeMarker);
      markersRef.current = [];
      polylinesRef.current.forEach((p) => p.setMap?.(null));
      polylinesRef.current = [];
      removeMarker(currentLocationMarkerRef.current);
      currentLocationMarkerRef.current = null;
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const gm = window.google?.maps;
    if (!gm) return;

    markersRef.current.forEach(removeMarker);
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap?.(null));
    polylinesRef.current = [];

    const config = configRef.current;
    const useAdvanced = config?.mapId && gm.marker?.AdvancedMarkerElement;

    waypoints.forEach((point) => {
      let marker: any;
      if (useAdvanced) {
        marker = new gm.marker.AdvancedMarkerElement({
          position: { lat: point.lat, lng: point.lng },
          map,
          content: createMarkerElement(point.kind)
        });
      } else {
        marker = new gm.Marker({
          position: { lat: point.lat, lng: point.lng },
          map,
          icon: {
            path: gm.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: markerColor(point.kind),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
          }
        });
      }
      markersRef.current.push(marker);
    });

    if (preview?.geometry?.length) {
      const path = preview.geometry.map((p) => ({ lat: p.lat, lng: p.lng }));

      const glow = new gm.Polyline({
        path,
        geodesic: true,
        strokeColor: "#93c5fd",
        strokeOpacity: 0.18,
        strokeWeight: 10,
        map
      });

      const line = new gm.Polyline({
        path,
        geodesic: true,
        strokeColor: "#2f80ed",
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map
      });

      polylinesRef.current.push(glow, line);
    }

    const pointsToFit = preview?.geometry?.length ? preview.geometry : waypoints;

    if (pointsToFit.length > 1) {
      const bounds = new gm.LatLngBounds();
      pointsToFit.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, {
        top: 120,
        right: 28,
        bottom: preview ? 120 : 40,
        left: 28
      });
    } else if (pointsToFit.length === 1) {
      map.panTo({ lat: pointsToFit[0].lat, lng: pointsToFit[0].lng });
      map.setZoom(12);
    } else if (!hasRoutePoints) {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(6);
    }
  }, [hasRoutePoints, mapReady, preview, waypoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !navigator.geolocation || hasRoutePoints) return;

    const gm = window.google?.maps;
    if (!gm) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (hasRoutePoints) return;

        const config = configRef.current;
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };

        removeMarker(currentLocationMarkerRef.current);
        currentLocationMarkerRef.current = null;

        const useAdvanced = config?.mapId && gm.marker?.AdvancedMarkerElement;
        if (useAdvanced) {
          currentLocationMarkerRef.current = new gm.marker.AdvancedMarkerElement({
            position: pos,
            map,
            content: createCurrentLocationElement()
          });
        } else {
          currentLocationMarkerRef.current = new gm.Marker({
            position: pos,
            map,
            icon: {
              path: gm.SymbolPath.CIRCLE,
              scale: 5,
              fillColor: "#2f80ed",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1.5
            }
          });
        }

        map.panTo(pos);
        map.setZoom(12);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [hasRoutePoints, mapReady]);

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(11,18,27,0.9)_0%,rgba(8,13,20,0.96)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <div className="relative min-h-[32rem] overflow-hidden rounded-[30px] bg-background md:min-h-[38rem]">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(7,12,18,0.1)_0%,rgba(7,12,18,0.02)_36%,rgba(7,12,18,0.26)_100%)]" />

        {children ? (
          <div className="pointer-events-none absolute inset-x-2 top-2 z-30 md:left-4 md:right-auto md:top-4 md:w-[26rem]">
            {children}
          </div>
        ) : null}

        {preview ? (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 rounded-[22px] border border-white/10 bg-[rgba(9,14,22,0.58)] p-3 backdrop-blur-md md:left-auto md:right-4 md:w-[24rem]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{routeBadge}</p>
              {preview.live ? <Radar size={14} className="text-accentSoft" /> : null}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.label} className="rounded-[16px] bg-[rgba(255,255,255,0.08)] px-3 py-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                      <Icon size={13} />
                      <span>{stat.label}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-text">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
