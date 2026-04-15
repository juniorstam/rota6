import { Suspense } from "react";

import { RoutePlannerScreen } from "@/components/rebuild/route-planner-screen";

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <section className="rounded-[20px] border border-border bg-surface p-5 text-sm text-muted">
          Carregando planejador...
        </section>
      }
    >
      <RoutePlannerScreen />
    </Suspense>
  );
}
