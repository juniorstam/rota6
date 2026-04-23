const GENERIC_PLACE_WORDS = new Set([
  "bar",
  "bares",
  "cafe",
  "cafeteria",
  "hotel",
  "hoteis",
  "pousada",
  "pousadas",
  "posto",
  "postos",
  "restaurante",
  "restaurantes",
  "rodovia",
  "rua",
  "avenida",
  "av",
  "estrada",
  "via",
  "km"
]);

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function createSearchSlug(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, "-");
}

export function tokenizeSearch(value: string) {
  return normalizeSearchText(value).split(/\s+/).filter(Boolean);
}

export function removeGenericPlaceWords(value: string) {
  return tokenizeSearch(value)
    .filter((word) => !GENERIC_PLACE_WORDS.has(word))
    .join(" ");
}

export function buildQueryVariants(query: string) {
  const trimmed = query.trim();
  const normalized = normalizeSearchText(trimmed);
  const simplified = removeGenericPlaceWords(trimmed);
  const firstSegment = trimmed.split(",")[0]?.trim() ?? trimmed;
  const variants = [
    trimmed,
    normalized,
    firstSegment,
    simplified,
    simplified ? `${simplified} Brasil` : "",
    `${trimmed} Brasil`
  ];

  return Array.from(new Set(variants.map((value) => value.trim()).filter((value) => value.length >= 2)));
}

export function inferRequestedType(query: string) {
  const tokens = tokenizeSearch(query);

  if (tokens.some((token) => ["hotel", "hoteis", "pousada", "pousadas"].includes(token))) {
    return "hotel";
  }

  if (tokens.some((token) => ["bar", "bares"].includes(token))) {
    return "bar";
  }

  if (tokens.some((token) => ["restaurante", "restaurantes", "lanchonete"].includes(token))) {
    return "restaurant";
  }

  if (tokens.some((token) => ["posto", "postos", "combustivel", "gasolina"].includes(token))) {
    return "fuel";
  }

  if (tokens.some((token) => ["oficina", "mecanica", "borracharia"].includes(token))) {
    return "repair";
  }

  if (tokens.some((token) => ["mirante", "praia", "parque", "museu", "palacio", "praca"].includes(token))) {
    return "tourism";
  }

  return "poi";
}
