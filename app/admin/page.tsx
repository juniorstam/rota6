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

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Painel Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Moderação inicial do MVP</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Área protegida prevista para moderar pontos, avaliações, viagens, categorias e destaques. Nesta fase,
          o painel funciona como estrutura navegável e pronto para conectar regras de permissão no backend.
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
