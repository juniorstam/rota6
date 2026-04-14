"use client";

import Link from "next/link";
import { Home, Map, PenSquare, Search, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import { AvatarMenu } from "@/components/avatar-menu";
import { cn } from "@/lib/utils";

const desktopItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Search },
  { href: "/planejar", label: "Planejar", icon: Map },
  { href: "/bikers", label: "Bikers", icon: Users },
  { href: "/publicar", label: "Publicar", icon: PenSquare }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.2),rgba(245,158,11,0.06))] text-accent shadow-[0_12px_30px_rgba(245,158,11,0.12)]">
            <Map size={20} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-accentSoft">Rota 6</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {desktopItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                  active ? "bg-accent text-background" : "text-muted hover:bg-surface hover:text-text"
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}
