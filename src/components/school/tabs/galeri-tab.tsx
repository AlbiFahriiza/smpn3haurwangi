"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { Chapter, Inner } from "../chapters/chapter";
import { Reveal } from "@/components/motion/reveal";
import { OpenerChapter } from "../chapters/opener-chapter";
import { KontakChapter } from "../chapters/kontak-chapter";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * Bentuk petak diulang dalam satu pola enam langkah supaya deretannya tidak
 * pernah terbaca sebagai kisi kartu yang seragam.
 */
const POLA = [
  "md:col-span-6 aspect-[4/3]",
  "md:col-span-6 aspect-[4/3]",
  "md:col-span-4 aspect-square",
  "md:col-span-4 aspect-square",
  "md:col-span-4 aspect-square",
  "md:col-span-12 aspect-[16/9]",
];

/** Empat pasang warna pita label, semuanya dari palet brand. */
const PITA = [
  "bg-foam text-ink",
  "bg-sky text-ink",
  "bg-marine text-white",
  "bg-line text-ink",
];

export function GaleriTab({ content }: { content: Partial<SiteContent> }) {
  const gallery = content.gallery;
  const semua = gallery?.items ?? [];
  const kategori = gallery?.kategori ?? ["Semua"];

  const [pilih, setPilih] = useState("Semua");
  const [buka, setBuka] = useState<number | null>(null);

  const tersaring = useMemo(
    () => (pilih === "Semua" ? semua : semua.filter((item) => item.kategori === pilih)),
    [semua, pilih],
  );

  const geser = (arah: 1 | -1) => {
    const jumlah = tersaring.length;
    if (jumlah === 0) return;
    setBuka((kini) => (kini === null ? kini : (kini + arah + jumlah) % jumlah));
  };

  // Papan tombol menggeser foto selama penampil terbuka.
  useEffect(() => {
    if (buka === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") geser(1);
      if (event.key === "ArrowLeft") geser(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buka, tersaring]);

  const aktif = buka !== null ? tersaring[buka] : null;
  const kategoriTerpakai = kategori.filter(
    (nama) => nama === "Semua" || semua.some((item) => item.kategori === nama),
  );

  return (
    <>
      <OpenerChapter
        field={BIDANG_PEMBUKA["/galeri"].field}
        nav={BIDANG_PEMBUKA["/galeri"].ink}
        judul="Galeri"
        pengantar={
          gallery?.description ??
          "Dokumentasi kegiatan SMP Negeri 3 Haurwangi, dari kegiatan belajar hingga pentas seni."
        }
        keterangan={
          <p className="t-small field-soft tabular-nums">
            {semua.length} foto · {kategoriTerpakai.length - 1} kategori
          </p>
        }
        gambar={{
          src: "/images/galeri/pentas-seni-1.jpg",
          alt: "Pentas seni dan pelepasan siswa kelas 9 SMP Negeri 3 Haurwangi",
        }}
      />

      <Chapter field="foam" nav="light" pad="tall" id="semua-foto">
        <Inner>
          <Reveal stagger={0.08}>
            <h2 data-reveal-item className="t-head">
              Dokumentasi kegiatan
            </h2>
            <p data-reveal-item className="t-body field-soft mt-7 max-w-[58ch]">
              Seluruh foto di halaman ini berasal dari dokumentasi resmi kegiatan sekolah. Nama
              kategori mengikuti penamaan pada berkas galeri sekolah, dari kegiatan belajar sampai
              pentas seni dan pelepasan kelas 9.
            </p>
          </Reveal>

          <div
            role="group"
            aria-label="Saring galeri menurut kategori"
            className="mt-12 flex flex-wrap gap-2"
          >
            {kategoriTerpakai.map((nama) => {
              const jumlah =
                nama === "Semua"
                  ? semua.length
                  : semua.filter((item) => item.kategori === nama).length;
              const sedang = pilih === nama;
              return (
                <button
                  key={nama}
                  type="button"
                  onClick={() => {
                    setPilih(nama);
                    setBuka(null);
                  }}
                  aria-pressed={sedang}
                  className={`t-small px-5 py-3 font-semibold transition-colors ${
                    sedang ? "bg-abyss text-white" : "field-soft hover:bg-abyss/6"
                  }`}
                >
                  {nama}
                  <span className="tabular-nums"> {jumlah}</span>
                </button>
              );
            })}
          </div>

          {tersaring.length > 0 ? (
            <Reveal className="mt-10" stagger={0.045}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-2.5">
                {tersaring.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    data-reveal-item
                    onClick={() => setBuka(index)}
                    aria-label={`Perbesar foto: ${item.judul}`}
                    className={`group relative block overflow-hidden text-left ${
                      POLA[index % POLA.length]
                    }`}
                  >
                    <Image
                      src={item.src}
                      alt={item.judul}
                      fill
                      sizes="(min-width: 768px) 46vw, 92vw"
                      priority={index < 2}
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                    <span
                      className={`t-body absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 px-4 py-3 font-semibold ${
                        PITA[index % PITA.length]
                      }`}
                    >
                      <span className="truncate">{item.judul}</span>
                      {item.tanggal && item.tanggal !== "-" ? (
                        <span className="t-small tabular-nums">{item.tanggal}</span>
                      ) : (
                        <span className="t-small tabular-nums">{item.kategori}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          ) : (
            <p className="t-body field-soft mt-10">
              Belum ada foto pada kategori ini. Guru dapat menambahkannya lewat panel admin.
            </p>
          )}
        </Inner>
      </Chapter>

      <KontakChapter contact={content.contact} identity={content.identity} />

      <Dialog open={buka !== null} onOpenChange={(open) => !open && setBuka(null)}>
        <DialogContent
          aria-describedby={undefined}
          className="max-w-5xl rounded-none border-0 bg-abyss p-0 text-white shadow-none [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100"
        >
          {aktif ? (
            <figure>
              <div className="relative aspect-[4/3] w-full bg-deep">
                <Image
                  src={aktif.src}
                  alt={aktif.judul}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="flex flex-wrap items-end justify-between gap-6 px-6 py-5">
                <div className="min-w-0">
                  <DialogTitle className="t-statement text-white">{aktif.judul}</DialogTitle>
                  <p className="t-small field-soft mt-1">
                    {aktif.kategori}
                    {aktif.tanggal && aktif.tanggal !== "-" ? ` · ${aktif.tanggal}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => geser(-1)}
                    aria-label="Foto sebelumnya"
                    className="t-small bg-white/12 px-4 py-3 font-semibold transition-colors hover:bg-white/25"
                  >
                    Sebelumnya
                  </button>
                  <span className="t-small tabular-nums opacity-90">
                    {(buka ?? 0) + 1}/{tersaring.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => geser(1)}
                    aria-label="Foto berikutnya"
                    className="t-small bg-white/12 px-4 py-3 font-semibold transition-colors hover:bg-white/25"
                  >
                    Berikutnya
                  </button>
                </div>
              </figcaption>
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
