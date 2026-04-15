"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, MapPinned } from "lucide-react";

import { RouteRecord } from "@/lib/rebuild/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

async function authFetch(path: string, init?: RequestInit) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

export function HomeRoutesPanel() {
  const { user, loading } = useAuth();
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    setBusy(true);
    setError(null);

    authFetch("/api/routes")
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(payload?.message ?? "Não foi possível carregar suas rotas.");
        }
        return (await response.json()) as RouteRecord[];
      })
      .then(setRoutes)
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Não foi possível carregar suas rotas.");
      })
      .finally(() => {
        setBusy(false);
      });
  }, [loading, user]);

  if (loading) {
    return <p className="text-sm text-muted">Lendo sua sessão...</p>;
  }

  if (!user) {
    return (
      <div className="rounded-[16px] border border-dashed border-border bg-background p-4">
        <p className="text-sm text-muted">Entre na sua conta para começar a salvar rotas na base nova.</p>
        <Link href="/login" className="mt-3 inline-flex h-9 items-center rounded-[10px] bg-accent px-4 text-sm font-semibold text-background">
          Entrar
        </Link>
      </div>
    );
  }

  if (busy) {
    return <p className="text-sm text-muted">Carregando suas rotas...</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (routes.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-border bg-background p-4">
        <p className="text-sm text-muted">Você ainda não salvou nenhuma rota nesta base nova.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <Link
          key={route.id}
          href={`/planejar?route=${route.id}`}
          className="block rounded-[16px] border border-border bg-background p-4 transition hover:border-accent/50"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{route.origin.name}</p>
              <p className="mt-1 truncate text-xs text-muted">{route.destination.name}</p>
            </div>
            <span className="rounded-[10px] border border-border px-2 py-1 text-[11px] text-muted">
              editar
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1">
              <MapPinned size={13} />
              {route.stops.length} parada{route.stops.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1">
              <Clock3 size={13} />
              {route.durationMinutes ? `${route.durationMinutes} min` : "sem tempo calculado"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
