import { SearchAutocompleteSuggestion, SearchSuggestion, RoutePayload, RoutePreview } from "@/lib/rebuild/types";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const MAPBOX_STYLE_ID = process.env.MAPBOX_STYLE_ID ?? "dark-v11";
const MAPBOX_STYLE_OWNER = process.env.MAPBOX_STYLE_OWNER ?? "mapbox";

const SEEDED_LOCATIONS: SearchSuggestion[] = [
  {
    id: "seed-curitiba",
    name: "Curitiba",
    fullAddress: "Curitiba, Paraná, Brasil",
    lat: -25.4295963,
    lng: -49.2712724
  },
  {
    id: "seed-morretes",
    name: "Morretes",
    fullAddress: "Morretes, Paraná, Brasil",
    lat: -25.4761,
    lng: -48.8343
  },
  {
    id: "seed-florianopolis",
    name: "Florianópolis",
    fullAddress: "Florianópolis, Santa Catarina, Brasil",
    lat: -27.5949,
    lng: -48.5482
  },
  {
    id: "seed-bom-jardim",
    name: "Bom Jardim da Serra",
    fullAddress: "Bom Jardim da Serra, Santa Catarina, Brasil",
    lat: -28.3378,
    lng: -49.6246
  },
  {
    id: "seed-tubarao",
    name: "Tubarão",
    fullAddress: "Tubarão, Santa Catarina, Brasil",
    lat: -28.4667,
    lng: -49.0069
  },
  {
    id: "seed-orleans",
    name: "Orleans",
    fullAddress: "Orleans, Santa Catarina, Brasil",
    lat: -28.3581,
    lng: -49.2916
  },
  {
    id: "seed-quatro-barras",
    name: "Quatro Barras",
    fullAddress: "Quatro Barras, Paraná, Brasil",
    lat: -25.3653,
    lng: -49.0768
  },
  {
    id: "seed-sao-paulo",
    name: "São Paulo",
    fullAddress: "São Paulo, São Paulo, Brasil",
    lat: -23.5506507,
    lng: -46.6333824
  },
  {
    id: "seed-rio",
    name: "Rio de Janeiro",
    fullAddress: "Rio de Janeiro, Rio de Janeiro, Brasil",
    lat: -22.9110137,
    lng: -43.2093727
  },
  {
    id: "seed-juiz-de-fora",
    name: "Juiz de Fora",
    fullAddress: "Juiz de Fora, Minas Gerais, Brasil",
    lat: -21.7609,
    lng: -43.3505
  },
  {
    id: "seed-belo-horizonte",
    name: "Belo Horizonte",
    fullAddress: "Belo Horizonte, Minas Gerais, Brasil",
    lat: -19.9227,
    lng: -43.9451
  },
  {
    id: "seed-praca-liberdade-bh",
    name: "Praça da Liberdade",
    fullAddress: "Praça da Liberdade, Funcionários, Belo Horizonte, Minas Gerais, Brasil",
    lat: -19.9322,
    lng: -43.9378
  },
  {
    id: "seed-palacio-liberdade-bh",
    name: "Palácio da Liberdade",
    fullAddress: "Palácio da Liberdade, Belo Horizonte, Minas Gerais, Brasil",
    lat: -19.9325,
    lng: -43.9373
  },
  {
    id: "seed-ouro-preto",
    name: "Ouro Preto",
    fullAddress: "Ouro Preto, Minas Gerais, Brasil",
    lat: -20.3856,
    lng: -43.5035
  },
  {
    id: "seed-tiradentes",
    name: "Tiradentes",
    fullAddress: "Tiradentes, Minas Gerais, Brasil",
    lat: -21.1102,
    lng: -44.1744
  },
  {
    id: "seed-cabo-frio",
    name: "Cabo Frio",
    fullAddress: "Cabo Frio, Rio de Janeiro, Brasil",
    lat: -22.8794,
    lng: -42.0186
  },
  {
    id: "seed-petropolis",
    name: "Petrópolis",
    fullAddress: "Petrópolis, Rio de Janeiro, Brasil",
    lat: -22.505,
    lng: -43.1785
  },
  {
    id: "seed-niteroi",
    name: "Niterói",
    fullAddress: "Niterói, Rio de Janeiro, Brasil",
    lat: -22.8832,
    lng: -43.1034
  },
  {
    id: "seed-campinas",
    name: "Campinas",
    fullAddress: "Campinas, São Paulo, Brasil",
    lat: -22.9056,
    lng: -47.0608
  },
  {
    id: "seed-ribeirao-preto",
    name: "Ribeirão Preto",
    fullAddress: "Ribeirão Preto, São Paulo, Brasil",
    lat: -21.1775,
    lng: -47.8103
  },
  {
    id: "seed-sorocaba",
    name: "Sorocaba",
    fullAddress: "Sorocaba, São Paulo, Brasil",
    lat: -23.5015,
    lng: -47.4526
  },
  {
    id: "seed-santos",
    name: "Santos",
    fullAddress: "Santos, São Paulo, Brasil",
    lat: -23.9608,
    lng: -46.3336
  },
  {
    id: "seed-brasilia",
    name: "Brasília",
    fullAddress: "Brasília, Distrito Federal, Brasil",
    lat: -15.7939,
    lng: -47.8828
  },
  {
    id: "seed-salvador",
    name: "Salvador",
    fullAddress: "Salvador, Bahia, Brasil",
    lat: -12.9777,
    lng: -38.5016
  },
  {
    id: "seed-vitoria",
    name: "Vitória",
    fullAddress: "Vitória, Espírito Santo, Brasil",
    lat: -20.3194,
    lng: -40.3378
  },
  {
    id: "seed-goiania",
    name: "Goiânia",
    fullAddress: "Goiânia, Goiás, Brasil",
    lat: -16.6869,
    lng: -49.2648
  }
];

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

