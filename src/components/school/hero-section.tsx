"use client";

import Image from "next/image";
import type { HomeSection } from "@/lib/content";
import { BadgeCheck, Landmark, CalendarDays } from "lucide-react";

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
  const badges = hero?.badges ?? [];
  

  return (
    <section
      aria-labelledby="hero-title"
      className="relative bg-foam bg-civic-grid border-b border-line/60"
    >
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Kolom pernyataan */}
          <div className="lg:col-span-7 max-w-xl">
            <h1
              id="hero-title"
              className="text-4xl md:text-5xl font-extrabold text-abyss leading-[1.08] tracking-tight"
            >
              {hero?.title ?? "SMP Negeri 3 Haurwangi"}
            </h1>
            <p className="mt-5 text-base md:text-lg text-ink/90 leading-relaxed max-w-[58ch]">
              {hero?.subtitle ??
                "Unggul dalam prestasi, santun dalam perilaku, mencetak generasi cerdas berkarakter di jantung Kabupaten Cianjur."}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => onTab("tentang")}
                className="rounded-lg bg-marine px-5 py-3 text-sm font-bold text-white hover:bg-marine-hover hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-marine focus-visible:outline-offset-2"
              >
                Tentang Sekolah
              </button>
              <button
                onClick={() => onTab("galeri")}
                className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-bold text-abyss hover:border-marine hover:text-marine transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-marine focus-visible:outline-offset-2"
              >
                Lihat Galeri
              </button>
            </div>

            {badges.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {badges.map((b) => {
                  const Icon = BADGE_ICONS[b.icon] ?? BadgeCheck;
                  return (
                    <li
                      key={b.label}
                      className="flex items-center gap-2 text-sm font-semibold text-ink/80"
                    >
                      <Icon className="w-4 h-4 text-marine" aria-hidden />
                      {b.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Kolom foto: momen visual utama */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden ring-1 ring-line shadow-[0_18px_44px_-18px_oklch(0.298_0.076_252.5/0.5)] animate-[fadeScale_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
              <Image
                src={image}
                alt="Gerbang utama SMP Negeri 3 Haurwangi dengan bendera merah putih"
                width={880}
                height={660}
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
