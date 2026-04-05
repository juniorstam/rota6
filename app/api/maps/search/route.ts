import { NextRequest, NextResponse } from "next/server";

import { searchPlaces } from "@/lib/server/mapbox";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const places = await searchPlaces(query);
    return NextResponse.json(places);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao buscar lugares." },
      { status: 500 }
    );
  }
}
