import { buildRoutePreview } from "@/lib/rebuild/mapbox";
import { RoutePayload } from "@/lib/rebuild/types";
import { RouteProvider } from "@/lib/search/providers";

const roadRouteProvider: RouteProvider = {
  name: "mapbox",
  buildRoute: buildRoutePreview
};

export async function calculateRoutePreview(payload: RoutePayload) {
  return roadRouteProvider.buildRoute(payload);
}
