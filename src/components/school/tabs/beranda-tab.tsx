"use client";

import type { SiteContent } from "@/lib/content";
import { HeroChapter } from "../chapters/hero-chapter";
import { StatsChapter } from "../chapters/stats-chapter";
import { SambutanChapter } from "../chapters/sambutan-chapter";
import { RutinitasChapter } from "../chapters/rutinitas-chapter";
import { FasilitasChapter } from "../chapters/fasilitas-chapter";
import { EkskulChapter } from "../chapters/ekskul-chapter";
import { GuruChapter } from "../chapters/guru-chapter";
import { GaleriChapter } from "../chapters/galeri-chapter";
import { BeritaChapter } from "../chapters/berita-chapter";
import { KontakChapter } from "../chapters/kontak-chapter";

/**
 * Beranda disusun sebagai bab-bab: tiap bab satu bidang warna datar, dan
 * urutannya mengikuti pertanyaan yang muncul saat orang membuka situs sekolah —
 * ini sekolah apa dan sebesar apa, siapa yang mengurusnya, bagaimana harinya
 * berjalan, apa saja yang ada di dalamnya, lalu bagaimana menghubunginya.
 */
export function BerandaTab({ content }: { content: Partial<SiteContent> }) {
  return (
    <>
      <HeroChapter identity={content.identity} students={content.students} />
      <StatsChapter stats={content.home?.stats} />
      <SambutanChapter
        sambutan={content.home?.sambutan}
        about={content.about}
        identity={content.identity}
      />
      <RutinitasChapter routines={content.routines} identity={content.identity} />
      <FasilitasChapter
        denah={content.denah}
        students={content.students}
        identity={content.identity}
      />
      <EkskulChapter ekskul={content.ekskul} />
      <GuruChapter teachers={content.teachers} />
      <GaleriChapter gallery={content.gallery} />
      <BeritaChapter berita={content.home?.berita} />
      <KontakChapter contact={content.contact} identity={content.identity} />
    </>
  );
}
