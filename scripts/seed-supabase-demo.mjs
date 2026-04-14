import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const users = [
  {
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
    travelStyle: "longa-distancia"
  },
  {
    username: "biaemduasrodas",
    name: "Beatriz Nunes",
    email: "bia@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    city: "Campinas",
    state: "SP",
    motorcycle: "Royal Enfield Himalayan",
    bio: "Viagens em casal, clima de serra e pousadas que fazem sentido para quem chega de moto.",
    travelStyle: "casal"
  },
  {
    username: "isaacnaestrada",
    name: "Isaac",
    email: "isaac@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    city: "Belo Horizonte",
    state: "MG",
    motorcycle: "BMW F 850 GS",
    bio: "Curto serras, viagens em dupla e registrar paisagens que merecem virar lembrança.",
    travelStyle: "grupo"
  },
  {
    username: "marinadecapacete",
    name: "Marina Costa",
    email: "marina@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
    city: "Florianópolis",
    state: "SC",
    motorcycle: "Honda NC 750X",
    bio: "Viagem boa para mim tem mar, serra, café e um roteiro sem pressa.",
    travelStyle: "casal"
  },
  {
    username: "rafaelcurvas",
    name: "Rafael Mendes",
    email: "rafael@rota6.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
    city: "São Paulo",
    state: "SP",
    motorcycle: "Yamaha Tracer 900",
    bio: "Estrada técnica, ritmo constante e muita atenção em apoio confiável pelo caminho.",
    travelStyle: "solo"
  }
];

const trips = [
  {
    email: "junior@rota6.dev",
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
    tips: [
      "Evite a descida em dia de chuva forte.",
      "Abasteça antes da serra.",
      "Leve capa leve mesmo no verão."
    ],
    routeStops: [
      { label: "Mirante Serra da Graciosa", type: "paisagem", notes: "Pare cedo para pegar menos movimento." },
      { label: "Centro Histórico", type: "parada", notes: "Bom ponto para almoço e descanso." }
    ],
    roadLevel: "moderada",
    tripType: "casal",
    distanceKm: 148,
    durationHours: 4.2
  },
  {
    email: "bia@rota6.dev",
    slug: "circuito-campos-do-jordao-e-mantiqueira",
    title: "Circuito Campos do Jordão e Mantiqueira",
    origin: "Campinas, SP",
    destination: "Campos do Jordão, SP",
    summary: "Curvas, clima frio e paradas bonitas para um fim de semana em casal.",
    coverUrl:
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1400&q=80",
    photos: ["https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=1200&q=80"],
    tags: ["serra", "casal", "frio"],
    tips: ["Saia cedo para fugir do trânsito na serra.", "Leve segunda camada para o fim da tarde."],
    routeStops: [{ label: "Posto Vale do Ribeira", type: "combustivel", notes: "" }],
    roadLevel: "tranquila",
    tripType: "casal",
    distanceKm: 196,
    durationHours: 3.8
  },
  {
    email: "isaac@rota6.dev",
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
    tips: ["Saída cedo melhora muito a experiência.", "Vale levar água e segunda camada leve."],
    routeStops: [{ label: "Mirante da Serra", type: "paisagem", notes: "Bom ponto para pausa curta e fotos." }],
    roadLevel: "tranquila",
    tripType: "grupo",
    distanceKm: 118,
    durationHours: 2.9
  },
  {
    email: "marina@rota6.dev",
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
    tips: ["Boa rota para fim de semana com pouca pressa.", "Melhor sair após o pico da manhã."],
    routeStops: [{ label: "Café da estrada", type: "parada", notes: "Bom café e saída rápida para seguir ao litoral." }],
    roadLevel: "tranquila",
    tripType: "casal",
    distanceKm: 98,
    durationHours: 2.1
  },
  {
    email: "rafael@rota6.dev",
    slug: "estrada-dos-romeiros-bate-volta",
    title: "Estrada dos Romeiros em bate-volta",
    origin: "São Paulo, SP",
    destination: "Santana de Parnaíba, SP",
    summary: "Trecho curto, histórico e perfeito para aquecer a semana sem perder a estrada.",
    coverUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    photos: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"],
    tags: ["urbano", "solo", "bate-volta"],
    tips: ["Ótima rota para rodar cedo.", "Vale combinar com café na volta."],
    routeStops: [{ label: "Mirante local", type: "paisagem", notes: "" }],
    roadLevel: "moderada",
    tripType: "solo",
    distanceKm: 62,
    durationHours: 1.6
  }
];

function randomPassword() {
  return `Rota6!${Math.random().toString(36).slice(2)}A1`;
}

async function ensureUser(user) {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }

  const existing = listData.users.find((entry) => entry.email?.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: {
      name: user.name,
      username: user.username
    }
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function main() {
  const usersByEmail = new Map();

  for (const user of users) {
    const authUser = await ensureUser(user);
    usersByEmail.set(user.email, authUser.id);

    const { error } = await supabase.from("profiles").upsert(
      {
        id: authUser.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar_url: user.avatarUrl,
        cover_url: user.coverUrl ?? null,
        city: user.city,
        state: user.state,
        motorcycle_text: user.motorcycle,
        bio: user.bio,
        travel_style: user.travelStyle,
        contact_email: user.email
      },
      { onConflict: "id" }
    );

    if (error) {
      throw error;
    }
  }

  for (const trip of trips) {
    const userId = usersByEmail.get(trip.email);
    if (!userId) {
      throw new Error(`Usuário não encontrado para ${trip.email}`);
    }

    const { data: tripRow, error: tripError } = await supabase
      .from("trips")
      .upsert(
        {
          user_id: userId,
          slug: trip.slug,
          title: trip.title,
          origin_label: trip.origin,
          destination_label: trip.destination,
          summary: trip.summary,
          road_level: trip.roadLevel,
          trip_type: trip.tripType,
          visibility: "public",
          distance_km: trip.distanceKm,
          duration_hours: trip.durationHours,
          tags: trip.tags,
          tips: trip.tips
        },
        { onConflict: "user_id,slug" }
      )
      .select("id")
      .single();

    if (tripError) {
      throw tripError;
    }

    await supabase.from("trip_stops").delete().eq("trip_id", tripRow.id);
    await supabase.from("trip_photos").delete().eq("trip_id", tripRow.id);

    const stopsPayload = trip.routeStops.map((stop, index) => ({
      trip_id: tripRow.id,
      stop_order: index,
      label: stop.label,
      stop_type: stop.type,
      notes: stop.notes || null
    }));

    const photosPayload = [
      { trip_id: tripRow.id, storage_path: trip.coverUrl, is_cover: true, sort_order: 0 },
      ...trip.photos.map((photo, index) => ({
        trip_id: tripRow.id,
        storage_path: photo,
        is_cover: false,
        sort_order: index + 1
      }))
    ];

    if (stopsPayload.length) {
      const { error: stopsError } = await supabase.from("trip_stops").insert(stopsPayload);
      if (stopsError) {
        throw stopsError;
      }
    }

    const { error: photosError } = await supabase.from("trip_photos").insert(photosPayload);
    if (photosError) {
      throw photosError;
    }
  }

  console.log(`Seed concluído: ${users.length} perfis e ${trips.length} viagens.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
