import { RoutePayload, RouteSuggestion } from "@/lib/rebuild/types";

// Banco de lugares reais distribuídos pelo Brasil inteiro
const reviewedPlaces: RouteSuggestion[] = [
  // RJ
  { id: "rj-01", name: "Mirante do Itatiaia", category: "viewpoint", address: "Parque Nacional do Itatiaia", city: "Itatiaia", state: "RJ", lat: -22.3719, lng: -44.6128, averageRating: 4.9, ratingsCount: 120, rota6Score: 96, detourKm: 0 },
  { id: "rj-02", name: "Petrópolis – Centro Histórico", category: "viewpoint", address: "R. do Imperador", city: "Petrópolis", state: "RJ", lat: -22.5051, lng: -43.1793, averageRating: 4.7, ratingsCount: 95, rota6Score: 89, detourKm: 0 },
  { id: "rj-03", name: "Mirante de Teresópolis", category: "viewpoint", address: "Alto", city: "Teresópolis", state: "RJ", lat: -22.4122, lng: -42.9630, averageRating: 4.6, ratingsCount: 58, rota6Score: 85, detourKm: 0 },
  { id: "rj-04", name: "Posto Shell – Via Dutra RJ", category: "fuel", address: "BR-116 km 207", city: "Resende", state: "RJ", lat: -22.4680, lng: -44.4350, averageRating: 4.2, ratingsCount: 310, rota6Score: 72, detourKm: 0 },
  { id: "rj-05", name: "Restaurante Beira Rio Resende", category: "restaurant", address: "Margem do Rio Paraíba", city: "Resende", state: "RJ", lat: -22.4711, lng: -44.4509, averageRating: 4.4, ratingsCount: 34, rota6Score: 78, detourKm: 0 },
  { id: "rj-06", name: "Café do Museu Imperial", category: "cafe", address: "R. da Imperatriz 220", city: "Petrópolis", state: "RJ", lat: -22.5057, lng: -43.1858, averageRating: 4.5, ratingsCount: 67, rota6Score: 81, detourKm: 0 },
  { id: "rj-07", name: "Hotel Fazenda Vassouras", category: "hotel", address: "Estrada do Vale", city: "Vassouras", state: "RJ", lat: -22.4039, lng: -43.6625, averageRating: 4.5, ratingsCount: 62, rota6Score: 83, detourKm: 0 },
  { id: "rj-08", name: "Mirante do Cabo Frio", category: "viewpoint", address: "Ponta do Pai Vitório", city: "Cabo Frio", state: "RJ", lat: -22.8753, lng: -42.0189, averageRating: 4.8, ratingsCount: 88, rota6Score: 91, detourKm: 0 },
  { id: "rj-09", name: "Praia do Peró – Mirante", category: "viewpoint", address: "RJ-102", city: "Cabo Frio", state: "RJ", lat: -22.8150, lng: -42.0720, averageRating: 4.7, ratingsCount: 72, rota6Score: 88, detourKm: 0 },
  { id: "rj-10", name: "Posto Ipiranga – Arraial do Cabo", category: "fuel", address: "RJ-102 km 3", city: "Arraial do Cabo", state: "RJ", lat: -22.9660, lng: -42.0220, averageRating: 4.1, ratingsCount: 190, rota6Score: 69, detourKm: 0 },
  { id: "rj-11", name: "Pousada Pedra da Lagoa", category: "hotel", address: "Lagoa de Araruama", city: "Araruama", state: "RJ", lat: -22.8731, lng: -42.3447, averageRating: 4.6, ratingsCount: 41, rota6Score: 82, detourKm: 0 },
  { id: "rj-12", name: "Mirante de Niterói – Caminho Niemeyer", category: "viewpoint", address: "Av. Maestro Jesus Sodré", city: "Niterói", state: "RJ", lat: -22.8941, lng: -43.1199, averageRating: 4.8, ratingsCount: 142, rota6Score: 93, detourKm: 0 },
  // ES
  { id: "es-01", name: "Mirante da Pedra Azul", category: "viewpoint", address: "ES-164", city: "Domingos Martins", state: "ES", lat: -20.4183, lng: -41.0072, averageRating: 4.9, ratingsCount: 108, rota6Score: 95, detourKm: 0 },
  { id: "es-02", name: "Café Colônia Italiana", category: "cafe", address: "Centro", city: "Venda Nova do Imigrante", state: "ES", lat: -20.3336, lng: -41.1333, averageRating: 4.6, ratingsCount: 53, rota6Score: 83, detourKm: 0 },
  { id: "es-03", name: "Posto BR – Guarapari", category: "fuel", address: "BR-101 km 299", city: "Guarapari", state: "ES", lat: -20.6700, lng: -40.4990, averageRating: 4.0, ratingsCount: 255, rota6Score: 67, detourKm: 0 },
  { id: "es-04", name: "Hotel Praia do Morro", category: "hotel", address: "Av. Beira Mar", city: "Guarapari", state: "ES", lat: -20.5533, lng: -40.4858, averageRating: 4.4, ratingsCount: 78, rota6Score: 80, detourKm: 0 },
  { id: "es-05", name: "Restaurante Mar e Terra", category: "restaurant", address: "Centro", city: "Anchieta", state: "ES", lat: -20.8041, lng: -40.6447, averageRating: 4.5, ratingsCount: 44, rota6Score: 79, detourKm: 0 },
  // MG
  { id: "mg-01", name: "Mirante da Serra da Canastra", category: "viewpoint", address: "Parque Nacional", city: "São Roque de Minas", state: "MG", lat: -20.2466, lng: -46.3564, averageRating: 4.9, ratingsCount: 98, rota6Score: 96, detourKm: 0 },
  { id: "mg-02", name: "Café Trilha do Ouro", category: "cafe", address: "Estrada Real", city: "Ouro Preto", state: "MG", lat: -20.3858, lng: -43.5036, averageRating: 4.7, ratingsCount: 61, rota6Score: 86, detourKm: 0 },
  { id: "mg-03", name: "Posto Petrobras – BR-040 JF", category: "fuel", address: "BR-040 km 48", city: "Juiz de Fora", state: "MG", lat: -21.7642, lng: -43.3503, averageRating: 4.2, ratingsCount: 210, rota6Score: 72, detourKm: 0 },
  { id: "mg-04", name: "Pousada Serra Verde", category: "hotel", address: "Serra do Cipó", city: "Santana do Riacho", state: "MG", lat: -19.3050, lng: -43.6180, averageRating: 4.6, ratingsCount: 55, rota6Score: 84, detourKm: 0 },
  { id: "mg-05", name: "Restaurante Comida Mineira", category: "restaurant", address: "Praça da Liberdade", city: "Belo Horizonte", state: "MG", lat: -19.9325, lng: -43.9374, averageRating: 4.5, ratingsCount: 130, rota6Score: 82, detourKm: 0 },
  { id: "mg-06", name: "Café do Tropeiro – Além Paraíba", category: "cafe", address: "Estrada Real", city: "Além Paraíba", state: "MG", lat: -21.8808, lng: -42.7075, averageRating: 4.6, ratingsCount: 47, rota6Score: 84, detourKm: 0 },
  // SP
  { id: "sp-01", name: "Mirante do Vale do Paraíba", category: "viewpoint", address: "SP-123", city: "São José dos Campos", state: "SP", lat: -23.1794, lng: -45.8869, averageRating: 4.5, ratingsCount: 77, rota6Score: 82, detourKm: 0 },
  { id: "sp-02", name: "Posto Shell – Rodovia Presidente Dutra", category: "fuel", address: "BR-116 km 164", city: "Jacareí", state: "SP", lat: -23.2986, lng: -45.9656, averageRating: 4.1, ratingsCount: 340, rota6Score: 70, detourKm: 0 },
  { id: "sp-03", name: "Restaurante A Estância", category: "restaurant", address: "Rod. Dom Pedro I km 82", city: "Atibaia", state: "SP", lat: -23.1170, lng: -46.5500, averageRating: 4.4, ratingsCount: 89, rota6Score: 79, detourKm: 0 },
  { id: "sp-04", name: "Hotel Fazenda Atibainha", category: "hotel", address: "Represa Atibainha", city: "Nazaré Paulista", state: "SP", lat: -23.1808, lng: -46.3964, averageRating: 4.6, ratingsCount: 93, rota6Score: 85, detourKm: 0 },
  // PR
  { id: "pr-01", name: "Mirante da Serra da Graciosa", category: "viewpoint", address: "Estrada da Graciosa", city: "Quatro Barras", state: "PR", lat: -25.3477, lng: -48.9998, averageRating: 4.8, ratingsCount: 42, rota6Score: 93, detourKm: 0 },
  { id: "pr-02", name: "Parada Morretes – Café Colonial", category: "cafe", address: "Centro histórico", city: "Morretes", state: "PR", lat: -25.4761, lng: -48.8343, averageRating: 4.5, ratingsCount: 18, rota6Score: 82, detourKm: 0 },
  { id: "pr-03", name: "Posto BR – Curitiba Sul", category: "fuel", address: "BR-116 km 84", city: "Curitiba", state: "PR", lat: -25.5249, lng: -49.2925, averageRating: 4.1, ratingsCount: 280, rota6Score: 69, detourKm: 0 },
  // SC
  { id: "sc-01", name: "Mirante Serra do Rio do Rastro", category: "viewpoint", address: "SC-390", city: "Bom Jardim da Serra", state: "SC", lat: -28.3926, lng: -49.5487, averageRating: 4.9, ratingsCount: 76, rota6Score: 97, detourKm: 0 },
  { id: "sc-02", name: "Posto Ipiranga – Florianópolis", category: "fuel", address: "BR-101 km 202", city: "Florianópolis", state: "SC", lat: -27.5941, lng: -48.5476, averageRating: 4.0, ratingsCount: 190, rota6Score: 65, detourKm: 0 },
  // BA
  { id: "ba-01", name: "Mirante da Chapada Diamantina", category: "viewpoint", address: "Parque Nacional", city: "Lençóis", state: "BA", lat: -12.5609, lng: -41.3897, averageRating: 4.9, ratingsCount: 115, rota6Score: 97, detourKm: 0 },
  { id: "ba-02", name: "Posto BR – Salvador Norte", category: "fuel", address: "BR-324 km 12", city: "Salvador", state: "BA", lat: -12.8864, lng: -38.4813, averageRating: 4.0, ratingsCount: 220, rota6Score: 66, detourKm: 0 },
];

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Distância mínima de um lugar a qualquer ponto da geometria da rota
function distanceToRouteKm(place: { lat: number; lng: number }, geometry: Array<{ lat: number; lng: number }>) {
  if (geometry.length === 0) return Infinity;
  let minDist = Infinity;
  for (let i = 0; i < geometry.length; i++) {
    const d = haversineKm(place, geometry[i]);
    if (d < minDist) minDist = d;
    // Também verifica pontos interpolados entre segmentos para rotas esparsas
    if (i < geometry.length - 1) {
      const mid = {
        lat: (geometry[i].lat + geometry[i + 1].lat) / 2,
        lng: (geometry[i].lng + geometry[i + 1].lng) / 2,
      };
      const dm = haversineKm(place, mid);
      if (dm < minDist) minDist = dm;
    }
  }
  return minDist;
}

