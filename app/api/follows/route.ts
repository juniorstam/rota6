import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ensureFollowingState, listFollowMapFromDb } from "@/lib/repositories/follow-repository";

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

export async function GET() {
  try {
    const followingMap = await listFollowMapFromDb();
    return NextResponse.json({ followingMap });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel carregar os follows.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const targetUserId = String(body.targetUserId ?? "").trim();
    const shouldFollow = Boolean(body.shouldFollow);

    if (!targetUserId) {
      throw new Error("Destino do follow nao informado.");
    }

    await ensureFollowingState({
      followerId: user.id,
      followedId: targetUserId,
      shouldFollow
    });

    const followingMap = await listFollowMapFromDb();
    return NextResponse.json({ followingMap });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o follow.";
    const status = message.includes("Sessao") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
