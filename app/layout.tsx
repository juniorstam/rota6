import type { Metadata } from "next";

import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { listFollowMapFromDb } from "@/lib/repositories/follow-repository";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { AuthProvider } from "@/providers/auth-provider";
import { FavoritesProvider } from "@/providers/favorites-provider";
import { FollowingProvider } from "@/providers/following-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Rota 6",
  description: "Rota 6 é o radar de estrada para planejar viagens de moto com paradas confiáveis e dicas reais."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialFollowState = hasSupabaseEnv() ? await listFollowMapFromDb().catch(() => ({})) : {};

  return (
    <html lang="pt-BR">
      <body className="bg-background text-text">
        <AuthProvider>
          <FollowingProvider initialState={initialFollowState}>
            <FavoritesProvider>
              <Header />
              <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-6 md:px-6 md:pb-14">{children}</main>
              <MobileNav />
            </FavoritesProvider>
          </FollowingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
