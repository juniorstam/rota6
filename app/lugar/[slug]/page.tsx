import { notFound } from "next/navigation";

import { PhotoGallery } from "@/components/photo-gallery";
import { ReviewCard } from "@/components/review-card";
import { places } from "@/lib/mock-data";

export default async function PlaceDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = places.find((entry) => entry.slug === slug);

  if (!place) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">{place.category}</p>
        <h1 className="mt-2 text-4xl font-semibold text-text">{place.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{place.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-background px-4 py-2 text-sm text-muted">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Endereço</p>
            <p className="mt-2 text-sm text-text">{place.address}</p>
          </div>
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Cidade</p>
            <p className="mt-2 text-sm text-text">
              {place.city}, {place.state}
            </p>
          </div>
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Nota média</p>
            <p className="mt-2 text-xl font-semibold text-text">{place.averageRating.toFixed(1)}</p>
          </div>
          <div className="rounded-[22px] border border-border bg-background/60 p-4">
            <p className="text-xs text-muted">Origem do cadastro</p>
            <p className="mt-2 text-sm capitalize text-text">{place.createdBy}</p>
          </div>
        </div>
      </section>

      <PhotoGallery photos={place.photos} />

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Avaliações</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">O que motociclistas disseram</h2>
        </div>

        {place.reviews.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {place.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Ainda não há avaliações para este lugar. O modelo de review do MVP já está preparado para segurança da
            moto, grupos, estrutura e percepção de preço.
          </div>
        )}
      </section>
    </div>
  );
}
