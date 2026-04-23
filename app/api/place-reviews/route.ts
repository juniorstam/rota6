import { NextRequest, NextResponse } from "next/server";

import { savePlaceReview } from "@/lib/places/place-review-repository";
import { getApiUserIdFromAuthHeader } from "@/lib/rebuild/api-auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getApiUserIdFromAuthHeader(request.headers.get("authorization"));
    const body = (await request.json()) as {
      placeId?: string;
      rating?: number;
      comment?: string;
      tags?: string[];
    };

    if (!body.placeId || !body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ message: "Avaliação inválida." }, { status: 400 });
    }

    const review = await savePlaceReview({
      placeId: body.placeId,
      userId,
      rating: body.rating,
      comment: body.comment,
      tags: body.tags ?? []
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Não foi possível salvar a avaliação." },
      { status: 400 }
    );
  }
}
