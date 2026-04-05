import Image from "next/image";
import { Navigation, ShieldAlert } from "lucide-react";

interface MapViewProps {
  polyline?: Array<{ lat: number; lng: number }>;
  title?: string;
  subtitle?: string;
  mapImageUrl?: string | null;
  live?: boolean;
}

export function MapView({
  polyline = [],
  title = "Mapa da rota",
  subtitle = "Camada de mapa preparada para integrar Mapbox, Google Maps ou OpenStreetMap sem acoplar o produto.",
  mapImageUrl,
  live = false
}: MapViewProps) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-border bg-surface">
      <div className="relative min-h-[360px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_30%),linear-gradient(180deg,#172033_0%,#0a111d_100%)] p-6">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative flex h-full flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accentSoft">Mapa</p>
              <h3 className="mt-2 text-2xl font-semibold text-text">{title}</h3>
              <p className="mt-2 max-w-xl text-sm text-muted">{subtitle}</p>
            </div>
            <div className="rounded-full border border-border bg-background/60 p-3 text-accent">
              <Navigation size={18} />
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-background/20 p-5">
            <div className="absolute inset-0 rounded-[28px] border border-white/5" />
            {mapImageUrl ? (
              <div className="absolute inset-0">
                <Image src={mapImageUrl} alt="Mapa da rota" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/15 to-transparent" />
              </div>
            ) : null}
            <div className="relative flex h-full min-h-52 items-end justify-between">
              {polyline.length > 0 ? (
                polyline.map((point, index) => (
                  <div key={`${point.lat}-${point.lng}`} className="flex flex-col items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-accent/15" />
                    {index < polyline.length - 1 && <div className="h-16 w-px bg-white/20 md:h-24" />}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted">Nenhum caminho carregado ainda.</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2">
              geolocalização com consentimento
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2">
              {live ? "rota calculada com provedor real" : "modo demo sem token configurado"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 text-danger">
              <ShieldAlert size={14} />
              tracking em background previsto para V2
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
