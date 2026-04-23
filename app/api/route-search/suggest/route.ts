import { NextRequest, NextResponse } from "next/server";

import { suggestHybridLocations } from "@/lib/search/hybrid-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const sessionToken = request.nextUrl.searchParams.get("session_token") ?? crypto.randomUUID();
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const proximity = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await suggestHybridLocations({ query, sessionToken, proximity });
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Não foi possível buscar sugestões agora."
      },
      { status: 500 }
    );
  }
}
