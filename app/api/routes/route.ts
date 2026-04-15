import { NextRequest, NextResponse } from "next/server";

import { getApiUserIdFromAuthHeader } from "@/lib/rebuild/api-auth";
import { listRoutesForUser, saveRouteForUser } from "@/lib/rebuild/route-repository";
import { RoutePayload } from "@/lib/rebuild/types";

export async function GET(request: NextRequest) {
  try {
    const userId = await getApiUserIdFromAuthHeader(request.headers.get("authorization"));
    const routes = await listRoutesForUser(userId);
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Sessão inválida." },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getApiUserIdFromAuthHeader(request.headers.get("authorization"));
    const body = (await request.json()) as RoutePayload;
    const route = await saveRouteForUser(body, userId);
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Não foi possível salvar a rota." },
      { status: 400 }
    );
  }
}
