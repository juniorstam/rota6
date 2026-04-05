import { NextRequest, NextResponse } from "next/server";

import { getFallbackRoute, getLiveRoute } from "@/lib/server/mapbox";
import { RouteRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RouteRequest;

  if (!body.origin?.trim() || !body.destination?.trim()) {
    return NextResponse.json({ message: "Origem e destino são obrigatórios." }, { status: 400 });
  }

  try {
    const route = await getLiveRoute(body);
    return NextResponse.json(route);
  } catch {
    const fallback = getFallbackRoute(body);
    return NextResponse.json(fallback);
  }
}
