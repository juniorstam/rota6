import { notFound } from "next/navigation";

import { PhotoGallery } from "@/components/photo-gallery";
import { UserProfileHeader } from "@/components/user-profile-header";
import { getProfileByUsername, getProfilePhotos } from "@/lib/profile-data";

export default async function ProfilePhotosPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const profilePhotos = getProfilePhotos(profile.id);

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile} />

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Fotos</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Registros de estrada de {profile.name}</h1>
        </div>

        {profilePhotos.length > 0 ? (
          <PhotoGallery photos={profilePhotos} />
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não publicou fotos.
          </div>
        )}
      </section>
    </div>
  );
}
