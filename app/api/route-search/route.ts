import { NextRequest, NextResponse } from "next/server";

import { searchLocations } from "@/lib/rebuild/mapbox";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const places = await searchLocations(query);
    return NextResponse.json(places);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Não foi possível buscar locais agora."
      },
      { status: 500 }
    );
  }
}
