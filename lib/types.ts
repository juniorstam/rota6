export type TravelStyle = "solo" | "casal" | "grupo" | "bate-volta" | "longa-distancia";
export type TripRoadLevel = "tranquila" | "moderada" | "tecnica";
export type TripType = "solo" | "casal" | "grupo";
export type PlaceCategory =
  | "restaurante"
  | "pousada"
  | "posto"
  | "oficina"
  | "parada-panoramica"
  | "ponto-turistico"
  | "alerta";
export type PricePerception = "barato" | "medio" | "caro";
export type StructureLevel = "ruim" | "ok" | "boa" | "otima";

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  city: string;
  state: string;
  motorcycle: string;
  bio: string;
  travelStyle: TravelStyle;
  publishedTripsCount: number;
  publishedRecommendationsCount: number;
}

export interface PlaceReview {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  rating: number;
  comment: string;
  photos?: string[];
  safeForMotorcycle: boolean;
  goodForGroups: boolean;
  pricePerception: PricePerception;
  travelerStructure: StructureLevel;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photos: string[];
  averageRating: number;
  tags: string[];
  createdBy: "usuario" | "admin";
  featured?: boolean;
  reviews: PlaceReview[];
}

export interface TripStop {
  id: string;
  name: string;
  city: string;
  state: string;
  type: "parada" | "combustivel" | "paisagem" | "hospedagem";
  notes?: string;
}

export interface PublishedTrip {
  id: string;
  slug: string;
  title: string;
  origin: string;
  destination: string;
  summary: string;
  coverUrl: string;
  photos: string[];
  routeStops: TripStop[];
  tips: string[];
  roadLevel: TripRoadLevel;
  tripType: TripType;
  publicVisibility: boolean;
  author: Pick<UserProfile, "id" | "username" | "name" | "avatarUrl" | "motorcycle">;
  distanceKm: number;
  durationHours: number;
  commentsCount: number;
}

export interface FavoriteList {
  id: string;
  name: string;
  itemIds: string[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  city?: string;
  state?: string;
  fullAddress: string;
  coordinates?: Coordinates;
}

export interface RouteRequest {
  origin: string;
  destination: string;
  stops: string[];
}

export interface RouteSuggestion {
  id: string;
  name: string;
  category: PlaceCategory;
  distanceFromRouteKm: number;
  reason: string;
}

export interface RouteResult {
  polyline: Coordinates[];
  distanceKm: number;
  durationHours: number;
  summary: string;
  suggestedPlaces: RouteSuggestion[];
  origin?: PlaceSearchResult;
  destination?: PlaceSearchResult;
  stops?: PlaceSearchResult[];
  usingLiveRouting?: boolean;
  mapImageUrl?: string | null;
}
