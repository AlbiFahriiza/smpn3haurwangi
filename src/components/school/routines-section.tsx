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
  Clock3,
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
 * Rutinitas sebagai linimasa vertikal dengan penanda waktu:
 * kegiatan mingguan di atas, kegiatan tahunan di bawah.
 */
export function RoutinesSection({ routines }: { routines?: RoutinesData }) {
  if (!routines) return null;
  const items = routines.items ?? [];

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="rutinitas-title" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2
            id="rutinitas-title"
            className="text-2xl md:text-3xl font-extrabold text-abyss tracking-tight"
          >
            {routines.title ?? "Rutinitas Sekolah"}
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-slate-ink leading-relaxed">
            {routines.description}
          </p>
        </div>

        <ol className="mt-10 relative max-w-3xl">
          {/* Garis vertikal linimasa */}
          <span
            aria-hidden
            className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-line"
          />
          {items.map((item) => {
            const Icon = IKON[item.ikon] ?? CalendarDays;
            return (
              <li key={item.nama} className="relative flex gap-4 md:gap-5 pb-8 last:pb-0">
                <span
                  aria-hidden
                  className="relative z-10 grid place-items-center w-10 h-10 rounded-full bg-abyss text-white shrink-0 ring-4 ring-white"
                >
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </span>
                <div className="pt-0.5 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-base md:text-lg font-bold text-abyss">
                      {item.nama}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-marine bg-sky rounded-full px-2.5 py-1">
                      <Clock3 className="w-3 h-3" aria-hidden />
                      {item.waktu}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink/75 leading-relaxed max-w-xl">
                    {item.deskripsi}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
