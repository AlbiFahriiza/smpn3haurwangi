"use client";

import Image from "next/image";
import Link from "next/link";
import type { BeritaItem } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Newspaper } from "lucide-react";

export function BeritaSection({ berita }: { berita?: BeritaItem[] }) {
  const items = berita ?? [];
  if (items.length === 0) return null;

  const [utama, ...lainnya] = items;

  return (
    <section
      aria-labelledby="berita-title"
      className="bg-foam py-14 md:py-20 border-t border-line/60"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="berita-title"
            className="text-2xl md:text-3xl font-extrabold text-abyss tracking-tight"
          >
            Berita Sekolah
          </h2>
          <Link
            href={ROUTES.galeri.path}
            className="text-sm font-semibold text-marine hover:underline focus-visible:outline-2 focus-visible:outline-marine rounded-sm"
          >
            Lihat galeri
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
          {/* Berita utama: satu foto besar, bukan deretan kartu seragam */}
          {utama && (
            <article className="group rounded-lg overflow-hidden bg-white border border-line">
              {utama.image && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={utama.image}
                    alt={utama.title}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5 md:p-6">
                <p className="text-xs font-semibold text-slate-ink">{utama.date}</p>
                <h3 className="mt-2 text-lg md:text-xl font-bold text-abyss leading-snug">
                  {utama.title}
                </h3>
                <p className="mt-2 text-sm text-ink/75 leading-relaxed line-clamp-3">
                  {utama.excerpt}
                </p>
              </div>
            </article>
          )}

          {/* Berita lainnya: baris ringkas dengan pemisah garis */}
          {lainnya.length > 0 && (
            <ul className="bg-white rounded-lg border border-line divide-y divide-line">
              {lainnya.map((b) => (
                <li key={b.title} className="flex gap-4 p-4">
                  {b.image && (
                    <div className="relative w-24 h-20 sm:w-28 shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={b.image}
                        alt={b.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-ink">{b.date}</p>
                    <h3 className="mt-0.5 text-sm font-bold text-abyss leading-snug line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-xs text-ink/70 leading-relaxed line-clamp-2">
                      {b.excerpt}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function BeritaEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-line p-10 text-center text-slate-ink">
      <Newspaper className="mx-auto w-8 h-8 mb-3" aria-hidden />
      <p className="text-sm">
        Belum ada berita. Guru dapat menambahkannya lewat panel admin.
      </p>
    </div>
  );
}
