"use client";

import Link from "next/link";
import { Home, Map, Search, UserCircle2, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Search },
  { href: "/planejar", label: "Criar", icon: Map },
  { href: "/bikers", label: "Bikers", icon: Users },
  { href: "/perfil/junior", label: "Perfil", icon: UserCircle2 }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[28px] border border-border/80 bg-surface/95 p-2 shadow-glow backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition",
                active ? "bg-accent text-background" : "text-muted"
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
