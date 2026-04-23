"use client";

import Link from "next/link";
import { Home, Map, PenSquare, Search, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Search },
  { href: "/planejar", label: "Planejar", icon: Map },
  { href: "/bikers", label: "Bikers", icon: Users },
  { href: "/publicar", label: "Publicar", icon: PenSquare }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[rgba(10,16,24,0.92)] px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-16px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={cn(
                "flex h-11 items-center justify-center rounded-full transition",
                active ? "bg-accent text-background shadow-[0_10px_30px_rgba(47,128,237,0.32)]" : "text-muted"
              )}
            >
              <Icon size={18} strokeWidth={2.1} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
