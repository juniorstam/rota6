import { NextRequest, NextResponse } from "next/server";

import { suggestHybridLocations } from "@/lib/search/hybrid-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const places = await suggestHybridLocations({
      query,
      sessionToken: crypto.randomUUID()
    });
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
