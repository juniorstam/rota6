const filters = [
  "restaurante",
  "pousada",
  "posto",
  "oficina",
  "parada panorâmica",
  "alerta"
];

export function FilterBar() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          type="button"
          key={filter}
          className="whitespace-nowrap rounded-full border border-border bg-surfaceAlt px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-text"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