export function suggestPlacesAlongRoute({
  payload,
  geometry,
  category,
}: {
  payload: RoutePayload;
  geometry: Array<{ lat: number; lng: number }>;
  category?: RouteSuggestion["category"] | "all";
}) {
  // Usa geometria real da rota se disponível; senão interpola pontos entre origem/paradas/destino
  let routePoints = geometry.length > 0
    ? geometry
    : [payload.origin, ...payload.stops, payload.destination].map(p => ({ lat: p.lat, lng: p.lng }));

  // Se a geometria tiver poucos pontos (rota esparsa), interpola para melhorar o filtro
  if (routePoints.length < 10) {
    const interpolated: Array<{ lat: number; lng: number }> = [];
    for (let i = 0; i < routePoints.length - 1; i++) {
      interpolated.push(routePoints[i]);
      for (let t = 1; t <= 4; t++) {
        interpolated.push({
          lat: routePoints[i].lat + (routePoints[i + 1].lat - routePoints[i].lat) * (t / 5),
          lng: routePoints[i].lng + (routePoints[i + 1].lng - routePoints[i].lng) * (t / 5),
        });
      }
    }
    interpolated.push(routePoints[routePoints.length - 1]);
    routePoints = interpolated;
  }

  const MAX_DETOUR_KM = 10;

  const results = reviewedPlaces
    .filter(p => !category || category === "all" || p.category === category)
    .map(p => ({ ...p, detourKm: Number(distanceToRouteKm(p, routePoints).toFixed(1)) }))
    .filter(p => p.detourKm <= MAX_DETOUR_KM)
    .sort((a, b) => {
      const score = (p: typeof a) =>
        p.rota6Score + p.averageRating * 8 + Math.min(p.ratingsCount, 50) * 0.3 - p.detourKm * 3;
      return score(b) - score(a);
    })
    .slice(0, 6);

  return results;
}
