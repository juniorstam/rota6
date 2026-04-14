import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin";
import {
  deleteOwnedTrip,
  getOwnedTripForEditing,
  updateTripVisibility,
  upsertTrip
} from "@/lib/repositories/trip-write-service";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

export async function GET(request: NextRequest, context: { params: Promise<{ tripId: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    const { tripId } = await context.params;
    const trip = await getOwnedTripForEditing({
      tripId,
      userId: user.id,
      isAdmin: isAdminEmail(user.email)
    });

    if (!trip) {
      return NextResponse.json({ error: "Viagem nao encontrada." }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel carregar a viagem.";
    const status = message.includes("Sessao") ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ tripId: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    const { tripId } = await context.params;
    const body = await request.json();

    if (body.visibility && !body.title) {
      await updateTripVisibility({
        tripId,
        userId: user.id,
        visibility: body.visibility,
        isAdmin: isAdminEmail(user.email)
      });

      return NextResponse.json({ ok: true });
    }

    const result = await upsertTrip({
      tripId,
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

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar a viagem.";
    const status = message.includes("Sessao") ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ tripId: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    const { tripId } = await context.params;

    await deleteOwnedTrip({
      tripId,
      userId: user.id,
      isAdmin: isAdminEmail(user.email)
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel apagar a viagem.";
    const status = message.includes("Sessao") ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
