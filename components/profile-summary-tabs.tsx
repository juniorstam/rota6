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
    <nav className="sticky top-[88px] z-20 rounded-[18px] border border-border bg-background/92 p-2 shadow-glow backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-2">
        {tabs.map(({ key, label, icon: Icon, buildHref }) => {
          const active = activeTab === key;
          return (
            <Link
              key={key}
              href={buildHref(username)}
              className={cn(
                "min-w-0 rounded-[14px] border px-2 py-3 transition sm:px-4 sm:py-4",
                active
                  ? "border-accent bg-accent/10 shadow-[0_10px_30px_rgba(47,128,237,0.18)]"
                  : "border-transparent bg-surface hover:border-border hover:bg-surfaceAlt/70"
              )}
            >
              <p className={cn("truncate text-[10px] uppercase tracking-[0.12em] sm:text-xs sm:normal-case sm:tracking-normal", active ? "text-accentSoft" : "text-muted")}>
                {label}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-base font-semibold text-text sm:gap-2 sm:text-2xl">
                <Icon size={15} className="sm:h-[18px] sm:w-[18px]" />
                {counters[key]}
              </p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
