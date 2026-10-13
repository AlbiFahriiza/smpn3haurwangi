"use client";

import type { VisionSection } from "@/lib/content";
import { Target, ListChecks, Sparkles, Info } from "lucide-react";

export function VisiMisiSection({ vision }: { vision?: VisionSection }) {
  if (!vision) return null;

  return (
    <section
      aria-labelledby="visi-title"
      className="py-14 md:py-20 bg-navy text-white relative overflow-hidden"
    >
      {/* Hiasan cincin emas halus — menggemakan cincin logo sekolah. */}
      <span
        aria-hidden
        className="absolute -right-24 -top-24 w-72 h-72 rounded-full border-[10px] border-gold/15"
      />
      <span
        aria-hidden
        className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full border-[12px] border-white/5"
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[5fr_7fr]">
          {/* Visi */}
          <div>
            <div className="flex items-center gap-2 text-gold">
              <Target className="w-5 h-5" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-widest">Visi</p>
            </div>
            <h2 id="visi-title" className="sr-only">
              Visi dan Misi
            </h2>
            <blockquote className="mt-4 text-xl md:text-2xl font-bold leading-snug">
              “{vision.visi}”
            </blockquote>
            {vision.motto && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/40 px-4 py-2 text-sm font-semibold text-gold">
                <Sparkles className="w-4 h-4" aria-hidden />
                {vision.motto}
              </p>
            )}
            {vision.tujuan && vision.tujuan.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="w-4 h-4" aria-hidden />
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Tujuan Pendidikan
                  </h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {vision.tujuan.map((t, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/80">
                      <span className="text-gold font-bold shrink-0">{i + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Misi */}
          <div>
            <div className="flex items-center gap-2 text-gold">
              <ListChecks className="w-5 h-5" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-widest">Misi</p>
            </div>
            <ol className="mt-4 space-y-3">
              {(vision.misi ?? []).map((m, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-lg bg-white/5 border border-white/10 px-4 py-3.5"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-gold text-navy text-sm font-extrabold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm md:text-[15px] text-white/85 leading-relaxed pt-1">
                    {m}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {vision.catatan && (
          <p className="relative mt-10 flex items-start gap-2 text-xs text-white/55 max-w-3xl">
            <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            {vision.catatan}
          </p>
        )}
      </div>
    </section>
  );
}