interface SearchBoxSuggestResponse {
  suggestions?: Array<{
    name?: string;
    name_preferred?: string;
    mapbox_id?: string;
    full_address?: string;
    place_formatted?: string;
  }>;
}

interface SearchBoxRetrieveResponse {
  features?: Array<{
    id?: string;
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      name?: string;
      full_address?: string;
      place_formatted?: string;
      mapbox_id?: string;
    };
  }>;
}

interface NominatimFeature {
  place_id?: number;
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
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

interface OsrmRouteResponse {
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

async function nominatimFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      "User-Agent": "Rota6/1.0 (route planner geocoding fallback)"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function osrmFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`OSRM request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function scoreSuggestion(query: string, suggestion: SearchSuggestion) {
  const normalizedQuery = normalizeSearchText(query);
  const name = normalizeSearchText(suggestion.name);
  const address = normalizeSearchText(suggestion.fullAddress);
  const haystack = `${name} ${address}`;
  const queryParts = normalizedQuery.split(/\s+/).filter(Boolean);

  let score = 0;
  if (name === normalizedQuery) {
    score += 40;
  }

  if (name.startsWith(normalizedQuery)) {
    score += 28;
  }

  if (name.includes(normalizedQuery)) {
    score += 20;
  }

  if (address.includes(normalizedQuery)) {
    score += 8;
  }

  queryParts.forEach((part) => {
    if (name.startsWith(part)) {
      score += 8;
    } else if (name.includes(part)) {
      score += 5;
    } else if (address.includes(part)) {
      score += 1;
    }
  });

  return score;
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

export function getStaticViewportMapUrl(center?: { lat: number; lng: number } | null) {
  if (!hasMapboxToken()) {
    return null;
  }

  if (!center) {
    return `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_OWNER}/${MAPBOX_STYLE_ID}/static/-49.2733,-25.4284,6.2,0/960x1440?padding=0&logo=false&access_token=${MAPBOX_TOKEN}`;
  }

  const marker = `pin-s+2F80ED(${center.lng},${center.lat})`;
  return `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_OWNER}/${MAPBOX_STYLE_ID}/static/${marker}/${center.lng},${center.lat},11.5,0/960x1440?padding=0&logo=false&access_token=${MAPBOX_TOKEN}`;
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
    live: false,
    provider: "fallback"
  };
}

export async function searchLocations(query: string): Promise<SearchSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const seededResults = SEEDED_LOCATIONS.filter((entry) => scoreSuggestion(trimmed, entry) >= 8);

  if (!hasMapboxToken()) {
    const variants = Array.from(
      new Set(
        [
          trimmed,
          normalizeSearchText(trimmed),
          `${trimmed}, Brasil`,
          trimmed.split(",")[0]?.trim() ?? ""
        ].filter((value) => value.length >= 2)
      )
    ).slice(0, 4);

    const batches = await Promise.all(
      variants.map(async (variant) => {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=br&q=${encodeURIComponent(variant)}`;
        return nominatimFetch<NominatimFeature[]>(url).catch(() => []);
      })
    );

    const unique = new Map<string, SearchSuggestion>();

    batches.flat().forEach((feature, index) => {
      const lat = feature.lat ? Number(feature.lat) : NaN;
      const lng = feature.lon ? Number(feature.lon) : NaN;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      const fullAddress = feature.display_name ?? feature.name ?? "Local";
      const name = feature.name ?? fullAddress.split(",")[0] ?? "Local";
      const suggestion = {
        id: `nominatim-${feature.place_id ?? index}-${lat}-${lng}`,
        name,
        fullAddress,
        lat,
        lng
      } satisfies SearchSuggestion;

      if (scoreSuggestion(trimmed, suggestion) >= 5) {
        unique.set(`${lat}:${lng}`, suggestion);
      }
    });

    const merged = [...Array.from(unique.values()), ...seededResults];
    const deduped = new Map<string, SearchSuggestion>();
    merged.forEach((entry) => {
      deduped.set(`${entry.lat}:${entry.lng}`, entry);
    });

    return Array.from(deduped.values())
      .sort((a, b) => scoreSuggestion(trimmed, b) - scoreSuggestion(trimmed, a))
      .slice(0, 6);
  }

  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
    trimmed
  )}&language=pt-BR&country=BR&limit=5&access_token=${MAPBOX_TOKEN}`;
  const response = await mapboxFetch<GeocodeResponse>(url);

  const liveResults = (response.features ?? [])
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

  const merged = [...liveResults, ...seededResults];
  const deduped = new Map<string, SearchSuggestion>();
  merged.forEach((entry) => {
    deduped.set(`${entry.lat}:${entry.lng}`, entry);
  });

  return Array.from(deduped.values())
    .sort((a, b) => scoreSuggestion(trimmed, b) - scoreSuggestion(trimmed, a))
    .slice(0, 6);
}

export async function suggestLocations({
  query,
  sessionToken,
  proximity
}: {
  query: string;
  sessionToken: string;
  proximity?: { lat: number; lng: number } | null;
}): Promise<SearchAutocompleteSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  if (!hasMapboxToken()) {
    return (await searchLocations(trimmed)).map((entry) => ({
      id: entry.id,
      name: entry.name,
      fullAddress: entry.fullAddress,
      lat: entry.lat,
      lng: entry.lng,
      source: "fallback"
    }));
  }

  const params = new URLSearchParams({
    q: trimmed,
    access_token: MAPBOX_TOKEN!,
    session_token: sessionToken,
    language: "pt-BR",
    country: "BR",
    limit: "6"
  });

  if (proximity) {
    params.set("proximity", `${proximity.lng},${proximity.lat}`);
  }

  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;
  const response = await mapboxFetch<SearchBoxSuggestResponse>(url);

  return (response.suggestions ?? [])
    .map<SearchAutocompleteSuggestion | null>((suggestion) => {
      if (!suggestion.mapbox_id || !suggestion.name) {
        return null;
      }

      return {
        id: suggestion.mapbox_id,
        mapboxId: suggestion.mapbox_id,
        name: suggestion.name_preferred ?? suggestion.name,
        fullAddress: suggestion.full_address ?? suggestion.place_formatted ?? suggestion.name,
        source: "mapbox"
      } satisfies SearchAutocompleteSuggestion;
    })
    .filter((entry): entry is SearchAutocompleteSuggestion => entry !== null);
}

export async function retrieveLocation({
  mapboxId,
  sessionToken
}: {
  mapboxId: string;
  sessionToken: string;
}): Promise<SearchSuggestion | null> {
  if (!hasMapboxToken()) {
    return null;
  }

  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN!,
    session_token: sessionToken,
    language: "pt-BR"
  });

  const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}?${params.toString()}`;
  const response = await mapboxFetch<SearchBoxRetrieveResponse>(url);
  const feature = response.features?.[0];
  const coordinates = feature?.geometry?.coordinates;

  if (!feature || !coordinates) {
    return null;
  }

  const name = feature.properties?.name ?? "Local";

  return {
    id: feature.properties?.mapbox_id ?? feature.id ?? mapboxId,
    name,
    fullAddress: feature.properties?.full_address ?? feature.properties?.place_formatted ?? name,
    lat: coordinates[1],
    lng: coordinates[0]
  };
}

