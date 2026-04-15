import { NextRequest, NextResponse } from "next/server";

import { getApiUserIdFromAuthHeader } from "@/lib/rebuild/api-auth";
import { getRouteForUser, saveRouteForUser } from "@/lib/rebuild/route-repository";
import { RoutePayload } from "@/lib/rebuild/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  try {
    const userId = await getApiUserIdFromAuthHeader(request.headers.get("authorization"));
    const { routeId } = await params;
    const route = await getRouteForUser(routeId, userId);

    if (!route) {
      return NextResponse.json({ message: "Rota não encontrada." }, { status: 404 });
    }

    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Sessão inválida." },
      { status: 401 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  try {
    const userId = await getApiUserIdFromAuthHeader(request.headers.get("authorization"));
    const { routeId } = await params;
    const body = (await request.json()) as RoutePayload;
    const route = await saveRouteForUser(body, userId, routeId);
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Não foi possível atualizar a rota." },
      { status: 400 }
    );
  }
}
