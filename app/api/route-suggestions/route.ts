import { NextRequest, NextResponse } from "next/server";

import { suggestPlacesAlongRoute } from "@/lib/places/route-suggestions";
import { RoutePayload } from "@/lib/rebuild/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    payload?: RoutePayload;
    geometry?: Array<{ lat: number; lng: number }>;
    category?: Parameters<typeof suggestPlacesAlongRoute>[0]["category"];
  };

  if (!body.payload?.origin || !body.payload?.destination) {
    return NextResponse.json({ message: "Rota inválida." }, { status: 400 });
  }

  return NextResponse.json(
    suggestPlacesAlongRoute({
      payload: body.payload,
      geometry: body.geometry ?? [],
      category: body.category
    })
  );
}
