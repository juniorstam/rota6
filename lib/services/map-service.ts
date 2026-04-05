import { defaultRoute, places } from "@/lib/mock-data";
import { Place, PlaceSearchResult, RouteRequest, RouteResult } from "@/lib/types";

export interface MapService {
  getRoute(input: RouteRequest): Promise<RouteResult>;
  searchPlace(query: string): Promise<PlaceSearchResult[]>;
  getPlacesAlongRoute(route: RouteResult): Promise<Place[]>;
  reverseGeocode(input: { latitude: number; longitude: number }): Promise<string>;
}

class MockMapService implements MapService {
  async getRoute(input: RouteRequest): Promise<RouteResult> {
    const stopFactor = Math.max(input.stops.filter(Boolean).length, 0);
    return {
      ...defaultRoute,
      distanceKm: defaultRoute.distanceKm + stopFactor * 37,
      durationHours: defaultRoute.durationHours + stopFactor * 0.6,
      usingLiveRouting: false,
      summary:
        stopFactor > 0
          ? `Rota com ${stopFactor} parada(s) intermediária(s), equilibrando paisagem, apoio e ritmo confortável.`
          : defaultRoute.summary
    };
  }

  async searchPlace(query: string) {
    const normalized = query.trim().toLowerCase();
    return places
      .filter((place) =>
        [place.name, place.city, place.state, ...place.tags].some((entry) =>
          entry.toLowerCase().includes(normalized)
        )
      )
      .slice(0, 5)
      .map(({ id, name, city, state, address, coordinates }) => ({
        id,
        name,
        city,
        state,
        fullAddress: `${name}, ${address}, ${city} - ${state}`,
        coordinates
      }));
  }

  async getPlacesAlongRoute(_route: RouteResult) {
    return places.slice(0, 4);
  }

  async reverseGeocode({ latitude, longitude }: { latitude: number; longitude: number }) {
    return `Posição atual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  }
}

class ApiMapService implements MapService {
  async getRoute(input: RouteRequest): Promise<RouteResult> {
    const response = await fetch("/api/maps/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return new MockMapService().getRoute(input);
    }

    return (await response.json()) as RouteResult;
  }

  async searchPlace(query: string): Promise<PlaceSearchResult[]> {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`/api/maps/search?${params.toString()}`);

    if (!response.ok) {
      return new MockMapService().searchPlace(query);
    }

    return (await response.json()) as PlaceSearchResult[];
  }

  async getPlacesAlongRoute(route: RouteResult) {
    const response = await fetch("/api/maps/along-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(route)
    });

    if (!response.ok) {
      return new MockMapService().getPlacesAlongRoute(route);
    }

    return (await response.json()) as Place[];
  }

  async reverseGeocode(input: { latitude: number; longitude: number }) {
    const params = new URLSearchParams({
      latitude: input.latitude.toString(),
      longitude: input.longitude.toString()
    });
    const response = await fetch(`/api/maps/reverse?${params.toString()}`);

    if (!response.ok) {
      return new MockMapService().reverseGeocode(input);
    }

    const payload = (await response.json()) as { label: string };
    return payload.label;
  }
}

export const mapService: MapService = new ApiMapService();
