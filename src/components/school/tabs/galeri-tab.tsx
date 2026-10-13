"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import type { GallerySection } from "@/lib/content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

export function GaleriTab({ content }: { content: Partial<GaleriTabContent> }) {
  const gallery = content.gallery;
  const [kategori, setKategori] = useState<string>("Semua");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = gallery?.items ?? [];
  const kategoriList = gallery?.kategori ?? ["Semua"];

  const filtered = useMemo(
    () => (kategori === "Semua" ? items : items.filter((i) => i.kategori === kategori)),
    [items, kategori]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      setLightbox((cur) => {
        if (cur === null) return cur;
        const next = cur + dir;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
    },
    [filtered.length]
  );

  // Navigasi lightbox dengan papan tombol.
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, step]);

  const current = lightbox !== null ? filtered[lightbox] : null;

  return (
    <section aria-labelledby="galeri-title" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Dokumentasi
        </p>
        <h1
          id="galeri-title"
          className="mt-2 text-2xl md:text-4xl font-extrabold text-navy"
        >
          {gallery?.title ?? "Galeri"}
        </h1>
        <p className="mt-3 text-sm md:text-[15px] text-foreground/75 leading-relaxed max-w-2xl">
          {gallery?.description}
        </p>

        {/* Filter kategori */}
        <div
          role="group"
          aria-label="Filter kategori galeri"
          className="mt-8 flex flex-wrap gap-2"
        >
          {kategoriList.map((k) => (
            <button
              key={k}
              onClick={() => {
                setKategori(k);
                setLightbox(null);
              }}
              aria-pressed={kategori === k}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                kategori === k
                  ? "bg-navy text-white"
                  : "bg-white border border-border text-foreground/70 hover:border-primary/40"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <ul className="mt-8 columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
            {filtered.map((item, i) => (
              <li key={item.src} className="mb-4 break-inside-avoid">
                <button
                  onClick={() => setLightbox(i)}
                  className="group relative block w-full rounded-lg overflow-hidden border border-border bg-white focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={`Perbesar foto: ${item.judul}`}
                >
                  <span
                    className={`block relative ${i % 5 === 0 ? "aspect-[3/4]" : i % 5 === 3 ? "aspect-square" : "aspect-[4/3]"}`}
                  >
                    <Image
                      src={item.src}
                      alt={item.judul}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent p-3 pt-8 text-left">
                    <span className="block text-xs md:text-[13px] font-semibold text-white leading-snug line-clamp-2">
                      {item.judul}
                    </span>
                    <span className="block text-[10px] text-white/70 mt-0.5">
                      {item.kategori}
                      {item.tanggal && item.tanggal !== "—" && ` · ${item.tanggal}`}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <ImageOff className="mx-auto w-8 h-8 mb-3" aria-hidden />
            <p className="text-sm">
              Belum ada foto pada kategori ini. Guru dapat menambahkannya lewat panel admin.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => !open && setLightbox(null)}
      >
        <DialogContent
          className="max-w-4xl p-0 overflow-hidden bg-navy border-white/10 [&>button]:text-white [&>button]:bg-white/10 [&>button]:hover:bg-white/20"
          aria-describedby={undefined}
        >
          {current && (
            <figure className="relative">
              <div className="relative w-full aspect-[4/3] bg-black/40">
                <Image
                  src={current.src}
                  alt={current.judul}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <DialogTitle className="text-white font-bold text-sm md:text-base truncate">
                    {current.judul}
                  </DialogTitle>
                  <p className="text-xs text-white/60 mt-0.5">
                    {current.kategori}
                    {current.tanggal && current.tanggal !== "—" && ` · ${current.tanggal}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => step(-1)}
                    className="grid place-items-center w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/25"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </button>
                  <span className="text-xs text-white/60 tabular-nums">
                    {(lightbox ?? 0) + 1}/{filtered.length}
                  </span>
                  <button
                    onClick={() => step(1)}
                    className="grid place-items-center w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/25"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </button>
                </div>
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

type GaleriTabContent = {
  gallery: GallerySection;
};
