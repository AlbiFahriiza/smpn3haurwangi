"use client";

import type { RoutinesSection as RoutinesData } from "@/lib/content";
import {
  Flag,
  Sunrise,
  BookOpen,
  HeartHandshake,
  Users,
  Star,
  CalendarDays,
} from "lucide-react";

const IKON: Record<string, typeof Flag> = {
  flag: Flag,
  sunrise: Sunrise,
  book: BookOpen,
  heart: HeartHandshake,
  users: Users,
  star: Star,
};

/**
 * Rutinitas sebagai linimasa bernomor — kegiatan mingguan
 * di atas, kegiatan tahunan di bawah; bukan deretan kartu seragam.
 */
export function RoutinesSection({ routines }: { routines?: RoutinesData }) {
  if (!routines) return null;
  const items = routines.items ?? [];

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="rutinitas-title" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Keseharian di Sekolah
          </p>
          <h2
            id="rutinitas-title"
            className="mt-2 text-2xl md:text-3xl font-extrabold text-navy"
          >
            {routines.title ?? "Rutinitas Sekolah"}
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-foreground/75 leading-relaxed">
            {routines.description}
          </p>
        </div>

        <ol className="mt-10 relative max-w-3xl">
          {/* Garis vertikal linimasa */}
          <span
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border"
          />
          {items.map((item, i) => {
            const Icon = IKON[item.ikon] ?? CalendarDays;
            return (
              <li key={item.nama} className="relative flex gap-4 md:gap-5 pb-8 last:pb-0">
                <span
                  aria-hidden
                  className="relative z-10 grid place-items-center w-10 h-10 rounded-full bg-navy text-gold shrink-0 ring-4 ring-background"
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="pt-0.5 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-base md:text-lg font-bold text-navy">
                      {item.nama}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-secondary rounded-full px-2 py-0.5">
                      <CalendarDays className="w-3 h-3" aria-hidden />
                      {item.waktu}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/75 leading-relaxed max-w-xl">
                    {item.deskripsi}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="ml-auto hidden md:block text-xs font-extrabold text-border pt-1"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
