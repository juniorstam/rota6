"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Settings, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/providers/auth-provider";

export function AvatarMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const activeUser = user;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-background/70"
        aria-label="Abrir menu do usuário"
      >
        {activeUser?.avatarUrl ? (
          <div className="relative h-full w-full">
            <Image src={activeUser.avatarUrl} alt={activeUser.name} fill className="object-cover" />
          </div>
        ) : (
          <Menu size={18} className="text-muted" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-[24px] border border-border bg-surface shadow-glow">
          <div className="border-b border-border px-4 py-4">
            <p className="font-medium text-text">{activeUser ? activeUser.name : "Visitante"}</p>
            <p className="text-sm text-muted">{activeUser ? `@${activeUser.username}` : "Entre para acessar sua conta"}</p>
          </div>

          <div className="p-2">
            {activeUser ? (
              <>
            <Link
              href={`/perfil/${activeUser.username}`}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <User size={16} />
              Meu perfil
            </Link>
            <Link
              href="/perfil/editar"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} />
              Editar perfil
            </Link>
            <Link
              href={`/perfil/${activeUser.username}`}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <User size={16} />
              Minhas viagens
            </Link>
            <Link
              href={`/perfil/${activeUser.username}/fotos`}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <User size={16} />
              Minhas fotos
            </Link>
            <Link
              href="/favoritos"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <User size={16} />
              Favoritos
            </Link>
            <Link
              href={`/perfil/${activeUser.username}/seguidores`}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <Users size={16} />
              Seguidores
            </Link>
            <Link
              href={`/perfil/${activeUser.username}/seguindo`}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <Users size={16} />
              Seguindo
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} />
              Configurações
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
                router.push("/login");
                router.refresh();
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-text transition hover:bg-background/60"
            >
              <Settings size={16} />
              Sair
            </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
                  onClick={() => setOpen(false)}
                >
                  <User size={16} />
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text transition hover:bg-background/60"
                  onClick={() => setOpen(false)}
                >
                  <User size={16} />
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
