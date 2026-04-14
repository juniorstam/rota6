"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

async function loadImage(file: File) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nao foi possivel ler a imagem selecionada."));
    };

    image.src = objectUrl;
  });
}

export async function optimizeImageFile(
  file: File,
  {
    maxWidth,
    maxHeight,
    quality = 0.82
  }: {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
  }
) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel preparar a compressao da imagem.");
  }

  const widthRatio = maxWidth / image.width;
  const heightRatio = maxHeight / image.height;
  const ratio = Math.min(widthRatio, heightRatio, 1);
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error("Nao foi possivel gerar a imagem otimizada."));
          return;
        }

        resolve(nextBlob);
      },
      "image/jpeg",
      quality
    );
  });

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg"
  });
}

export async function uploadProfileImage({
  file,
  type
}: {
  file: File;
  type: "avatar" | "cover";
}) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error("Sua sessao expirou. Entre novamente antes de enviar imagens.");
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sua sessao expirou. Entre novamente antes de enviar imagens.");
  }

  const optimizedFile =
    type === "avatar"
      ? await optimizeImageFile(file, { maxWidth: 512, maxHeight: 512, quality: 0.82 })
      : await optimizeImageFile(file, { maxWidth: 1600, maxHeight: 900, quality: 0.84 });
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", optimizedFile);

  const response = await fetch("/api/profile-media", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`
    },
    body: formData
  });

  const payload = (await response.json().catch(() => null)) as { publicUrl?: string; error?: string } | null;

  if (!response.ok || !payload?.publicUrl) {
    throw new Error(payload?.error ?? "Nao foi possivel enviar a imagem agora.");
  }

  return payload.publicUrl;
}
