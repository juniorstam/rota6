import { SearchSuggestion, RoutePayload, RoutePreview } from "@/lib/rebuild/types";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_STYLE_ID = process.env.MAPBOX_STYLE_ID ?? "dark-v11";
const MAPBOX_STYLE_OWNER = process.env.MAPBOX_STYLE_OWNER ?? "mapbox";

interface GeocodeFeature {
  properties?: {
    name?: string;
    full_address?: string;
    place_formatted?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface GeocodeResponse {
  features?: GeocodeFeature[];
}

interface DirectionsResponse {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates: [number, number][];
    };
  }>;
}

function hasMapboxToken() {
  return Boolean(MAPBOX_TOKEN);
}

async function mapboxFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Mapbox request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
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

function encodePolyline(points: Array<{ lat: number; lng: number }>) {
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

function getStaticMapUrl(polyline: Array<{ lat: number; lng: number }>) {
  if (!hasMapboxToken() || polyline.length === 0) {
    return null;
  }

  const encodedPolyline = encodeURIComponent(encodePolyline(polyline));
  const overlay = `path-4+2F80ED-0.85(${encodedPolyline})`;

  return `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_OWNER}/${MAPBOX_STYLE_ID}/static/${overlay}/auto/960x1440?padding=40&logo=false&access_token=${MAPBOX_TOKEN}`;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function buildFallbackPreview(payload: RoutePayload): RoutePreview {
  const points = [payload.origin, ...payload.stops, payload.destination].map((point) => ({
    lat: point.lat,
    lng: point.lng
  }));

  let distanceKm = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    distanceKm += haversineKm(points[index], points[index + 1]);
  }

  const durationMinutes = Math.round(distanceKm * 1.35);

  return {
    geometry: points,
    distanceKm: Number(distanceKm.toFixed(1)),
    durationMinutes,
    staticMapUrl: null,
    live: false
  };
}

export async function searchLocations(query: string): Promise<SearchSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  if (!hasMapboxToken()) {
    return [];
  }

  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
    trimmed
  )}&language=pt-BR&country=BR&limit=5&access_token=${MAPBOX_TOKEN}`;
  const response = await mapboxFetch<GeocodeResponse>(url);

  return (response.features ?? [])
    .map((feature, index) => {
      const lat = feature.coordinates?.latitude;
      const lng = feature.coordinates?.longitude;
      if (lat === undefined || lng === undefined) {
        return null;
      }

      const name = feature.properties?.name ?? feature.properties?.full_address ?? "Local";
      const fullAddress =
        feature.properties?.full_address ?? feature.properties?.place_formatted ?? name;

      return {
        id: `search-${index}-${fullAddress}`,
        name,
        fullAddress,
        lat,
        lng
      } satisfies SearchSuggestion;
    })
    .filter((entry): entry is SearchSuggestion => Boolean(entry));
}

export async function buildRoutePreview(payload: RoutePayload): Promise<RoutePreview> {
  if (!hasMapboxToken()) {
    return buildFallbackPreview(payload);
  }

  const points = [payload.origin, ...payload.stops, payload.destination];
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false&language=pt-BR&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await mapboxFetch<DirectionsResponse>(url);
    const route = response.routes?.[0];

    if (!route?.geometry?.coordinates?.length) {
      return buildFallbackPreview(payload);
    }

    const geometry = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

    return {
      geometry,
      distanceKm: Number((route.distance / 1000).toFixed(1)),
      durationMinutes: Math.round(route.duration / 60),
      staticMapUrl: getStaticMapUrl(geometry),
      live: true
    };
  } catch {
    return buildFallbackPreview(payload);
  }
}
