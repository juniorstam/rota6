import { TripRoadLevel, TripType } from "@/lib/types";

export const tripTypeLabels: Record<TripType, string> = {
  solo: "Solo",
  casal: "Casal",
  grupo: "Grupo"
};

export const roadLevelLabels: Record<TripRoadLevel, string> = {
  tranquila: "Estrada tranquila",
  moderada: "Estrada moderada",
  tecnica: "Estrada técnica"
};
