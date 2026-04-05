import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">404</p>
      <h1 className="mt-2 text-4xl font-semibold text-text">Conteúdo não encontrado</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        O item pode ter sido removido ou ainda não foi publicado no MVP demonstrativo.
      </p>
      <Link href="/" className="mt-6 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background">
        Voltar para a home
      </Link>
    </div>
  );
}
