export const DEFAULT_TRIP_COVER_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff5ec" />
          <stop offset="100%" stop-color="#f7d9ba" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" rx="48" fill="url(#bg)" />
      <circle cx="1290" cy="180" r="140" fill="#ff7a1a" opacity="0.18" />
      <circle cx="260" cy="720" r="200" fill="#ffffff" opacity="0.55" />
      <path d="M0 650C150 590 280 560 430 580C610 603 710 710 900 720C1115 731 1260 590 1600 500V900H0Z" fill="#ffffff" opacity="0.72" />
      <text x="120" y="390" fill="#1b2740" font-size="92" font-family="Arial, sans-serif" font-weight="700">Rota 6</text>
      <text x="120" y="485" fill="#5d7091" font-size="42" font-family="Arial, sans-serif">Capa temporária da viagem</text>
      <text x="120" y="545" fill="#5d7091" font-size="34" font-family="Arial, sans-serif">A imagem original não está disponível agora.</text>
    </svg>
  `);

const BROKEN_TRIP_IMAGE_REPLACEMENTS: Record<string, string> = {
  "https://images.unsplash.com/photo-1500534314209-a26db0f5b4aa?auto=format&fit=crop&w=1400&q=80":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
};

export function sanitizeTripCoverUrl(url?: string | null) {
  if (!url) {
    return DEFAULT_TRIP_COVER_URL;
  }

  return BROKEN_TRIP_IMAGE_REPLACEMENTS[url] ?? url;
}
