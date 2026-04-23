import { RoutePayload, RouteSuggestion } from "@/lib/rebuild/types";

const reviewedPlaces: RouteSuggestion[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Mirante da Serra da Graciosa",
    category: "viewpoint",
    address: "Estrada da Graciosa",
    city: "Quatro Barras",
    state: "PR",
    lat: -25.3477,
    lng: -48.9998,
    averageRating: 4.8,
    ratingsCount: 42,
    rota6Score: 93,
    detourKm: 0
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Mirante Serra do Rio do Rastro",
    category: "viewpoint",
    address: "SC-390",
    city: "Bom Jardim da Serra",
    state: "SC",
    lat: -28.3926,
    lng: -49.5487,
    averageRating: 4.9,
    ratingsCount: 76,
    rota6Score: 97,
    detourKm: 0
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Parada Morretes",
    category: "cafe",
    address: "Centro histórico",
    city: "Morretes",
    state: "PR",
    lat: -25.4761,
    lng: -48.8343,
    averageRating: 4.5,
    ratingsCount: 18,
    rota6Score: 82,
    detourKm: 0
  }
];

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const radiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * radiusKm * Math.asin(Math.sqrt(h));
}

function distanceToRouteKm(place: RouteSuggestion, geometry: Array<{ lat: number; lng: number }>) {
  if (geometry.length === 0) {
    return Infinity;
  }

  return Math.min(...geometry.map((point) => haversineKm(place, point)));
}

export function suggestPlacesAlongRoute({
  payload,
  geometry,
  category
}: {
  payload: RoutePayload;
  geometry: Array<{ lat: number; lng: number }>;
  category?: RouteSuggestion["category"] | "all";
}) {
  const routeGeometry =
    geometry.length > 0 ? geometry : [payload.origin, ...payload.stops, payload.destination].map((point) => ({ lat: point.lat, lng: point.lng }));

  return reviewedPlaces
    .filter((place) => !category || category === "all" || place.category === category)
    .map((place) => ({
      ...place,
      detourKm: Number(distanceToRouteKm(place, routeGeometry).toFixed(1))
    }))
    .filter((place) => place.detourKm <= 18)
    .sort((a, b) => {
      const aScore = a.rota6Score + a.averageRating * 10 + Math.min(a.ratingsCount, 50) * 0.4 - a.detourKm * 2.5;
      const bScore = b.rota6Score + b.averageRating * 10 + Math.min(b.ratingsCount, 50) * 0.4 - b.detourKm * 2.5;
      return bScore - aScore;
    })
    .slice(0, 6);
}
