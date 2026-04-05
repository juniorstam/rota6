import { NextRequest, NextResponse } from "next/server";

import { getPlacesAlongRoute } from "@/lib/server/mapbox";
import { RouteResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const route = (await request.json()) as RouteResult;
  return NextResponse.json(getPlacesAlongRoute(route));
}
