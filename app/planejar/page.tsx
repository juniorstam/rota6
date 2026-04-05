import { RoutePlanner } from "@/components/route-planner";
import { defaultRoute } from "@/lib/mock-data";

export default function PlanPage() {
  return <RoutePlanner initialRoute={defaultRoute} />;
}
