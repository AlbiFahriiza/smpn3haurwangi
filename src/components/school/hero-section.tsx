"use client";

import Image from "next/image";
import type { HomeSection } from "@/lib/content";
import { BadgeCheck, Landmark, CalendarDays, ChevronDown } from "lucide-react";

const BADGE_ICONS: Record<string, typeof BadgeCheck> = {
  badge: BadgeCheck,
  building: Landmark,
  calendar: CalendarDays,
};

export function HeroSection({
  home,
  onTab,
}: {
  home?: HomeSection;
  onTab: (key: string) => void;
}) {
  const hero = home?.hero;
  const image = hero?.image || "/images/hero/gerbang-utama.jpg";

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate min-h-[420px] md:min-h-[520px] flex items-end overflow-hidden bg-navy"
    >
      <Image
        src={image}
        alt="Gerbang utama SMP Negeri 3 Haurwangi dengan bendera merah putih"
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />
      {/* Lapisan gelap dua tingkat agar teks tetap terbaca di foto terang. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/95 via-navy/55 to-navy/25"
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 md:pb-16 pt-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold text-white/90">
            <BadgeCheck className="w-3.5 h-3.5 text-gold" aria-hidden />
            Website Resmi · NPSN 20252209
          </p>
          <h1
            id="hero-title"
            className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight"
          >
            {hero?.title ?? "SMP Negeri 3 Haurwangi"}
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/85 leading-relaxed max-w-xl">
            {hero?.subtitle ??
              "Unggul dalam prestasi, santun dalam perilaku — mencetak generasi cerdas berkarakter di jantung Kabupaten Cianjur."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(hero?.badges ?? []).map((b) => {
              const Icon = BADGE_ICONS[b.icon] ?? BadgeCheck;
              return (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold/90 text-navy px-3 py-1.5 text-xs font-bold"
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden />
                  {b.label}
                </span>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onTab("tentang")}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-white"
            >
              Tentang Sekolah
            </button>
            <button
              onClick={() => onTab("galeri")}
              className="rounded-lg border border-white/40 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-white"
            >
              Lihat Galeri
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          document
            .getElementById("statistik-sekolah")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="absolute right-4 bottom-4 hidden md:grid place-items-center w-10 h-10 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition-colors"
        aria-label="Gulir ke statistik sekolah"
      >
        <ChevronDown className="w-5 h-5" aria-hidden />
      </button>
    </section>
  );
}
