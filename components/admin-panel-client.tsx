"use client";

import Link from "next/link";

import { useAuth } from "@/providers/auth-provider";

const moderationQueues = [
  {
    title: "Pontos aguardando revisão",
    items: ["Oficina Estrada Livre", "Parada Km 82 - trecho com cascalho"]
  },
  {
    title: "Avaliações sinalizadas",
    items: ["Comentário com informação desatualizada sobre hospedagem", "Review sem contexto de segurança"]
  },
  {
    title: "Viagens para moderação",
    items: ["Circuito do Vale Europeu", "Estrada Real em grupo"]
  }
];

export function AdminPanelClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="rounded-[32px] border border-border bg-surface p-8 text-sm text-muted">
        Carregando permissoes do painel...
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-[32px] border border-border bg-surface p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Painel Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Entre para acessar a administração</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Esta área é restrita ao perfil administrador do sistema.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            Entrar
          </Link>
        </div>
      </section>
    );
  }

  if (!user.isAdmin) {
    return (
      <section className="rounded-[32px] border border-border bg-surface p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Painel Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Acesso restrito</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Seu perfil está autenticado, mas não tem permissão administrativa.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/perfil/${user.username}`}
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-text"
          >
            Voltar ao perfil
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Painel Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Moderação inicial do sistema</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Este painel já fica visível apenas para administradores. O próximo passo é ligar aqui as ações de editar,
          excluir e moderar usuários e publicações no banco real.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {moderationQueues.map((queue) => (
          <section key={queue.title} className="rounded-[28px] border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold text-text">{queue.title}</h2>
            <div className="mt-4 space-y-3">
              {queue.items.map((item) => (
                <article key={item} className="rounded-[20px] border border-border bg-background/60 p-4">
                  <p className="text-sm text-text">{item}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
