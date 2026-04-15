import { MapPinned } from "lucide-react";

import { RoutePreview } from "@/lib/rebuild/types";

export function RouteMapCard({ preview }: { preview: RoutePreview | null }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-accentSoft">Mapa da rota</p>
          <h2 className="mt-1 text-base font-semibold text-text">Visual principal da viagem</h2>
        </div>
        <div className="rounded-[10px] border border-border bg-background p-2 text-accent">
          <MapPinned size={16} />
        </div>
      </div>

      <div className="relative aspect-[4/5] bg-background">
        {preview?.staticMapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.staticMapUrl} alt="Mapa da rota" className="h-full w-full object-cover" />
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(47,128,237,0.18),transparent_26%),linear-gradient(180deg,#121820_0%,#0B0F14_100%)]">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(147,164,186,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(147,164,186,0.2)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="text-sm leading-6 text-muted">
                O mapa ocupa a maior área da tela. Assim que origem e destino estiverem definidos, a prévia da rota aparece aqui.
              </p>
            </div>
          </div>
        )}

        {preview ? (
          <div className="absolute bottom-3 left-3 right-3 rounded-[14px] border border-border/80 bg-background/92 p-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Distância</p>
                <p className="mt-1 font-semibold text-text">
                  {preview.distanceKm ? `${preview.distanceKm} km` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Tempo</p>
                <p className="mt-1 font-semibold text-text">
                  {preview.durationMinutes ? `${preview.durationMinutes} min` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Fonte</p>
                <p className="mt-1 font-semibold text-text">{preview.live ? "Mapbox" : "Estimativa"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
