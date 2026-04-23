import { NextRequest, NextResponse } from "next/server";

import { RoutePayload } from "@/lib/rebuild/types";
import { calculateRoutePreview } from "@/lib/route/route-service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RoutePayload;

  if (!body.origin?.name || !body.destination?.name) {
    return NextResponse.json({ message: "Origem e destino são obrigatórios." }, { status: 400 });
  }

  try {
    const preview = await calculateRoutePreview(body);
    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Não foi possível calcular a rota."
      },
      { status: 500 }
    );
  }
}
