import { RoutePlanner } from "@/components/route-planner";
import { defaultRoute } from "@/lib/mock-data";

export default async function PlanPage({
  searchParams
}: {
  searchParams: Promise<{ origem?: string; destino?: string; parada?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawStops = params.parada;
  const initialStops = Array.isArray(rawStops) ? rawStops : rawStops ? [rawStops] : undefined;

  return (
    <RoutePlanner
      initialRoute={defaultRoute}
      initialOrigin={params.origem}
      initialDestination={params.destino}
      initialStops={initialStops}
    />
  );
}
