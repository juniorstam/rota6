import { SearchAutocompleteSuggestion, SearchSuggestion } from "@/lib/rebuild/types";

export interface SearchProviderSuggestInput {
  query: string;
  sessionToken: string;
  proximity?: { lat: number; lng: number } | null;
  routeContext?: Array<{ lat: number; lng: number }> | null;
}

export interface SearchProvider {
  name: "mapbox" | "google" | "nominatim" | "rota6";
  suggest(input: SearchProviderSuggestInput): Promise<SearchAutocompleteSuggestion[]>;
  retrieve?(input: { id: string; sessionToken: string }): Promise<SearchSuggestion | null>;
}

export interface RouteProvider {
  name: "mapbox" | "osrm" | "fallback";
  buildRoute(payload: import("@/lib/rebuild/types").RoutePayload): Promise<import("@/lib/rebuild/types").RoutePreview>;
}

export interface PlaceDetailsProvider {
  name: "mapbox" | "rota6";
  retrieve(input: { id: string; sessionToken?: string }): Promise<import("@/lib/rebuild/types").SearchSuggestion | null>;
}
