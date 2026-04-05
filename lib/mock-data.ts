import {
  FavoriteList,
  Place,
  PublishedTrip,
  RouteResult,
  UserProfile
} from "@/lib/types";

export const users: UserProfile[] = [
  {
    id: "user-1",
    username: "junior",
    name: "Júnior",
    email: "junior@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    city: "Curitiba",
    state: "PR",
    motorcycle: "Triumph Tiger 900",
    bio: "Estrada cedo, café forte e olho atento para paradas que realmente ajudam a viagem.",
    travelStyle: "longa-distancia",
    publishedTripsCount: 12,
    publishedRecommendationsCount: 34
  },
  {
    id: "user-2",
    username: "biaemduasrodas",
    name: "Beatriz Nunes",
    email: "bia@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    city: "Campinas",
    state: "SP",
    motorcycle: "Royal Enfield Himalayan",
    bio: "Viagens em casal, clima de serra e pousadas que fazem sentido para quem chega de moto.",
    travelStyle: "casal",
    publishedTripsCount: 8,
    publishedRecommendationsCount: 18
  }
];

export const places: Place[] = [
  {
    id: "place-1",
    slug: "mirante-serra-da-graciosa",
    name: "Mirante Serra da Graciosa",
    category: "parada-panoramica",
    description: "Parada clássica com vista aberta da serra, bom espaço para fotos e descanso rápido.",
    address: "Estrada da Graciosa, km 12",
    city: "Morretes",
    state: "PR",
    coordinates: { lat: -25.3431, lng: -48.9072 },
    photos: [
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    averageRating: 4.9,
    tags: ["vista", "foto", "parada-rapida"],
    createdBy: "admin",
    featured: true,
    reviews: [
      {
        id: "review-1",
        userId: "user-2",
        userName: "Beatriz Nunes",
        userAvatarUrl: users[1].avatarUrl,
        rating: 5,
        comment: "Visual lindo e recuo seguro para estacionar a moto sem stress.",
        safeForMotorcycle: true,
        goodForGroups: true,
        pricePerception: "barato",
        travelerStructure: "boa",
        wouldRecommend: true,
        createdAt: "2026-03-18"
      }
    ]
  },
  {
    id: "place-2",
    slug: "posto-vale-do-ribeira",
    name: "Posto Vale do Ribeira",
    category: "posto",
    description: "Combustível confiável, loja de conveniência e calibragem fácil para motos.",
    address: "BR-116, km 412",
    city: "Registro",
    state: "SP",
    coordinates: { lat: -24.4947, lng: -47.8439 },
    photos: [
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80"
    ],
    averageRating: 4.6,
    tags: ["combustivel", "banheiro", "grupo"],
    createdBy: "usuario",
    reviews: [
      {
        id: "review-2",
        userId: "user-1",
        userName: "Júnior",
        userAvatarUrl: users[0].avatarUrl,
        rating: 4,
        comment: "Bom apoio antes da serra. Atendimento rápido e espaço bom para comboio.",
        safeForMotorcycle: true,
        goodForGroups: true,
        pricePerception: "medio",
        travelerStructure: "boa",
        wouldRecommend: true,
        createdAt: "2026-02-11"
      }
    ]
  },
  {
    id: "place-3",
    slug: "oficina-estrada-livre",
    name: "Oficina Estrada Livre",
    category: "oficina",
    description: "Oficina especializada em atendimento rápido para viajantes e pequenos reparos.",
    address: "Av. dos Viajantes, 220",
    city: "Joinville",
    state: "SC",
    coordinates: { lat: -26.3051, lng: -48.8461 },
    photos: [
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80"
    ],
    averageRating: 4.8,
    tags: ["mecanica", "socorro", "emergencia"],
    createdBy: "admin",
    reviews: []
  },
  {
    id: "place-4",
    slug: "pousada-curvas-do-vento",
    name: "Pousada Curvas do Vento",
    category: "pousada",
    description: "Hospedagem acolhedora com estacionamento coberto e café cedo para quem sai antes do sol.",
    address: "Estrada do Alto, 88",
    city: "São Bento do Sul",
    state: "SC",
    coordinates: { lat: -26.2494, lng: -49.3843 },
    photos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    averageRating: 4.7,
    tags: ["estacionamento", "cafe-da-manha", "casal"],
    createdBy: "usuario",
    featured: true,
    reviews: []
  }
];

export const trips: PublishedTrip[] = [
  {
    id: "trip-1",
    slug: "serra-da-graciosa-ate-ilha-do-mel",
    title: "Serra da Graciosa até Ilha do Mel",
    origin: "Curitiba, PR",
    destination: "Pontal do Paraná, PR",
    summary: "Descida clássica pela serra, almoço em Morretes e fim de tarde no litoral.",
    coverUrl:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    routeStops: [
      {
        id: "stop-1",
        name: "Mirante Serra da Graciosa",
        city: "Morretes",
        state: "PR",
        type: "paisagem",
        notes: "Pare cedo para pegar menos movimento."
      },
      {
        id: "stop-2",
        name: "Centro Histórico",
        city: "Morretes",
        state: "PR",
        type: "parada",
        notes: "Bom ponto para almoço e descanso."
      }
    ],
    tips: [
      "Evite a descida em dia de chuva forte.",
      "Abasteça antes da serra.",
      "Leve capa leve mesmo no verão."
    ],
    roadLevel: "moderada",
    tripType: "casal",
    publicVisibility: true,
    author: {
      id: users[0].id,
      username: users[0].username,
      name: users[0].name,
      avatarUrl: users[0].avatarUrl,
      motorcycle: users[0].motorcycle
    },
    distanceKm: 148,
    durationHours: 4.2,
    commentsCount: 18
  },
  {
    id: "trip-2",
    slug: "circuito-campos-do-jordao-e-mantiqueira",
    title: "Circuito Campos do Jordão e Mantiqueira",
    origin: "Campinas, SP",
    destination: "Campos do Jordão, SP",
    summary: "Curvas, clima frio e paradas bonitas para um fim de semana em casal.",
    coverUrl:
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=1200&q=80"
    ],
    routeStops: [
      {
        id: "stop-3",
        name: "Posto Vale do Ribeira",
        city: "Registro",
        state: "SP",
        type: "combustivel"
      }
    ],
    tips: [
      "Saia cedo para fugir do trânsito na serra.",
      "Leve segunda camada para o fim da tarde."
    ],
    roadLevel: "tranquila",
    tripType: "casal",
    publicVisibility: true,
    author: {
      id: users[1].id,
      username: users[1].username,
      name: users[1].name,
      avatarUrl: users[1].avatarUrl,
      motorcycle: users[1].motorcycle
    },
    distanceKm: 196,
    durationHours: 3.8,
    commentsCount: 9
  }
];

export const favoriteLists: FavoriteList[] = [
  {
    id: "fav-1",
    name: "Próxima viagem",
    itemIds: ["place-1", "trip-2", "place-4"]
  },
  {
    id: "fav-2",
    name: "Paradas seguras",
    itemIds: ["place-2", "place-3"]
  }
];

export const defaultRoute: RouteResult = {
  polyline: [
    { lat: -25.4284, lng: -49.2733 },
    { lat: -25.5701, lng: -48.8113 },
    { lat: -25.5484, lng: -48.5588 }
  ],
  distanceKm: 148,
  durationHours: 4.2,
  summary: "Trecho cênico com serra, curvas médias e boa oferta de paradas confiáveis.",
  suggestedPlaces: [
    {
      id: "route-place-1",
      name: "Mirante Serra da Graciosa",
      category: "parada-panoramica",
      distanceFromRouteKm: 0.2,
      reason: "Vista ampla e parada clássica para fotos."
    },
    {
      id: "route-place-2",
      name: "Posto Vale do Ribeira",
      category: "posto",
      distanceFromRouteKm: 1.1,
      reason: "Abastecimento confiável e boa estrutura para grupo."
    }
  ]
};
