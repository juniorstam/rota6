import { NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.MAPBOX_ACCESS_TOKEN ?? null;
const MAPBOX_STYLE_OWNER = process.env.MAPBOX_STYLE_OWNER ?? "mapbox";
const MAPBOX_STYLE_ID = process.env.MAPBOX_STYLE_ID ?? "dark-v11";

export async function GET() {
  return NextResponse.json({
    token: MAPBOX_TOKEN,
    styleUrl: `mapbox://styles/${MAPBOX_STYLE_OWNER}/${MAPBOX_STYLE_ID}`
  });
}
