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

const IKON: Record<string, typeof Tent> = {
  tent: Tent,
  flag: Flag,
  zap: Zap,
  "circle-dot": CircleDot,
  star: Star,
  cross: Cross,
};

export function EkskulTab({ content }: { content: Partial<EkskulTabContent> }) {
  const ekskul = content.ekskul;
  if (!ekskul) return null;
  const items = ekskul.items ?? [];

  return (
    <section aria-labelledby="ekskul-title" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Pengembangan Diri
        </p>
        <h1
          id="ekskul-title"
          className="mt-2 text-2xl md:text-4xl font-extrabold text-navy"
        >
          {ekskul.title ?? "Ekstrakurikuler"}
        </h1>
        <p className="mt-3 text-sm md:text-[15px] text-foreground/75 leading-relaxed max-w-2xl">
          {ekskul.description}
        </p>

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => {
              const Icon = IKON[e.ikon] ?? Star;
              const warna = e.warna || "#0078C0";
              return (
                <li key={e.nama}>
                  <article className="group h-full rounded-xl border border-border bg-white overflow-hidden hover:border-primary/40 hover:shadow-md transition-all">
                    <div
                      className="h-1.5"
                      style={{ backgroundColor: warna }}
                      aria-hidden
                    />
                    <div className="p-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid place-items-center w-11 h-11 rounded-lg text-white shrink-0"
                          style={{ backgroundColor: warna }}
                          aria-hidden
                        >
                          <Icon className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-bold text-navy leading-tight">
                            {e.nama}
                          </h2>
                          <p className="text-[11px] font-semibold text-primary mt-0.5 inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" aria-hidden />
                            {e.jadwal}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3.5 text-sm text-foreground/75 leading-relaxed">
                        {e.deskripsi}
                      </p>
                      {e.pembina && e.pembina !== "—" && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="w-3.5 h-3.5" aria-hidden />
                          Pembina: {e.pembina}
                        </p>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Tent className="mx-auto w-8 h-8 mb-3" aria-hidden />
            <p className="text-sm">Data ekstrakurikuler belum tersedia.</p>
          </div>
        )}
      </div>
    </section>
  );
}

type EkskulTabContent = {
  ekskul: EkskulSection;
};