export async function buildRoutePreview(payload: RoutePayload): Promise<RoutePreview> {
  const points = [payload.origin, ...payload.stops, payload.destination];
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");

  if (!hasMapboxToken()) {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false`;

    try {
      const response = await osrmFetch<OsrmRouteResponse>(osrmUrl);
      const route = response.routes?.[0];

      if (!route?.geometry?.coordinates?.length) {
        return buildFallbackPreview(payload);
      }

      const geometry = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

      return {
        geometry,
        distanceKm: Number((route.distance / 1000).toFixed(1)),
        durationMinutes: Math.round(route.duration / 60),
        staticMapUrl: null,
        live: true,
        provider: "osrm"
      };
    } catch {
      return buildFallbackPreview(payload);
    }
  }

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
      live: true,
      provider: "mapbox"
    };
  } catch {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false`;

    try {
      const response = await osrmFetch<OsrmRouteResponse>(osrmUrl);
      const route = response.routes?.[0];

      if (!route?.geometry?.coordinates?.length) {
        return buildFallbackPreview(payload);
      }

      const geometry = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

      return {
        geometry,
        distanceKm: Number((route.distance / 1000).toFixed(1)),
        durationMinutes: Math.round(route.duration / 60),
        staticMapUrl: null,
        live: true,
        provider: "osrm"
      };
    } catch {
      return buildFallbackPreview(payload);
    }
  }
}
