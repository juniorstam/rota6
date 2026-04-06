import Link from "next/link";
import { Camera, FileText, Route } from "lucide-react";

export default function PublishTripPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-surface p-5 shadow-glow md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Publicar</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Publique uma viagem que voce ja fez</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Esta area vai reunir o fluxo para montar o relato da viagem, subir fotos, organizar as paradas e transformar o
          percurso feito em um roteiro util para outros motociclistas.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-border bg-surface p-5 shadow-glow">
          <Route size={18} className="text-accent" />
          <h2 className="mt-4 text-lg font-semibold text-text">Monte o roteiro</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Titulo, origem, destino, paradas e nivel da estrada.
          </p>
        </article>

        <article className="rounded-[24px] border border-border bg-surface p-5 shadow-glow">
          <Camera size={18} className="text-accent" />
          <h2 className="mt-4 text-lg font-semibold text-text">Adicione fotos</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Registre a viagem com capa e galeria para dar contexto visual ao caminho.
          </p>
        </article>

        <article className="rounded-[24px] border border-border bg-surface p-5 shadow-glow">
          <FileText size={18} className="text-accent" />
          <h2 className="mt-4 text-lg font-semibold text-text">Compartilhe as dicas</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Conte o que valeu a pena, o que evitar e quais pontos ajudam na estrada.
          </p>
        </article>
      </section>

      <section className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
        Fluxo completo de publicacao sera o proximo passo. Enquanto isso, voce pode planejar uma rota em{" "}
        <Link href="/planejar" className="text-text underline">
          Planejar
        </Link>
        .
      </section>
    </div>
  );
}
