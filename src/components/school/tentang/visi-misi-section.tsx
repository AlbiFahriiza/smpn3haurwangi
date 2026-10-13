"use client";

import type { VisionSection } from "@/lib/content";
import { Target, ListChecks, Sparkles, Info } from "lucide-react";

export function VisiMisiSection({ vision }: { vision?: VisionSection }) {
  if (!vision) return null;

  return (
    <section
      aria-labelledby="visi-title"
      className="py-14 md:py-20 bg-abyss text-white relative overflow-hidden"
    >
      {/* Tekstur grid institusional halus */}
      <span aria-hidden className="absolute inset-0 bg-civic-grid-light" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          {/* Visi */}
          <div>
            <div className="flex items-center gap-2 text-sky">
              <Target className="w-5 h-5" aria-hidden />
              <p className="text-xs font-bold tracking-widest uppercase">Visi</p>
            </div>
            <h2 id="visi-title" className="sr-only">
              Visi dan Misi
            </h2>
            <blockquote className="mt-4 font-serif italic text-xl md:text-2xl font-semibold leading-snug">
              {vision.visi}
            </blockquote>
            {vision.motto && (
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky/15 border border-sky/40 px-4 py-2 text-sm font-semibold text-sky">
                <Sparkles className="w-4 h-4" aria-hidden />
                {vision.motto}
              </p>
            )}
            {vision.tujuan && vision.tujuan.length > 0 && (
              <div className="mt-9">
                <div className="flex items-center gap-2 text-sky">
                  <Sparkles className="w-4 h-4" aria-hidden />
                  <h3 className="text-xs font-bold tracking-widest uppercase">
                    Tujuan Pendidikan
                  </h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {vision.tujuan.map((t, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/80">
                      <span className="text-sky font-bold shrink-0">{i + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Misi */}
          <div>
            <div className="flex items-center gap-2 text-sky">
              <ListChecks className="w-5 h-5" aria-hidden />
              <p className="text-xs font-bold tracking-widest uppercase">Misi</p>
            </div>
            <ol className="mt-4 space-y-3">
              {(vision.misi ?? []).map((m, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-lg bg-white/6 border border-white/10 px-4 py-3.5"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-md bg-sky text-abyss text-sm font-extrabold shrink-0">
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
