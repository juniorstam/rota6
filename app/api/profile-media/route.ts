import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

const PROFILE_MEDIA_BUCKET = "profile-media";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Sessao ausente." }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user?.id) {
      return NextResponse.json({ error: "Sessao invalida ou expirada." }, { status: 401 });
    }

    const formData = await request.formData();
    const type = formData.get("type");
    const file = formData.get("file");

    if (type !== "avatar" && type !== "cover") {
      return NextResponse.json({ error: "Tipo de imagem invalido." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo nao enviado." }, { status: 400 });
    }

    const extension = file.type.includes("png") ? "png" : "jpg";
    const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || type;
    const filePath = `${type}s/${user.id}/${Date.now()}-${fileName}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_MEDIA_BUCKET)
      .upload(filePath, Buffer.from(arrayBuffer), {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/jpeg"
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: uploadError.message.includes("Bucket not found")
            ? "O bucket profile-media ainda nao existe no Supabase Storage."
            : uploadError.message
        },
        { status: 400 }
      );
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ publicUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel enviar a imagem agora."
      },
      { status: 500 }
    );
  }
}
