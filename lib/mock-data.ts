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
  },
  {
    id: "user-3",
    username: "isaacnaestrada",
    name: "Isaac",
    email: "isaac@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    city: "Belo Horizonte",
    state: "MG",
    motorcycle: "BMW F 850 GS",
    bio: "Curto serras, viagens em dupla e registrar paisagens que merecem virar lembrança.",
    travelStyle: "grupo",
    publishedTripsCount: 5,
    publishedRecommendationsCount: 11
  },
  {
    id: "user-4",
    username: "marinadecapacete",
    name: "Marina Costa",
    email: "marina@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
    city: "Florianópolis",
    state: "SC",
    motorcycle: "Honda NC 750X",
    bio: "Viagem boa para mim tem mar, serra, café e um roteiro sem pressa.",
    travelStyle: "casal",
    publishedTripsCount: 6,
    publishedRecommendationsCount: 15
  },
  {
    id: "user-5",
    username: "rafaelcurvas",
    name: "Rafael Mendes",
    email: "rafael@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
    city: "São Paulo",
    state: "SP",
    motorcycle: "Yamaha Tracer 900",
    bio: "Estrada técnica, ritmo constante e muita atenção em apoio confiável pelo caminho.",
    travelStyle: "solo",
    publishedTripsCount: 10,
    publishedRecommendationsCount: 27
  },
  {
    id: "user-6",
    username: "carolnaestrada",
    name: "Carol Freitas",
    email: "carol@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
    city: "Goiânia",
    state: "GO",
    motorcycle: "Kawasaki Versys 650",
    bio: "Bate-volta longo, céu aberto e fotos espontâneas do que faz a viagem valer.",
    travelStyle: "bate-volta",
    publishedTripsCount: 4,
    publishedRecommendationsCount: 9
  }
];

