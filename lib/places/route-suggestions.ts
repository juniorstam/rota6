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
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Mirante do Itatiaia",
    category: "viewpoint",
    address: "Parque Nacional do Itatiaia",
    city: "Itatiaia",
    state: "RJ",
    lat: -22.3719,
    lng: -44.6128,
    averageRating: 4.9,
    ratingsCount: 120,
    rota6Score: 96,
    detourKm: 0
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Petrópolis Centro Histórico",
    category: "viewpoint",
    address: "R. do Imperador",
    city: "Petrópolis",
    state: "RJ",
    lat: -22.5051,
    lng: -43.1793,
    averageRating: 4.7,
    ratingsCount: 95,
    rota6Score: 89,
    detourKm: 0
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Mirante de Teresópolis",
    category: "viewpoint",
    address: "Alto",
    city: "Teresópolis",
    state: "RJ",
    lat: -22.4122,
    lng: -42.9630,
    averageRating: 4.6,
    ratingsCount: 58,
    rota6Score: 85,
    detourKm: 0
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Restaurante Beira Rio",
    category: "restaurant",
    address: "Margem do Rio Paraíba",
    city: "Resende",
    state: "RJ",
    lat: -22.4711,
    lng: -44.4509,
    averageRating: 4.4,
    ratingsCount: 34,
    rota6Score: 78,
    detourKm: 0
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    name: "Posto Completo BR-040",
    category: "fuel",
    address: "BR-040 km 48",
    city: "Juiz de Fora",
    state: "MG",
    lat: -21.7642,
    lng: -43.3503,
    averageRating: 4.2,
    ratingsCount: 210,
    rota6Score: 74,
    detourKm: 0
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    name: "Café do Tropeiro",
    category: "cafe",
    address: "Estrada Real",
    city: "Além Paraíba",
    state: "MG",
    lat: -21.8808,
    lng: -42.7075,
    averageRating: 4.6,
    ratingsCount: 47,
    rota6Score: 84,
    detourKm: 0
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Hotel Fazenda Vale Verde",
    category: "hotel",
    address: "Estrada do Vale",
    city: "Vassouras",
    state: "RJ",
    lat: -22.4039,
    lng: -43.6625,
    averageRating: 4.5,
    ratingsCount: 62,
    rota6Score: 83,
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
  if (geometry.length === 0) return Infinity;
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
    geometry.length > 0
      ? geometry
      : [payload.origin, ...payload.stops, payload.destination].map((p) => ({ lat: p.lat, lng: p.lng }));

  // Calcular tamanho da rota para definir raio de busca proporcional
  let routeLengthKm = 0;
  for (let i = 0; i < routeGeometry.length - 1; i++) {
    routeLengthKm += haversineKm(routeGeometry[i], routeGeometry[i + 1]);
  }
  const radiusKm = Math.max(50, routeLengthKm * 0.15);

  const filtered = reviewedPlaces
    .filter((place) => !category || category === "all" || place.category === category)
    .map((place) => ({
      ...place,
      detourKm: Number(distanceToRouteKm(place, routeGeometry).toFixed(1))
    }))
    .filter((place) => place.detourKm <= radiusKm)
    .sort((a, b) => {
      const aScore = a.rota6Score + a.averageRating * 10 + Math.min(a.ratingsCount, 50) * 0.4 - a.detourKm * 2.5;
      const bScore = b.rota6Score + b.averageRating * 10 + Math.min(b.ratingsCount, 50) * 0.4 - b.detourKm * 2.5;
      return bScore - aScore;
    })
    .slice(0, 6);

  // Se não encontrou nada próximo, retorna os melhores avaliados como fallback
  if (filtered.length === 0) {
    return reviewedPlaces
      .slice()
      .sort((a, b) => b.rota6Score - a.rota6Score)
      .slice(0, 4);
  }

  return filtered;
}
