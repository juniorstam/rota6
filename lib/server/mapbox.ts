import { places } from "@/lib/mock-data";
import { Place, PlaceSearchResult, RouteRequest, RouteResult, RouteSuggestion } from "@/lib/types";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const MAPBOX_STYLE_ID = process.env.MAPBOX_STYLE_ID ?? "dark-v11";
const MAPBOX_STYLE_OWNER = process.env.MAPBOX_STYLE_OWNER ?? "mapbox";

interface MapboxFeature {
  properties?: {
    feature_name?: string;
    full_address?: string;
    name?: string;
    place_formatted?: string;
  };
  coordinates?: {
    longitude: number;
    latitude: number;
  };
}

interface RouteWaypoint {
  location: [number, number];
  name?: string;
}

interface MapboxDirectionsRoute {
  distance: number;
  duration: number;
  geometry?: {
    coordinates: [number, number][];
  };
}

interface MapboxDirectionsResponse {
  routes?: MapboxDirectionsRoute[];
  waypoints?: RouteWaypoint[];
}

interface NominatimReverseFeature {
  display_name?: string;
}

function hasMapboxToken() {
  return Boolean(MAPBOX_TOKEN);
}

async function mapboxFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    throw new Error(`Mapbox request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function nominatimFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      "User-Agent": "Rota6/1.0 (reverse geocoding fallback)"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalizeFeature(feature: MapboxFeature, id: string): PlaceSearchResult {
  const name = feature.properties?.feature_name ?? feature.properties?.name ?? "Local";
  const fullAddress =
    feature.properties?.full_address ?? feature.properties?.place_formatted ?? name;

  const cityState = fullAddress.split(",").map((part) => part.trim());
  const city = cityState.length > 1 ? cityState[cityState.length - 2] : undefined;
  const state = cityState.length > 0 ? cityState[cityState.length - 1] : undefined;

  return {
    id,
    name,
    city,
    state,
    fullAddress,
    coordinates:
      feature.coordinates?.latitude !== undefined && feature.coordinates?.longitude !== undefined
        ? {
            lat: feature.coordinates.latitude,
            lng: feature.coordinates.longitude
          }
        : undefined
  };
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function pointToSegmentDistanceKm(
  point: { lat: number; lng: number },
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
) {
  const x = point.lng;
  const y = point.lat;
  const x1 = start.lng;
  const y1 = start.lat;
  const x2 = end.lng;
  const y2 = end.lat;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return haversineDistanceKm(point, start);
  }

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  const projection = {
    lng: x1 + t * dx,
    lat: y1 + t * dy
  };

  return haversineDistanceKm(point, projection);
}

export function getStaticMapUrl(polyline: Array<{ lat: number; lng: number }>) {
  if (!hasMapboxToken() || polyline.length === 0) {
    return null;
  }

  const encodedPolyline = encodeURIComponent(encodePolyline(polyline));
  const overlay = `path-5+f59e0b-0.88(${encodedPolyline})`;

  return `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_OWNER}/${MAPBOX_STYLE_ID}/static/${overlay}/auto/1200x720?padding=48&logo=false&access_token=${MAPBOX_TOKEN}`;
}

function encodeSignedNumber(num: number) {
  let shifted = num << 1;
  if (num < 0) {
    shifted = ~shifted;
  }

  let output = "";
  while (shifted >= 0x20) {
    output += String.fromCharCode((0x20 | (shifted & 0x1f)) + 63);
    shifted >>= 5;
  }
  output += String.fromCharCode(shifted + 63);
  return output;
}

export function encodePolyline(points: Array<{ lat: number; lng: number }>) {
  let previousLat = 0;
  let previousLng = 0;
  let result = "";

  points.forEach((point) => {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);

    result += encodeSignedNumber(lat - previousLat);
    result += encodeSignedNumber(lng - previousLng);

    previousLat = lat;
    previousLng = lng;
  });

  return result;
}

function buildFallbackSuggestions() {
  return places.slice(0, 4).map((place, index) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceFromRouteKm: Number((index * 4.7 + 1.2).toFixed(1)),
    reason:
      place.category === "posto"
        ? "Ponto útil para abastecer e reorganizar a tocada."
        : place.category === "oficina"
          ? "Pode salvar a viagem em caso de imprevisto."
          : "Parada coerente com o contexto do roteiro."
  })) satisfies RouteSuggestion[];
}

export function getPlacesNearRoute(polyline: Array<{ lat: number; lng: number }>): RouteSuggestion[] {
  if (polyline.length < 2) {
    return buildFallbackSuggestions();
  }

  return places
    .map((place) => {
      let minDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < polyline.length - 1; index += 1) {
        minDistance = Math.min(
          minDistance,
          pointToSegmentDistanceKm(place.coordinates, polyline[index], polyline[index + 1])
        );
      }
      return { place, minDistance };
    })
    .filter(({ minDistance }) => minDistance < 40)
    .sort((a, b) => a.minDistance - b.minDistance)
    .slice(0, 4)
    .map(({ place, minDistance }) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      distanceFromRouteKm: Number(minDistance.toFixed(1)),
      reason:
        place.category === "posto"
          ? "Bom apoio para abastecer e seguir viagem."
          : place.category === "oficina"
            ? "Pode ajudar rápido se surgir imprevisto mecânico."
            : place.category === "pousada"
              ? "Faz sentido para descanso ou pernoite no trajeto."
              : "Vale a parada pelo contexto da estrada."
    }));
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return [];
  }

  if (!hasMapboxToken()) {
    return places
      .filter((place) =>
        [place.name, place.address, place.city, place.state, ...place.tags].some((entry) =>
          entry.toLowerCase().includes(normalized.toLowerCase())
        )
      )
      .slice(0, 5)
      .map((place) => ({
        id: place.id,
        name: place.name,
        city: place.city,
        state: place.state,
        fullAddress: `${place.name}, ${place.address}, ${place.city} - ${place.state}`,
        coordinates: place.coordinates
      }));
  }

  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
    normalized
  )}&language=pt-BR&country=BR&limit=5&access_token=${MAPBOX_TOKEN}`;

  const response = await mapboxFetch<{ features?: MapboxFeature[] }>(url);

  return (response.features ?? []).map((feature, index) => normalizeFeature(feature, `mbx-${index}`));
}

