import { FavoritesClient } from "@/components/favorites-client";

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Favoritos</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Organize pontos, roteiros e viagens em listas simples</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Seus favoritos agora ficam salvos no navegador e alimentam esta página enquanto preparamos a persistência no banco.
        </p>
      </section>

      <FavoritesClient />
    </div>
  );
}
