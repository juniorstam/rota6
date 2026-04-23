export type StopType = "fuel" | "food" | "rest" | "viewpoint" | "lodging" | "custom";
export type SearchResultType =
  | "city"
  | "address"
  | "restaurant"
  | "hotel"
  | "bar"
  | "fuel"
  | "repair"
  | "tourism"
  | "rota6_place"
  | "poi";

export interface SearchSuggestion {
  id: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  type?: SearchResultType;
  source?: "municipality" | "mapbox" | "google" | "nominatim" | "rota6" | "fallback";
  score?: number;
  providerPlaceId?: string;
}

export interface SearchAutocompleteSuggestion {
  id: string;
  name: string;
  fullAddress: string;
  mapboxId?: string;
  lat?: number;
  lng?: number;
  source: "municipality" | "mapbox" | "google" | "nominatim" | "rota6" | "fallback";
  type?: SearchResultType;
  score?: number;
  matchedText?: string;
}

export interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  placeType?: SearchResultType;
}

export interface RouteStopInput extends RoutePoint {
  id?: string;
  type: StopType;
  orderIndex: number;
}

export interface RoutePreview {
  geometry: Array<{ lat: number; lng: number }>;
  distanceKm: number | null;
  durationMinutes: number | null;
  staticMapUrl: string | null;
  live: boolean;
  provider?: "mapbox" | "osrm" | "fallback";
}

export interface RouteSuggestion {
  id: string;
  name: string;
  category: "restaurant" | "cafe" | "bar" | "fuel" | "hotel" | "repair" | "viewpoint";
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  averageRating: number;
  ratingsCount: number;
  rota6Score: number;
  detourKm: number;
}

export interface RouteRecord {
  id: string;
  userId: string;
  origin: RoutePoint;
  destination: RoutePoint;
  distanceKm: number | null;
  durationMinutes: number | null;
  stops: RouteStopInput[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutePayload {
  origin: RoutePoint;
  destination: RoutePoint;
  distanceKm: number | null;
  durationMinutes: number | null;
  stops: RouteStopInput[];
}
