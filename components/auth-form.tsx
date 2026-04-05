"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/providers/auth-provider";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, signup, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("junior@rota6.dev");
  const [password, setPassword] = useState("123456");
  const [name, setName] = useState("Novo motociclista");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "login") {
      await login({ email, password });
    } else {
      await signup({ email, password, name });
    }

    setLoading(false);
    router.push("/");
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-[32px] border border-border bg-surface p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">
          {mode === "login" ? "Entrar" : "Cadastro"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-text">
          {mode === "login" ? "Entre no seu radar de viagem" : "Comece a montar seu mapa pessoal de estrada"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Acesse roteiros, listas salvas e recomendações práticas publicadas por outros motociclistas."
            : "Cadastre-se para salvar rotas, publicar viagens e construir seu histórico dentro da Rota 6."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Nome</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm text-muted">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-muted">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-14 w-full items-center justify-center rounded-[22px] bg-accent text-sm font-semibold text-background"
        >
          {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <Link href={mode === "login" ? "/cadastro" : "/login"} className="text-text">
          {mode === "login" ? "Criar conta" : "Já tenho conta"}
        </Link>

        {mode === "login" && (
          <button
            type="button"
            className="text-muted underline underline-offset-4"
            onClick={async () => setMessage(await requestPasswordReset(email))}
          >
            Esqueci a senha
          </button>
        )}
      </div>

      {message && <p className="mt-4 rounded-2xl bg-background px-4 py-3 text-sm text-muted">{message}</p>}
    </section>
  );
}
