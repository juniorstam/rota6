import type { Metadata } from "next";

import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { AuthProvider } from "@/providers/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Rota 6",
  description: "Rota 6 é o radar de estrada para planejar viagens de moto com paradas confiáveis e dicas reais."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text">
        <AuthProvider>
          <Header />
          <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-6 md:px-6 md:pb-14">{children}</main>
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