export async function reverseGeocode(latitude: number, longitude: number) {
  if (!hasMapboxToken()) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const response = await nominatimFetch<NominatimReverseFeature>(url);
      return response.display_name ?? `Minha posição (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    } catch {
      return `Minha posição (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    }
  }

  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&language=pt-BR&access_token=${MAPBOX_TOKEN}`;
  const response = await mapboxFetch<{ features?: MapboxFeature[] }>(url);
  const first = response.features?.[0];

  return first ? normalizeFeature(first, "current-location").fullAddress : "Minha posição atual";
}

async function resolveRoutePoint(query: string): Promise<PlaceSearchResult> {
  const results = await searchPlaces(query);
  const match = results[0];

  if (!match?.coordinates) {
    throw new Error(`Não foi possível localizar "${query}"`);
  }

  return match;
}

export async function getLiveRoute(input: RouteRequest): Promise<RouteResult> {
  const [origin, destination, ...intermediate] = await Promise.all([
    resolveRoutePoint(input.origin),
    resolveRoutePoint(input.destination),
    ...input.stops.filter(Boolean).map((stop) => resolveRoutePoint(stop))
  ]);

  if (!hasMapboxToken()) {
    throw new Error("MAPBOX_ACCESS_TOKEN não configurado.");
  }

  const coordinates = [origin, ...intermediate, destination]
    .map((point) => `${point.coordinates!.lng},${point.coordinates!.lat}`)
    .join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=true&language=pt-BR&access_token=${MAPBOX_TOKEN}`;
  const response = await mapboxFetch<MapboxDirectionsResponse>(url);
  const selectedRoute = response.routes?.[0];

  if (!selectedRoute?.geometry?.coordinates?.length) {
    throw new Error("A rota não pôde ser calculada.");
  }

  const polyline = selectedRoute.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  const suggestedPlaces = getPlacesNearRoute(polyline);

  return {
    polyline,
    distanceKm: Number((selectedRoute.distance / 1000).toFixed(1)),
    durationHours: Number((selectedRoute.duration / 3600).toFixed(1)),
    summary:
      suggestedPlaces.length > 0
        ? "Rota calculada com dados reais e cruzada com pontos úteis já mapeados na Rota 6."
        : "Rota calculada com dados reais. Ainda não há pontos relevantes mapeados nesse trecho.",
    suggestedPlaces,
    origin,
    destination,
    stops: intermediate,
    usingLiveRouting: true,
    mapImageUrl: getStaticMapUrl(polyline)
  };
}

export function getFallbackRoute(input: RouteRequest): RouteResult {
  const stopFactor = Math.max(input.stops.filter(Boolean).length, 0);
  return {
    polyline: [
      { lat: -25.4284, lng: -49.2733 },
      { lat: -25.5701, lng: -48.8113 },
      { lat: -25.5484, lng: -48.5588 }
    ],
    distanceKm: 148 + stopFactor * 37,
    durationHours: 4.2 + stopFactor * 0.6,
    summary:
      stopFactor > 0
        ? `Modo demo ativo. Rota com ${stopFactor} parada(s) intermediária(s) para demonstrar o fluxo até o Mapbox ser configurado.`
        : "Modo demo ativo. Configure o token do Mapbox para usar geocoding e rota real.",
    suggestedPlaces: buildFallbackSuggestions(),
    usingLiveRouting: false,
    mapImageUrl: null
  };
}

function defaultPolyline() {
  return [
    { lat: -25.4284, lng: -49.2733 },
    { lat: -25.5701, lng: -48.8113 },
    { lat: -25.5484, lng: -48.5588 }
  ];
}

export function getPlacesAlongRoute(route: RouteResult): Place[] {
  const suggestions = route.suggestedPlaces.map((suggestion) => suggestion.id);
  return places.filter((place) => suggestions.includes(place.id));
}

export function isMapboxConfigured() {
  return hasMapboxToken();
}
