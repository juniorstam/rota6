"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  FilePenLine,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  LocateFixed,
  MapPinned,
  Plus,
  Route,
  Save,
  SendHorizonal,
  Sparkles,
  Trash2,
  X
} from "lucide-react";

import { PlaceAutocompleteInput } from "@/components/place-autocomplete-input";
import {
  findPublishedTripRecord,
  PublishedTripRecord,
  readPublishedTripRecords,
  savePublishedTripRecord,
  updatePublishedTripRecord
} from "@/lib/published-trips";
import {
  deletePublishDraft,
  findPublishDraft,
  PUBLISH_DRAFTS_EVENT,
  PublishDraftRecord,
  readPublishDrafts,
  upsertPublishDraft
} from "@/lib/publish-drafts";
import { mapService } from "@/lib/services/map-service";
import { TripRoadLevel, TripType } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type DraftStopType = "parada" | "combustivel" | "paisagem" | "hospedagem";
type Visibility = "public" | "private" | "unlisted";

interface DraftStop {
  id: string;
  label: string;
  type: DraftStopType;
  notes: string;
}

interface DraftPhoto {
  id: string;
  name: string;
  previewUrl: string;
}

interface PublishDraft {
  title: string;
  summary: string;
  origin: string;
  destination: string;
  tripType: TripType;
  roadLevel: TripRoadLevel;
  visibility: Visibility;
  tags: string;
  tips: string;
  stops: DraftStop[];
}

const EMPTY_STOP = (): DraftStop => ({
  id: crypto.randomUUID(),
  label: "",
  type: "parada",
  notes: ""
});

const INITIAL_DRAFT: PublishDraft = {
  title: "",
  summary: "",
  origin: "",
  destination: "",
  tripType: "solo",
  roadLevel: "tranquila",
  visibility: "public",
  tags: "",
  tips: "",
  stops: [EMPTY_STOP()]
};

const roadLevelOptions: Array<{ value: TripRoadLevel; label: string; hint: string }> = [
  { value: "tranquila", label: "Tranquila", hint: "Viagem suave, com tocada leve e poucas surpresas." },
  { value: "moderada", label: "Moderada", hint: "Mistura equilibrio entre ritmo, tecnica e apoio." },
  { value: "tecnica", label: "Tecnica", hint: "Estrada mais exigente, com mais atencao e preparo." }
];

const tripTypeOptions: Array<{ value: TripType; label: string }> = [
  { value: "solo", label: "Solo" },
  { value: "casal", label: "Casal" },
  { value: "grupo", label: "Grupo" }
];

const visibilityOptions: Array<{ value: Visibility; label: string; hint: string }> = [
  { value: "public", label: "Publica", hint: "Aparece para a comunidade e pode alimentar o feed." },
  { value: "unlisted", label: "Nao listada", hint: "Fica pronta para compartilhar depois sem entrar em destaque." },
  { value: "private", label: "Privada", hint: "Serve como rascunho pessoal enquanto a viagem amadurece." }
];

