export type StopType = "fuel" | "food" | "rest" | "viewpoint" | "lodging" | "custom";

export interface SearchSuggestion {
  id: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
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
