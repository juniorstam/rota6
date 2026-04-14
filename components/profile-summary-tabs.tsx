"use client";

import Link from "next/link";
import { Camera, Route, Users } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProfileSummaryTabsProps {
  username: string;
  activeTab: "overview" | "photos" | "followers" | "following";
  tripCount: number;
  photoCount: number;
  followersCount: number;
  followingCount: number;
}

const tabs = [
  { key: "overview", label: "viagens", icon: Route, buildHref: (username: string) => `/perfil/${username}` },
  { key: "photos", label: "fotos", icon: Camera, buildHref: (username: string) => `/perfil/${username}/fotos` },
  {
    key: "followers",
    label: "seguidores",
    icon: Users,
    buildHref: (username: string) => `/perfil/${username}/seguidores`
  },
  {
    key: "following",
    label: "seguindo",
    icon: Users,
    buildHref: (username: string) => `/perfil/${username}/seguindo`
  }
] as const;

export function ProfileSummaryTabs({
  username,
  activeTab,
  tripCount,
  photoCount,
  followersCount,
  followingCount
}: ProfileSummaryTabsProps) {
  const counters = {
    overview: tripCount,
    photos: photoCount,
    followers: followersCount,
    following: followingCount
  } as const;

  return (
    <nav className="sticky top-[88px] z-20 rounded-[28px] border border-border bg-background/92 p-2 shadow-glow backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tabs.map(({ key, label, icon: Icon, buildHref }) => {
          const active = activeTab === key;
          return (
            <Link
              key={key}
              href={buildHref(username)}
              className={cn(
                "rounded-[22px] border px-4 py-4 transition",
                active
                  ? "border-accent bg-accent/10 shadow-[0_10px_30px_rgba(245,158,11,0.12)]"
                  : "border-transparent bg-surface hover:border-border hover:bg-surfaceAlt/70"
              )}
            >
              <p className={cn("text-[11px] sm:text-xs", active ? "text-accentSoft" : "text-muted")}>{label}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-text sm:text-2xl">
                <Icon size={16} className="sm:h-[18px] sm:w-[18px]" />
                {counters[key]}
              </p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
