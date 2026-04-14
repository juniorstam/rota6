import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { upsertTrip } from "@/lib/repositories/trip-write-service";

async function getAuthenticatedUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    throw new Error("Sessao ausente.");
  }

  const supabase = createSupabaseAdminClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Sessao invalida.");
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const result = await upsertTrip({
      tripId: body.tripId ?? null,
      userId: user.id,
      username: String(body.username ?? user.email?.split("@")[0] ?? "motociclista"),
      title: String(body.title ?? "").trim(),
      summary: String(body.summary ?? "").trim(),
      origin: String(body.origin ?? "").trim(),
      destination: String(body.destination ?? "").trim(),
      tripType: body.tripType,
      roadLevel: body.roadLevel,
      visibility: body.visibility,
      tags: Array.isArray(body.tags) ? body.tags : [],
      tips: Array.isArray(body.tips) ? body.tips : [],
      stops: Array.isArray(body.stops) ? body.stops : [],
      coverPhoto: body.coverPhoto ?? null,
      galleryPhotos: Array.isArray(body.galleryPhotos) ? body.galleryPhotos : []
    });

    return NextResponse.json({ ...result, isAdmin: isAdminEmail(user.email) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel publicar a viagem.";
    const status = message.includes("Sessao") ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
