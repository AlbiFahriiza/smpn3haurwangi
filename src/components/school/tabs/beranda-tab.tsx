"use client";

import type { SiteContent } from "@/lib/content";
import { HeroSection } from "../hero-section";
import { StatsBand } from "../stats-band";
import { SambutanSection } from "../sambutan-section";
import { DenahSection } from "../denah-section";
import { RoutinesSection } from "../routines-section";
import { BeritaSection } from "../berita-section";

export function BerandaTab({
  content,
  onTab,
}: {
  content: Partial<SiteContent>;
  onTab: (key: string) => void;
}) {
  const home = content.home;
  const denah = content.denah;
  const routines = content.routines;

  return (
    <>
      <HeroSection home={home} onTab={onTab} />
      <StatsBand stats={home?.stats} />
      <SambutanSection sambutan={home?.sambutan} identity={content.identity} />
      <DenahSection denah={denah} />
      <RoutinesSection routines={routines} />
      <BeritaSection berita={home?.berita} onTab={onTab} />
    </>
  );
}
