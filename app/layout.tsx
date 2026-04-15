import type { Metadata } from "next";

import { RebuildHeader } from "@/components/rebuild/rebuild-header";
import { AuthProvider } from "@/providers/auth-provider";
import { FavoritesProvider } from "@/providers/favorites-provider";
import { FollowingProvider } from "@/providers/following-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Rota 6",
  description: "Rota 6 é um app de planejamento de rota para motociclistas, com foco total em traçar, editar e salvar trajetos."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text">
        <AuthProvider>
          <FollowingProvider initialState={{}}>
            <FavoritesProvider>
              <div className="app-shell">
                <RebuildHeader />
                <main className="mobile-frame pb-10">{children}</main>
              </div>
            </FavoritesProvider>
          </FollowingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
