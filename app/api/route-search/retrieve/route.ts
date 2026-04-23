import { NextRequest, NextResponse } from "next/server";

import { retrieveHybridLocation } from "@/lib/search/hybrid-search";

export async function GET(request: NextRequest) {
  const mapboxId = request.nextUrl.searchParams.get("id")?.trim() ?? "";
  const sessionToken = request.nextUrl.searchParams.get("session_token") ?? "";

  if (!mapboxId || !sessionToken) {
    return NextResponse.json({ message: "Sugestão inválida." }, { status: 400 });
  }

  try {
    const location = await retrieveHybridLocation({ id: mapboxId, sessionToken });

    if (!location) {
      return NextResponse.json({ message: "Não foi possível abrir essa sugestão." }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Não foi possível abrir essa sugestão."
      },
      { status: 500 }
    );
  }
}
