"use client";

import Image from "next/image";
import type { BeritaItem } from "@/lib/content";
import { ArrowRight, Newspaper } from "lucide-react";

export function BeritaSection({
  berita,
  onTab,
}: {
  berita?: BeritaItem[];
  onTab: (key: string) => void;
}) {
  const items = berita ?? [];
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="berita-title"
      className="py-14 md:py-20 bg-secondary/50 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Kabar Terbaru
            </p>
            <h2
              id="berita-title"
              className="mt-2 text-2xl md:text-3xl font-extrabold text-navy"
            >
              Berita Sekolah
            </h2>
          </div>
          <button
            onClick={() => onTab("galeri")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Lihat galeri
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {items.map((b) => (
            <li key={b.title}>
              <article className="group h-full rounded-xl overflow-hidden bg-white border border-border hover:border-primary/40 transition-colors flex flex-col">
                {b.image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={b.image}
                      alt={b.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                    {b.date}
                  </p>
                  <h3 className="font-bold text-navy leading-snug">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {b.excerpt}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function BeritaEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
      <Newspaper className="mx-auto w-8 h-8 mb-3" aria-hidden />
      <p className="text-sm">Belum ada berita. Guru dapat menambahkannya lewat panel admin.</p>
    </div>
  );
}
