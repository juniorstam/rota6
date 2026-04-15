"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.push("/");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível entrar agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-accentSoft">Acesso</p>
      <h1 className="mt-2 text-2xl font-semibold text-text">Entrar</h1>
      <p className="mt-2 text-sm text-muted">Use sua conta para salvar e editar suas rotas.</p>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">E-mail</span>
          <input
            className="h-11 w-full rounded-[12px] border border-border bg-background px-3 text-sm text-text outline-none transition focus:border-accent"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Senha</span>
          <input
            className="h-11 w-full rounded-[12px] border border-border bg-background px-3 text-sm text-text outline-none transition focus:border-accent"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-accent px-4 text-sm font-semibold text-background disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-accentSoft">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
