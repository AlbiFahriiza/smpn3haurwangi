"use client";

import type { EkskulSection } from "@/lib/content";
import {
  Tent,
  Flag,
  Zap,
  CircleDot,
  Star,
  Cross,
  CalendarDays,
  User,
} from "lucide-react";

export function EkskulTab({ content }: { content: Partial<EkskulTabContent> }) {
  const ekskul = content.ekskul;
  if (!ekskul) return null;
  const items = ekskul.items ?? [];
  const [utama, ...lainnya] = items;

  return (
    <section aria-labelledby="ekskul-title" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h1
          id="ekskul-title"
          className="text-3xl md:text-4xl font-extrabold text-abyss tracking-tight"
        >
          {ekskul.title ?? "Ekstrakurikuler"}
        </h1>
        <p className="mt-3 text-sm md:text-[15px] text-slate-ink leading-relaxed max-w-2xl">
          {ekskul.description}
        </p>

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {utama && (
              <li className="sm:col-span-2 lg:col-span-3">
                <article className="group rounded-lg border border-line bg-foam overflow-hidden hover:border-marine/50 transition-colors">
                  <div className="p-6 md:p-8 grid md:grid-cols-[auto_1fr_auto] gap-5 md:gap-8 items-start">
                    <EkskulIcon ekskul={utama} besar />
                    <div className="min-w-0">
                      <h2 className="text-lg md:text-xl font-bold text-abyss leading-tight">
                        {utama.nama}
                      </h2>
                      <p className="mt-2 text-sm md:text-[15px] text-ink/75 leading-relaxed max-w-[62ch]">
                        {utama.deskripsi}
                      </p>
                      <EkskulMeta ekskul={utama} />
                    </div>
                    <span className="hidden md:grid place-items-center px-3 py-1.5 rounded-md bg-sky text-marine text-xs font-bold">
                      Ekskul unggulan
                    </span>
                  </div>
                </article>
              </li>
            )}
            {lainnya.map((e) => (
              <li key={e.nama}>
                <article className="group h-full rounded-lg border border-line bg-white overflow-hidden hover:border-marine/50 transition-colors">
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <EkskulIcon ekskul={e} />
                      <div className="min-w-0">
                        <h2 className="font-bold text-abyss leading-tight">{e.nama}</h2>
                        <p className="text-[11px] font-semibold text-marine mt-0.5 inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" aria-hidden />
                          {e.jadwal}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3.5 text-sm text-ink/75 leading-relaxed">
                      {e.deskripsi}
                    </p>
                    {e.pembina && e.pembina !== "-" && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-ink">
                        <User className="w-3.5 h-3.5" aria-hidden />
                        Pembina: {e.pembina}
                      </p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-line p-10 text-center text-slate-ink">
            <Tent className="mx-auto w-8 h-8 mb-3" aria-hidden />
            <p className="text-sm">Data ekstrakurikuler belum tersedia.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function EkskulIcon({ ekskul, besar = false }: { ekskul: EkskulTabContent["ekskul"]["items"][number]; besar?: boolean }) {
  const IKON_MAP: Record<string, typeof Tent> = {
    tent: Tent,
    flag: Flag,
    zap: Zap,
    "circle-dot": CircleDot,
    star: Star,
    cross: Cross,
  };
  const Icon = IKON_MAP[ekskul.ikon] ?? Star;
  return (
    <span
      aria-hidden
      className={`grid place-items-center rounded-lg bg-abyss text-white shrink-0 ${
        besar ? "w-14 h-14" : "w-11 h-11"
      }`}
    >
      <Icon className={besar ? "w-6 h-6" : "w-5 h-5"} />
    </span>
  );
}

function EkskulMeta({ ekskul }: { ekskul: EkskulTabContent["ekskul"]["items"][number] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold text-marine">
        <CalendarDays className="w-3.5 h-3.5" aria-hidden />
        {ekskul.jadwal}
      </span>
      {ekskul.pembina && ekskul.pembina !== "-" && (
        <span className="inline-flex items-center gap-1.5 text-slate-ink">
          <User className="w-3.5 h-3.5" aria-hidden />
          Pembina: {ekskul.pembina}
        </span>
      )}
    </div>
  );
}

type EkskulTabContent = {
  ekskul: EkskulSection;
};