export const followingByUserId: Record<string, string[]> = {
  "user-1": ["user-2", "user-3", "user-4", "user-5"],
  "user-2": ["user-1", "user-4"],
  "user-3": ["user-1", "user-5"],
  "user-4": ["user-1", "user-2"],
  "user-5": ["user-1", "user-3", "user-6"],
  "user-6": ["user-1", "user-4"]
};

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
    tags: ["serra", "litoral", "casal"],
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
    tags: ["serra", "casal", "frio"],
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
  },
  {
    id: "trip-3",
    slug: "serra-do-cipo-com-paradas-cenicas",
    title: "Serra do Cipó com paradas cênicas",
    origin: "Belo Horizonte, MG",
    destination: "Serra do Cipó, MG",
    summary: "Um bate-volta estendido com curvas gostosas, café de estrada e fotos no alto da serra.",
    coverUrl:
      "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["serra", "grupo", "bate-volta"],
    routeStops: [
      {
        id: "stop-4",
        name: "Mirante da Serra",
        city: "Santana do Riacho",
        state: "MG",
        type: "paisagem",
        notes: "Bom ponto para pausa curta e fotos."
      }
    ],
    tips: ["Saída cedo melhora muito a experiência.", "Vale levar água e segunda camada leve."],
    roadLevel: "tranquila",
    tripType: "grupo",
    publicVisibility: true,
    author: {
      id: users[2].id,
      username: users[2].username,
      name: users[2].name,
      avatarUrl: users[2].avatarUrl,
      motorcycle: users[2].motorcycle
    },
    distanceKm: 118,
    durationHours: 2.9,
    commentsCount: 6
  },
  {
    id: "trip-4",
    slug: "litoral-sul-com-cafe-e-pousada",
    title: "Litoral Sul com café e pousada de apoio",
    origin: "Florianópolis, SC",
    destination: "Praia do Rosa, SC",
    summary: "Uma rota leve para curtir o caminho, fazer pausa bonita e dormir perto do mar.",
    coverUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["litoral", "casal", "descanso"],
    routeStops: [
      {
        id: "stop-5",
        name: "Café da estrada",
        city: "Imbituba",
        state: "SC",
        type: "parada",
        notes: "Bom café e saída rápida para seguir ao litoral."
      }
    ],
    tips: ["Boa rota para fim de semana com pouca pressa.", "Melhor sair após o pico da manhã."],
    roadLevel: "tranquila",
    tripType: "casal",
    publicVisibility: true,
    author: {
      id: users[3].id,
      username: users[3].username,
      name: users[3].name,
      avatarUrl: users[3].avatarUrl,
      motorcycle: users[3].motorcycle
    },
    distanceKm: 98,
    durationHours: 2.1,
    commentsCount: 4
  },
  {
    id: "trip-5",
    slug: "estrada-dos-romeiros-bate-volta",
    title: "Estrada dos Romeiros em bate-volta",
    origin: "São Paulo, SP",
    destination: "Santana de Parnaíba, SP",
    summary: "Trecho curto, histórico e perfeito para aquecer a semana sem perder a estrada.",
    coverUrl:
      "https://images.unsplash.com/photo-1500534314209-a26db0f5b4aa?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["urbano", "solo", "bate-volta"],
    routeStops: [
      {
        id: "stop-6",
        name: "Mirante local",
        city: "Barueri",
        state: "SP",
        type: "paisagem"
      }
    ],
    tips: ["Ótima rota para rodar cedo.", "Vale combinar com café na volta."],
    roadLevel: "moderada",
    tripType: "solo",
    publicVisibility: true,
    author: {
      id: users[4].id,
      username: users[4].username,
      name: users[4].name,
      avatarUrl: users[4].avatarUrl,
      motorcycle: users[4].motorcycle
    },
    distanceKm: 62,
    durationHours: 1.6,
    commentsCount: 7
  },
  {
    id: "trip-6",
    slug: "pirenopolis-com-paradas-fotograficas",
    title: "Pirenópolis com paradas fotográficas",
    origin: "Goiânia, GO",
    destination: "Pirenópolis, GO",
    summary: "Curvas leves, luz bonita no fim da tarde e paradas que rendem boas fotos.",
    coverUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["grupo", "foto", "bate-volta"],
    routeStops: [
      {
        id: "stop-7",
        name: "Parada para foto",
        city: "Pirenópolis",
        state: "GO",
        type: "paisagem"
      }
    ],
    tips: ["Melhor luz entre 16h e 17h30.", "Boa para quem quer viagem curta e bonita."],
    roadLevel: "tranquila",
    tripType: "grupo",
    publicVisibility: true,
    author: {
      id: users[5].id,
      username: users[5].username,
      name: users[5].name,
      avatarUrl: users[5].avatarUrl,
      motorcycle: users[5].motorcycle
    },
    distanceKm: 151,
    durationHours: 2.5,
    commentsCount: 5
  },
  {
    id: "trip-7",
    slug: "capitolio-e-curvas-de-minas",
    title: "Capitólio e curvas de Minas",
    origin: "Belo Horizonte, MG",
    destination: "Capitólio, MG",
    summary: "Viagem para curtir a tocada, almoçar bem e terminar com vista boa da represa.",
    coverUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["serra", "grupo", "fim-de-semana"],
    routeStops: [
      {
        id: "stop-8",
        name: "Posto de apoio",
        city: "Divinópolis",
        state: "MG",
        type: "combustivel"
      }
    ],
    tips: ["Bom roteiro de fim de semana.", "Vale revisar pressão dos pneus antes de sair."],
    roadLevel: "moderada",
    tripType: "grupo",
    publicVisibility: true,
    author: {
      id: users[2].id,
      username: users[2].username,
      name: users[2].name,
      avatarUrl: users[2].avatarUrl,
      motorcycle: users[2].motorcycle
    },
    distanceKm: 279,
    durationHours: 4.7,
    commentsCount: 11
  },
  {
    id: "trip-8",
    slug: "mantiqueira-cedo-e-sem-pressa",
    title: "Mantiqueira cedo e sem pressa",
    origin: "Campinas, SP",
    destination: "Santo Antônio do Pinhal, SP",
    summary: "Subida gostosa, clima fresco e ótimos pontos para parar em dupla.",
    coverUrl:
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["serra", "casal", "frio"],
    routeStops: [
      {
        id: "stop-9",
        name: "Café com vista",
        city: "São Bento do Sapucaí",
        state: "SP",
        type: "parada"
      }
    ],
    tips: ["Bom para casal.", "Saia cedo para encontrar a serra mais vazia."],
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
    distanceKm: 182,
    durationHours: 3.4,
    commentsCount: 8
  },
  {
    id: "trip-9",
    slug: "serra-catarinense-com-frios-e-mirantes",
    title: "Serra Catarinense com frio e mirantes",
    origin: "Florianópolis, SC",
    destination: "Urubici, SC",
    summary: "Subida bonita, clima serrano e várias pausas que rendem álbum inteiro.",
    coverUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["serra", "casal", "mirantes"],
    routeStops: [
      {
        id: "stop-10",
        name: "Mirante local",
        city: "Bom Retiro",
        state: "SC",
        type: "paisagem"
      }
    ],
    tips: ["Leve camada térmica.", "Ótima viagem para pernoite."],
    roadLevel: "moderada",
    tripType: "casal",
    publicVisibility: true,
    author: {
      id: users[3].id,
      username: users[3].username,
      name: users[3].name,
      avatarUrl: users[3].avatarUrl,
      motorcycle: users[3].motorcycle
    },
    distanceKm: 167,
    durationHours: 3.7,
    commentsCount: 13
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
