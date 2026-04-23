"use client";

import { useEffect, useRef, useState } from "react";

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

export function RouteMapCard({
  preview,
  hasRoutePoints,
  waypoints
}: {
  preview: RoutePreview | null;
  hasRoutePoints: boolean;
  waypoints: Waypoint[];
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const configRef = useRef<GoogleMapsConfig | null>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const currentLocationMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

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
        top: 320,
        right: 32,
        bottom: preview ? 320 : 200,
        left: 32
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
    <div className="relative h-full w-full overflow-hidden bg-[#e8e8e8]">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
    </div>
  );
}
