import { NextRequest, NextResponse } from "next/server";

import { getStaticViewportMapUrl } from "@/lib/rebuild/mapbox";

export async function GET(request: NextRequest) {
  const latValue = request.nextUrl.searchParams.get("lat");
  const lngValue = request.nextUrl.searchParams.get("lng");

  const lat = latValue ? Number(latValue) : null;
  const lng = lngValue ? Number(lngValue) : null;

  const mapUrl =
    lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
      ? getStaticViewportMapUrl({ lat, lng })
      : getStaticViewportMapUrl();

  return NextResponse.json({ mapUrl });
}
