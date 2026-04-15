import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { RoutePayload, RouteRecord, RouteStopInput } from "@/lib/rebuild/types";

function mapStopRow(row: {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  order_index: number;
}): RouteStopInput {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    type: row.type as RouteStopInput["type"],
    orderIndex: row.order_index
  };
}

function mapRouteRow(row: {
  id: string;
  user_id: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
  route_stops?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    order_index: number;
  }>;
}): RouteRecord {
  return {
    id: row.id,
    userId: row.user_id,
    origin: {
      name: row.origin_name,
      lat: row.origin_lat,
      lng: row.origin_lng
    },
    destination: {
      name: row.destination_name,
      lat: row.destination_lat,
      lng: row.destination_lng
    },
    distanceKm: row.distance_km,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stops: (row.route_stops ?? [])
      .map(mapStopRow)
      .sort((left, right) => left.orderIndex - right.orderIndex)
  };
}

export async function listRoutesForUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("routes")
    .select(
      "id,user_id,origin_name,origin_lat,origin_lng,destination_name,destination_lat,destination_lng,distance_km,duration_minutes,created_at,updated_at,route_stops(id,name,lat,lng,type,order_index)"
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapRouteRow(row as never));
}

export async function getRouteForUser(routeId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("routes")
    .select(
      "id,user_id,origin_name,origin_lat,origin_lng,destination_name,destination_lat,destination_lng,distance_km,duration_minutes,created_at,updated_at,route_stops(id,name,lat,lng,type,order_index)"
    )
    .eq("id", routeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRouteRow(data as never) : null;
}

export async function saveRouteForUser(payload: RoutePayload, userId: string, routeId?: string) {
  const supabase = createSupabaseAdminClient();

  const routeRow = {
    ...(routeId ? { id: routeId } : {}),
    user_id: userId,
    origin_name: payload.origin.name,
    origin_lat: payload.origin.lat,
    origin_lng: payload.origin.lng,
    destination_name: payload.destination.name,
    destination_lat: payload.destination.lat,
    destination_lng: payload.destination.lng,
    distance_km: payload.distanceKm,
    duration_minutes: payload.durationMinutes
  };

  const { data: savedRoute, error: routeError } = await supabase
    .from("routes")
    .upsert(routeRow as never, { onConflict: "id" })
    .select("id")
    .single();

  if (routeError) {
    throw new Error(routeError.message);
  }

  const nextRouteId = savedRoute.id as string;

  const { error: deleteError } = await supabase.from("route_stops").delete().eq("route_id", nextRouteId);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (payload.stops.length > 0) {
    const stopRows = payload.stops.map((stop, index) => ({
      route_id: nextRouteId,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      type: stop.type,
      order_index: index
    }));

    const { error: stopsError } = await supabase.from("route_stops").insert(stopRows as never);
    if (stopsError) {
      throw new Error(stopsError.message);
    }
  }

  const route = await getRouteForUser(nextRouteId, userId);
  if (!route) {
    throw new Error("Não foi possível carregar a rota salva.");
  }

  return route;
}
