import { NextRequest, NextResponse } from "next/server";

import { reverseGeocode } from "@/lib/server/mapbox";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ message: "Latitude/longitude inválidas." }, { status: 400 });
  }

  try {
    const label = await reverseGeocode(latitude, longitude);
    return NextResponse.json({ label });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao converter coordenadas em endereço." },
      { status: 500 }
    );
  }
}
