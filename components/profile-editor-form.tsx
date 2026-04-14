"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Bike, Camera, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  buildMotorcycleLabel,
  getDefaultCoverUrl,
  normalizeUsername,
  usernameExists
} from "@/lib/local-profiles";
import { authService } from "@/lib/services/auth-service";
import { uploadProfileImage } from "@/lib/supabase/image-upload";
import { useAuth } from "@/providers/auth-provider";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo selecionado."));
    reader.readAsDataURL(file);
  });
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizeInstagramHandle(value: string) {
  return value
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0] ?? "";
}

export function ProfileEditorForm() {
  const router = useRouter();
  const { user, loading, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [motorcycleBrand, setMotorcycleBrand] = useState("");
  const [motorcycleModel, setMotorcycleModel] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name ?? "");
    setUsername(user.username ?? "");
    setBio(user.bio ?? "");
    setCity(user.city ?? "");
    setState(user.state ?? "");
    setRegion(user.region ?? "");
    setContactEmail(user.contactEmail ?? user.email ?? "");
    setPhone(formatPhone(user.phone ?? ""));
    setInstagramHandle(user.instagramHandle ?? "");
    setMotorcycleBrand(user.motorcycleBrand ?? "");
    setMotorcycleModel(user.motorcycleModel ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setCoverUrl(user.coverUrl ?? getDefaultCoverUrl());
    setAvatarFile(null);
    setCoverFile(null);
  }, [user]);

  const motorcyclePreview = useMemo(
    () => buildMotorcycleLabel(motorcycleBrand, motorcycleModel) || "Moto ainda nao informada",
    [motorcycleBrand, motorcycleModel]
  );

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    target: "avatar" | "cover"
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    if (target === "avatar") {
      setAvatarFile(file);
      setAvatarUrl(dataUrl);
      return;
    }

    setCoverFile(file);
    setCoverUrl(dataUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }

    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      setMessage("Informe um @ valido para o perfil.");
      return;
    }

    if (usernameExists(normalizedUsername, user.id)) {
      setMessage(`O @${normalizedUsername} ja existe. Escolha outro username.`);
      return;
    }

    setSaving(true);
    setMessage("");

    let nextAvatarUrl = avatarUrl || user.avatarUrl;
    let nextCoverUrl = coverUrl || getDefaultCoverUrl();

    try {
      if (avatarFile) {
        setMessage("Otimizando e enviando sua foto de perfil...");
        nextAvatarUrl = await uploadProfileImage({
          userId: user.id,
          file: avatarFile,
          type: "avatar"
        });
      }

      if (coverFile) {
        setMessage("Otimizando e enviando sua imagem de capa...");
        nextCoverUrl = await uploadProfileImage({
          userId: user.id,
          file: coverFile,
          type: "cover"
        });
      }
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel preparar as imagens para salvar o perfil agora."
      );
      return;
    }

    const nextUser = {
      ...user,
      name: name.trim() || user.name,
      username: normalizedUsername,
      bio: bio.trim(),
      city: city.trim(),
      state: state.trim(),
      region: region.trim(),
      contactEmail: contactEmail.trim(),
      phone: formatPhone(phone),
      instagramHandle: normalizeInstagramHandle(instagramHandle),
      motorcycleBrand: motorcycleBrand.trim(),
      motorcycleModel: motorcycleModel.trim(),
      motorcycle: buildMotorcycleLabel(motorcycleBrand, motorcycleModel),
      avatarUrl: nextAvatarUrl,
      coverUrl: nextCoverUrl
    };

    try {
      setMessage("Salvando dados do perfil...");
      const savedProfile = await authService.updateProfile(nextUser);
      updateUser(savedProfile);
      setSaving(false);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarUrl(savedProfile.avatarUrl ?? "");
      setCoverUrl(savedProfile.coverUrl ?? getDefaultCoverUrl());
      setMessage("Perfil salvo com sucesso.");
      router.push(`/perfil/${savedProfile.username}`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Nao foi possivel salvar o perfil agora.");
    }
  }

  if (loading) {
    return (
      <section className="rounded-[32px] border border-border bg-surface p-8 text-sm text-muted">
        Carregando seu perfil...
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-[32px] border border-border bg-surface p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Perfil</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Entre para montar seu perfil</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          O cadastro do perfil fica disponivel assim que voce entra na sua conta.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-text"
          >
            Criar conta
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-border bg-surface p-6 md:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Seu perfil</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Monte sua identidade dentro da Rota 6</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Complete as informacoes que fazem sentido para voce. Cidade, moto, contato e foto ajudam a deixar o
            perfil confiavel e reconhecivel na comunidade.
          </p>
        </div>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Nome publico</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Como voce quer aparecer"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">@ do perfil</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Seu username unico"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Bio</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              className="w-full rounded-[24px] border border-border bg-background px-4 py-4 text-sm text-text outline-none focus:border-accent"
              placeholder="Conte um pouco sobre seu estilo de viagem, regiao que costuma rodar e o que gosta de compartilhar."
            />
          </label>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            <MapPin size={16} />
            Base e regiao
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Cidade</span>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Cidade onde mora"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Estado</span>
              <input
                value={state}
                onChange={(event) => setState(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="UF"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Regiao</span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Ex.: litoral, serra, capital"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            <Mail size={16} />
            Contato
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">E-mail de contato</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Para combinacoes e parcerias"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Telefone (opcional)</span>
              <input
                value={phone}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="(11) 99999-9999"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Instagram</span>
            <input
              value={instagramHandle}
              onChange={(event) => setInstagramHandle(normalizeInstagramHandle(event.target.value))}
              className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
              placeholder="seuinstagram"
            />
          </label>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            <Bike size={16} />
            Sua moto
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Marca</span>
              <input
                value={motorcycleBrand}
                onChange={(event) => setMotorcycleBrand(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Ex.: Honda, BMW, Triumph"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Modelo</span>
              <input
                value={motorcycleModel}
                onChange={(event) => setMotorcycleModel(event.target.value)}
                className="h-14 w-full rounded-[20px] border border-border bg-background px-4 text-sm text-text outline-none focus:border-accent"
                placeholder="Ex.: Africa Twin, GS 800"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block rounded-[24px] border border-dashed border-border bg-background/70 p-4">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
                <Camera size={16} />
                Foto pessoal
              </span>
              <p className="mb-4 text-sm leading-6 text-muted">
                Escolha uma foto sua para o avatar do perfil.
              </p>
              <input type="file" accept="image/*" onChange={(event) => void handleImageChange(event, "avatar")} />
            </label>

            <label className="block rounded-[24px] border border-dashed border-border bg-background/70 p-4">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
                <Camera size={16} />
                Imagem de capa
              </span>
              <p className="mb-4 text-sm leading-6 text-muted">
                Pode ser uma estrada, uma paisagem ou uma foto da sua moto.
              </p>
              <input type="file" accept="image/*" onChange={(event) => void handleImageChange(event, "cover")} />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar perfil"}
          </button>

          <Link
            href={user ? `/perfil/${user.username}` : "/"}
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-text"
          >
            Cancelar
          </Link>
        </div>

        {message ? <p className="rounded-2xl bg-background px-4 py-3 text-sm text-muted">{message}</p> : null}
      </form>

      <aside className="space-y-5">
        <section className="overflow-hidden rounded-[32px] border border-border bg-surface">
          <div
            className="h-40 w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${coverUrl || getDefaultCoverUrl()}")` }}
          />
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end gap-4">
              <div
                className="h-20 w-20 rounded-[24px] border-4 border-surface bg-cover bg-center shadow-glow"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
              <div className="pb-1">
                <p className="text-xl font-semibold text-text">{name || "Seu nome"}</p>
                <p className="text-sm text-muted">@{normalizeUsername(username || "seuperfil")}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-muted">
              <p>{bio || "Sua bio vai aparecer aqui assim que voce escrever algo sobre seu estilo de estrada."}</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-4 py-2">{city || "Cidade"} {state ? `, ${state}` : ""}</span>
                <span className="rounded-full bg-background px-4 py-2">{motorcyclePreview}</span>
                {instagramHandle ? (
                  <a
                    href={`https://www.instagram.com/${normalizeInstagramHandle(instagramHandle)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-background px-4 py-2 transition hover:text-text"
                  >
                    {normalizeInstagramHandle(instagramHandle)}
                  </a>
                ) : null}
                {phone ? <span className="rounded-full bg-background px-4 py-2">{formatPhone(phone)}</span> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            <UserRound size={16} />
            O que vale preencher primeiro
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <li>Nome, @ e foto para o perfil ficar reconhecivel.</li>
            <li>Cidade, estado e regiao para conectar com quem roda perto de voce.</li>
            <li>Moto e Instagram para dar contexto ao seu estilo de viagem.</li>
            <li>E-mail e telefone so se fizer sentido para contato.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