function parseMultiline(value: string) {
  return value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildPlanHref(draft: PublishDraft) {
  const params = new URLSearchParams();
  if (draft.origin.trim()) {
    params.set("origem", draft.origin.trim());
  }
  if (draft.destination.trim()) {
    params.set("destino", draft.destination.trim());
  }
  draft.stops
    .map((stop) => stop.label.trim())
    .filter(Boolean)
    .forEach((stop) => params.append("parada", stop));

  const query = params.toString();
  return query ? `/planejar?${query}` : "/planejar";
}

function normalizeDraft(stored: Partial<PublishDraft>): PublishDraft {
  return {
    ...INITIAL_DRAFT,
    ...stored,
    stops: Array.isArray(stored.stops) && stored.stops.length
      ? stored.stops.map((stop) => ({
          id: stop.id ?? crypto.randomUUID(),
          label: stop.label ?? "",
          type: stop.type ?? "parada",
          notes: stop.notes ?? ""
        }))
      : [EMPTY_STOP()]
  };
}

function createPhotoPreview(file: File): DraftPhoto {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    previewUrl: ""
  };
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function draftRecordToComposerState(record: PublishDraftRecord) {
  return {
    draft: normalizeDraft(record),
    coverPhoto: record.coverPhoto,
    galleryPhotos: record.galleryPhotos
  };
}

function publishedRecordToComposerState(record: PublishedTripRecord) {
  return {
    draft: normalizeDraft({
      title: record.title,
      summary: record.summary,
      origin: record.origin,
      destination: record.destination,
      tripType: record.tripType,
      roadLevel: record.roadLevel,
      visibility: record.visibility,
      tags: record.tags.join(", "),
      tips: record.tips.join("\n"),
      stops: record.stops.map((stop) => ({
        id: crypto.randomUUID(),
        label: stop.label,
        type: stop.type,
        notes: stop.notes
      }))
    }),
    coverPhoto: record.coverPhotoUrl
      ? {
          id: crypto.randomUUID(),
          name: record.coverPhotoName ?? "capa-publicada",
          previewUrl: record.coverPhotoUrl
        }
      : null,
    galleryPhotos: (record.galleryPhotoUrls ?? []).map((previewUrl, index) => ({
      id: crypto.randomUUID(),
      name: record.galleryPhotoNames[index] ?? `foto-${index + 1}`,
      previewUrl
    }))
  };
}

export function PublishTripFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [draft, setDraft] = useState<PublishDraft>(INITIAL_DRAFT);
  const [coverPhoto, setCoverPhoto] = useState<DraftPhoto | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<DraftPhoto[]>([]);
  const [drafts, setDrafts] = useState<PublishDraftRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [publishedSummary, setPublishedSummary] = useState<string | null>(null);
  const [geoTarget, setGeoTarget] = useState<"origin" | string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  useEffect(() => {
    const syncDrafts = () => setDrafts(readPublishDrafts());
    syncDrafts();

    window.addEventListener(PUBLISH_DRAFTS_EVENT, syncDrafts);
    window.addEventListener("storage", syncDrafts);
    setHydrated(true);

    return () => {
      window.removeEventListener(PUBLISH_DRAFTS_EVENT, syncDrafts);
      window.removeEventListener("storage", syncDrafts);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const draftIdFromQuery = searchParams.get("draft");
    const editIdFromQuery = searchParams.get("edit");

    if (draftIdFromQuery) {
      const selectedDraft = findPublishDraft(draftIdFromQuery);
      if (selectedDraft) {
        const composer = draftRecordToComposerState(selectedDraft);
        setDraft(composer.draft);
        setCoverPhoto(composer.coverPhoto);
        setGalleryPhotos(composer.galleryPhotos);
        setActiveDraftId(selectedDraft.id);
        setEditingTripId(null);
        setSavedAt(
          new Date(selectedDraft.updatedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        );
      }
      return;
    }

    if (editIdFromQuery) {
      const records = readPublishedTripRecords();
      const selectedTrip = records.find((entry) => entry.id === editIdFromQuery);
      if (selectedTrip) {
        const composer = publishedRecordToComposerState(selectedTrip);
        setDraft(composer.draft);
        setCoverPhoto(composer.coverPhoto);
        setGalleryPhotos(composer.galleryPhotos);
        setEditingTripId(selectedTrip.id);
        setActiveDraftId(null);
        setSavedAt(
          new Date(selectedTrip.publishedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        );
      }
      return;
    }

    setDraft(INITIAL_DRAFT);
    setCoverPhoto(null);
    setGalleryPhotos([]);
    setActiveDraftId(null);
    setEditingTripId(null);
    setSavedAt(null);
  }, [hydrated, searchParams]);

  const planHref = useMemo(() => buildPlanHref(draft), [draft]);
  const stopCount = draft.stops.filter((stop) => stop.label.trim()).length;
  const tagsCount = parseMultiline(draft.tags).length;
  const tipsCount = parseMultiline(draft.tips).length;
  const completionCount = [draft.title, draft.summary, draft.origin, draft.destination].filter((value) => value.trim()).length;
  const photosCount = galleryPhotos.length + (coverPhoto ? 1 : 0);

  function updateDraft<K extends keyof PublishDraft>(key: K, value: PublishDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateStop(stopId: string, updates: Partial<DraftStop>) {
    setDraft((current) => ({
      ...current,
      stops: current.stops.map((stop) => (stop.id === stopId ? { ...stop, ...updates } : stop))
    }));
  }

  function addStop() {
    setDraft((current) => ({
      ...current,
      stops: [...current.stops, EMPTY_STOP()]
    }));
  }

  function removeStop(stopId: string) {
    setDraft((current) => ({
      ...current,
      stops:
        current.stops.length === 1
          ? [{ ...current.stops[0], label: "", notes: "" }]
          : current.stops.filter((stop) => stop.id !== stopId)
    }));
  }

  async function replaceCoverPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previewUrl = await fileToDataUrl(file);
    const nextPhoto = createPhotoPreview(file);
    nextPhoto.previewUrl = previewUrl;
    setCoverPhoto(nextPhoto);

    setFeedback("Foto de capa pronta. Se quiser, voce pode trocar por outra antes de publicar.");
    event.target.value = "";
  }

  async function addGalleryPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const remainingSlots = Math.max(0, 6 - galleryPhotos.length);
    const nextPhotos = await Promise.all(
      files.slice(0, remainingSlots).map(async (file) => {
        const previewUrl = await fileToDataUrl(file);
        const photo = createPhotoPreview(file);
        photo.previewUrl = previewUrl;
        return photo;
      })
    );

    setGalleryPhotos((current) => [...current, ...nextPhotos]);

    setFeedback("Fotos adicionadas. O MVP guarda a selecao nesta sessao e depois liga isso ao storage real.");
    event.target.value = "";
  }

  function removeGalleryPhoto(photoId: string) {
    setGalleryPhotos((current) => {
      return current.filter((photo) => photo.id !== photoId);
    });
  }

  function resetDraft() {
    setDraft(INITIAL_DRAFT);
    setCoverPhoto(null);
    setGalleryPhotos([]);
    setPublishedSummary(null);
    setFeedback("Rascunho limpo. Voce pode recomecar a viagem do zero.");
    setActiveDraftId(null);
    setEditingTripId(null);
    router.replace("/publicar");
  }

  async function fillWithCurrentLocation(target: "origin" | string) {
    if (!navigator.geolocation) {
      setFeedback("Seu navegador nao oferece geolocalizacao.");
      return;
    }

    setGeoTarget(target);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const label = await mapService.reverseGeocode({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          if (target === "origin") {
            updateDraft("origin", label);
            setFeedback("Origem atualizada com sua localizacao atual.");
          } else {
            updateStop(target, { label });
            setFeedback("Parada preenchida com sua localizacao atual.");
          }
        } catch {
          const fallback = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
          if (target === "origin") {
            updateDraft("origin", fallback);
          } else {
            updateStop(target, { label: fallback });
          }
          setFeedback("Usei as coordenadas atuais como fallback para nao travar seu fluxo.");
        } finally {
          setGeoTarget(null);
        }
      },
      () => {
        setGeoTarget(null);
        setFeedback("Nao consegui ler sua posicao. Verifique a permissao do navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function saveDraft() {
    const ownerId = user?.id ?? "local-user";
    const record: PublishDraftRecord = {
      id: activeDraftId ?? crypto.randomUUID(),
      ownerId,
      ...draft,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      origin: draft.origin.trim(),
      destination: draft.destination.trim(),
      coverPhoto,
      galleryPhotos,
      updatedAt: new Date().toISOString()
    };

    upsertPublishDraft(record);
    setActiveDraftId(record.id);
    setSavedAt(
      new Date(record.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
    setFeedback("Rascunho salvo na sua lista. Use “Mostrar meus rascunhos” para abrir ou excluir depois.");
  }

  function publishTrip() {
    const essentialFieldsFilled = [draft.title, draft.summary, draft.origin, draft.destination].every((value) => value.trim());
    if (!essentialFieldsFilled) {
      setFeedback("Preencha titulo, resumo, origem e destino antes de publicar.");
      return;
    }

    setPublishing(true);

    const slug = slugify(draft.title);
    const nextRecord: PublishedTripRecord = {
      id: editingTripId ?? crypto.randomUUID(),
      slug,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      origin: draft.origin.trim(),
      destination: draft.destination.trim(),
      tripType: draft.tripType,
      roadLevel: draft.roadLevel,
      visibility: draft.visibility,
      tags: parseMultiline(draft.tags),
      tips: parseMultiline(draft.tips),
      stops: draft.stops
        .filter((stop) => stop.label.trim())
        .map((stop) => ({ label: stop.label.trim(), type: stop.type, notes: stop.notes.trim() })),
      coverPhotoName: coverPhoto?.name ?? null,
      galleryPhotoNames: galleryPhotos.map((photo) => photo.name),
      coverPhotoUrl: coverPhoto?.previewUrl ?? null,
      galleryPhotoUrls: galleryPhotos.map((photo) => photo.previewUrl),
      author: {
        id: user?.id ?? "local-user",
        username: user?.username ?? "usuario-local",
        name: user?.name ?? "Usuario local",
        avatarUrl:
          user?.avatarUrl ??
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        motorcycle: user?.motorcycle ?? "Moto nao informada"
      },
      publishedAt: new Date().toISOString()
    };
    if (editingTripId) {
      updatePublishedTripRecord(editingTripId, () => nextRecord);
    } else {
      savePublishedTripRecord(nextRecord);
    }

    if (activeDraftId) {
      deletePublishDraft(activeDraftId);
      setActiveDraftId(null);
    }

    setPublishedSummary(
      `Viagem publicada localmente em /perfil/${nextRecord.author.username}/viagem/${slug}. O proximo passo e enviar isso para o feed real via Supabase.`
    );
    setFeedback("Publicacao concluida no MVP local. Agora ja existe um fechamento real para o fluxo.");
    setPublishing(false);
    setEditingTripId(nextRecord.id);
    router.replace(`/publicar?edit=${nextRecord.id}`);
  }

  function openDraft(draftId: string) {
    router.replace(`/publicar?draft=${draftId}`);
    setShowDrafts(false);
    setFeedback(null);
    setPublishedSummary(null);
  }

  function removeDraft(draftId: string) {
    deletePublishDraft(draftId);
    if (activeDraftId === draftId) {
      resetDraft();
    }
  }

  const ownDrafts = useMemo(
    () => drafts.filter((entry) => entry.ownerId === (user?.id ?? "local-user")),
    [drafts, user?.id]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6 rounded-[32px] border border-border bg-surface p-5 shadow-glow md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Publicar</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">Transforme uma viagem feita em roteiro para a comunidade</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              O fluxo abaixo organiza a historia, permite subir fotos da galeria ou tirar na hora e fecha a viagem com um ato real de publicar.
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-background/60 px-4 py-3 text-sm text-muted">
            <p className="font-medium text-text">{user ? `Publicando como ${user.name}` : "Modo rascunho local"}</p>
            <p className="mt-1">
              {editingTripId
                ? "Modo edição de viagem publicada."
                : activeDraftId
                  ? `Rascunho carregado. Última atualização às ${savedAt ?? "--:--"}.`
                  : "Tela limpa para começar uma nova publicação."}
            </p>
          </div>
        </div>

        <section className="rounded-[24px] border border-border bg-background/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">Rascunhos</p>
              <p className="mt-1 text-sm text-muted">Abra um rascunho salvo ou comece uma publicação nova sem herdar o último preenchimento.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowDrafts((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text"
              >
                <ChevronDown size={16} className={cn(showDrafts && "rotate-180")} />
                Mostrar meus rascunhos
              </button>
              <button
                type="button"
                onClick={resetDraft}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text"
              >
                <FilePenLine size={16} />
                Nova publicação
              </button>
            </div>
          </div>

          {showDrafts ? (
            <div className="mt-4 space-y-3">
              {ownDrafts.length ? (
                ownDrafts.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-surface p-4"
                  >
                    <div>
                      <p className="font-medium text-text">{entry.title || "Rascunho sem título"}</p>
                      <p className="mt-1 text-sm text-muted">
                        {entry.origin || "Origem pendente"} {"->"} {entry.destination || "Destino pendente"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openDraft(entry.id)}
                        className="rounded-full border border-border px-4 py-2 text-sm text-text"
                      >
                        Abrir
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDraft(entry.id)}
                        className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-border bg-surface p-4 text-sm text-muted">
                  Você ainda não tem rascunhos salvos.
                </div>
              )}
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-muted">Titulo da viagem</span>
            <input
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              placeholder="Ex.: Curitiba ate a Serra do Rio do Rastro com duas paradas boas"
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-muted">Resumo da experiencia</span>
            <textarea
              value={draft.summary}
              onChange={(event) => updateDraft("summary", event.target.value)}
              placeholder="Conte o clima da viagem, o que fez essa rota valer a pena e o que o outro motociclista precisa saber antes de ir."
              rows={4}
              className="w-full rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-accent"
            />
          </label>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted">Origem</span>
              <button
                type="button"
                onClick={() => fillWithCurrentLocation("origin")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-text"
              >
                <LocateFixed size={14} className={cn(geoTarget === "origin" && "animate-pulse")} />
                {geoTarget === "origin" ? "Lendo posicao..." : "Usar minha localizacao"}
              </button>
            </div>
            <PlaceAutocompleteInput label="" value={draft.origin} onChange={(value) => updateDraft("origin", value)} placeholder="Ex.: Curitiba, PR" />
          </div>

          <PlaceAutocompleteInput
            label="Destino"
            value={draft.destination}
            onChange={(value) => updateDraft("destination", value)}
            placeholder="Ex.: Bom Jardim da Serra, SC"
          />

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Slug sugerido</span>
            <div className="flex h-14 items-center rounded-[20px] border border-border bg-background px-4 text-sm text-muted">
              {draft.title.trim() ? slugify(draft.title) : "sera gerado a partir do titulo"}
            </div>
          </label>
        </div>

        <section className="space-y-4 rounded-[28px] border border-border bg-background/50 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">Fotos da viagem</p>
            <p className="mt-1 text-sm text-muted">Escolha imagens da galeria ou use a camera do aparelho para registrar o momento.</p>
            </div>
            <span className="rounded-full border border-border px-3 py-2 text-xs text-muted">Ate 1 capa + 6 fotos</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-dashed border-border bg-surface p-4">
              <p className="text-sm font-medium text-text">Foto de capa</p>
              <p className="mt-1 text-sm text-muted">Essa imagem abre a narrativa da viagem.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text">
                  <ImagePlus size={16} />
                  Escolher da galeria
                  <input type="file" accept="image/*" className="hidden" onChange={replaceCoverPhoto} />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text">
                  <Camera size={16} />
                  Tirar agora
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={replaceCoverPhoto} />
                </label>
              </div>

              {coverPhoto ? (
                <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-background/60">
                  <img src={coverPhoto.previewUrl} alt={coverPhoto.name} className="h-48 w-full object-cover" />
                  <div className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span className="truncate text-text">{coverPhoto.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(coverPhoto.previewUrl);
                        setCoverPhoto(null);
                      }}
                      className="rounded-full border border-border px-3 py-1 text-muted"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-dashed border-border bg-surface p-4">
              <p className="text-sm font-medium text-text">Galeria da viagem</p>
              <p className="mt-1 text-sm text-muted">Use fotos de paradas, estrada, visual e apoio encontrado pelo caminho.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text">
                  <ImagePlus size={16} />
                  Adicionar fotos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={addGalleryPhotos} />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text">
                  <Camera size={16} />
                  Tirar na hora
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={addGalleryPhotos} />
                </label>
              </div>

              {galleryPhotos.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-[20px] border border-border bg-background/60">
                      <img src={photo.previewUrl} alt={photo.name} className="h-28 w-full object-cover" />
                      <div className="flex items-center justify-between gap-2 p-3 text-xs">
                        <span className="truncate text-text">{photo.name}</span>
                        <button type="button" onClick={() => removeGalleryPhoto(photo.id)} className="text-muted">
                          remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <p className="text-xs text-muted">Neste MVP, as fotos ficam salvas junto com a publicação e também dentro do rascunho quando você decidir salvá-lo.</p>
        </section>

        <section className="space-y-4 rounded-[28px] border border-border bg-background/50 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">Paradas importantes</p>
              <p className="mt-1 text-sm text-muted">Monte o esqueleto da viagem agora e refine a rota completa no planejador.</p>
            </div>
            <button type="button" onClick={addStop} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-text">
              <Plus size={16} />
              Adicionar parada
            </button>
          </div>

          <div className="space-y-4">
            {draft.stops.map((stop, index) => (
              <article key={stop.id} className="rounded-[24px] border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text">Parada {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fillWithCurrentLocation(stop.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-text"
                    >
                      <MapPinned size={14} className={cn(geoTarget === stop.id && "animate-pulse")} />
                      {geoTarget === stop.id ? "Lendo posicao..." : "Usar local atual"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
                      aria-label="Remover parada"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                  <PlaceAutocompleteInput
                    label="Local"
                    value={stop.label}
                    onChange={(value) => updateStop(stop.id, { label: value })}
                    placeholder="Ex.: Morretes, PR"
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm text-muted">Tipo</span>
                    <select
                      value={stop.type}
                      onChange={(event) => updateStop(stop.id, { type: event.target.value as DraftStopType })}
                      className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                    >
                      <option value="parada">Parada</option>
                      <option value="combustivel">Combustivel</option>
                      <option value="paisagem">Paisagem</option>
                      <option value="hospedagem">Hospedagem</option>
                    </select>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm text-muted">Observacoes</span>
                  <textarea
                    value={stop.notes}
                    onChange={(event) => updateStop(stop.id, { notes: event.target.value })}
                    placeholder="Ex.: bom cafe, vista forte, posto confiavel, trecho de atencao..."
                    rows={3}
                    className="w-full rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-accent"
                  />
                </label>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Tipo de viagem</span>
            <select
              value={draft.tripType}
              onChange={(event) => updateDraft("tripType", event.target.value as TripType)}
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
            >
              {tripTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Nivel da estrada</span>
            <select
              value={draft.roadLevel}
              onChange={(event) => updateDraft("roadLevel", event.target.value as TripRoadLevel)}
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
            >
              {roadLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Visibilidade</span>
            <select
              value={draft.visibility}
              onChange={(event) => updateDraft("visibility", event.target.value as Visibility)}
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
            >
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Tags</span>
            <input
              value={draft.tags}
              onChange={(event) => updateDraft("tags", event.target.value)}
              placeholder="serra, cafe, visual, bate-volta"
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
            />
          </label>

          <div className="rounded-[20px] border border-border bg-background/60 p-4 text-sm text-muted">
            <p className="font-medium text-text">Fechamento do fluxo</p>
            <p className="mt-1">Voce pode salvar em rascunhos, continuar no planejador ou concluir com o botão de publicar logo abaixo.</p>
          </div>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-muted">Dicas para quem for repetir a viagem</span>
            <textarea
              value={draft.tips}
              onChange={(event) => updateDraft("tips", event.target.value)}
              placeholder="Uma dica por linha ou separadas por virgula. Ex.: sair cedo, abastecer antes da serra, levar capa de chuva."
              rows={4}
              className="w-full rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-accent"
            />
          </label>
        </div>

        {feedback ? (
          <div className="rounded-[20px] border border-border bg-background/60 p-4 text-sm text-muted">{feedback}</div>
        ) : null}

        {publishedSummary ? (
          <div className="rounded-[20px] border border-accent/30 bg-accent/10 p-4 text-sm text-text">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 text-accent" />
              <div>
                <p className="font-medium">Viagem publicada</p>
                <p className="mt-1 text-muted">{publishedSummary}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium text-text"
          >
            <Save size={16} />
            {activeDraftId ? "Atualizar rascunho" : "Salvar rascunho"}
          </button>

          <button
            type="button"
            onClick={publishTrip}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            <SendHorizonal size={16} />
            {publishing ? "Salvando..." : editingTripId ? "Salvar alterações" : "Publicar viagem"}
          </button>

          <Link
            href={planHref}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-text"
          >
            <Route size={16} />
            Continuar no planejador
          </Link>

          <button
            type="button"
            onClick={resetDraft}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-muted"
          >
            <Trash2 size={16} />
            Limpar rascunho
          </button>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Leitura do rascunho</p>
              <h2 className="mt-2 text-xl font-semibold text-text">O que ja esta redondo para publicar</h2>
            </div>
            <Sparkles size={18} className="text-accent" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="text-xs text-muted">Campos essenciais</p>
              <p className="mt-2 text-2xl font-semibold text-text">{completionCount}/4</p>
            </div>
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="text-xs text-muted">Paradas preenchidas</p>
              <p className="mt-2 text-2xl font-semibold text-text">{stopCount}</p>
            </div>
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="text-xs text-muted">Fotos selecionadas</p>
              <p className="mt-2 text-2xl font-semibold text-text">{photosCount}</p>
            </div>
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="text-xs text-muted">Dicas registradas</p>
              <p className="mt-2 text-2xl font-semibold text-text">{tipsCount}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Fluxo sugerido</p>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="font-medium text-text">1. Monte a historia da viagem</p>
              <p className="mt-1">Titulo, resumo, perfil da rota e pontos de apoio deixam a viagem legivel para outra pessoa.</p>
            </div>
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="font-medium text-text">2. Use fotos e geolocalizacao no contexto certo</p>
              <p className="mt-1">A origem e qualquer parada podem nascer da sua localizacao atual, e as fotos entram direto da galeria ou camera.</p>
            </div>
            <div className="rounded-[22px] border border-border bg-background/60 p-4">
              <p className="font-medium text-text">3. Feche a viagem com clareza</p>
              <p className="mt-1">Salvar rascunho serve para continuar depois. Publicar viagem fecha o fluxo e prepara a integracao com o feed real.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Visibilidade atual</p>
          <div className="mt-4 space-y-3">
            {visibilityOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "rounded-[22px] border p-4 text-sm",
                  draft.visibility === option.value
                    ? "border-accent/40 bg-accent/10 text-text"
                    : "border-border bg-background/60 text-muted"
                )}
              >
                <p className="font-medium">{option.label}</p>
                <p className="mt-1">{option.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-surface p-5 md:p-6 text-sm text-muted">
          <p className="font-medium text-text">Proxima integracao natural</p>
          <p className="mt-2">
            Depois desta etapa, o caminho mais seguro e ligar esse fechamento local ao Supabase, mover as fotos para storage e alimentar feed, perfil e pagina da viagem.
          </p>
          <p className="mt-3">Tags mapeadas agora: <span className="font-medium text-text">{tagsCount}</span></p>
        </section>
      </aside>
    </div>
  );
}
