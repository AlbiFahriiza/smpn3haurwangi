"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GallerySection } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Chapter, Inner } from "./chapter";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/** Tujuh momen yang paling berbeda satu sama lain, dipilih lewat nama berkas. */
const PILIHAN = [
  "pentas-seni-1.jpg",
  "pengajian.jpg",
  "upacara-apel-pagi.jpg",
  "kegiatan-belajar-1.jpg",
  "pawai-siswa.jpg",
  "kegiatan-luar-3.jpg",
  "anbk.jpg",
];

/** Lebar dan bentuk petak dibuat berbeda-beda supaya tidak jadi deretan kartu. */
const LAYOUT = [
  "md:col-span-7 aspect-[4/3]",
  "md:col-span-5 aspect-[4/3]",
  "md:col-span-4 aspect-square",
  "md:col-span-4 aspect-square",
  "md:col-span-4 aspect-square",
  "md:col-span-5 aspect-[4/3]",
  "md:col-span-7 aspect-[4/3]",
];

/** Empat pasang warna label yang berulang, semuanya dari palet brand. */
const STRIP = [
  "bg-foam text-ink",
  "bg-sky text-ink",
  "bg-marine text-white",
  "bg-line text-ink",
  "bg-foam text-ink",
  "bg-marine text-white",
  "bg-sky text-ink",
];

/**
 * Bab galeri: potret-potret asli sekolah dengan pita label di kakinya, tiap
 * pita memakai satu dari empat pasang warna. Semuanya membuka dari bawah saat
 * masuk layar.
 */
export function GaleriChapter({ gallery }: { gallery?: GallerySection }) {
  const scope = useRef<HTMLDivElement>(null);
  const semua = gallery?.items ?? [];
  const dipilih = PILIHAN.map((berkas) =>
    semua.find((item) => item.src.endsWith(berkas)),
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const tiles = dipilih.length >= 4 ? dipilih : semua.slice(0, 7);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-tile]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.15,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-tile-grid]", start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  if (tiles.length === 0) return null;

  return (
    <Chapter field="ink" nav="dark" pad="tall" id="galeri">
      <div ref={scope}>
        <Inner>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <h2 className="t-head">{gallery?.title ?? "Galeri"}</h2>
            </div>
            <p className="t-body field-soft md:col-span-5">
              {gallery?.description ??
                "Dokumentasi kegiatan SMP Negeri 3 Haurwangi, dari kegiatan belajar hingga pentas seni."}
            </p>
          </div>

          <div
            data-tile-grid
            className="mt-12 grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-2.5"
          >
            {tiles.map((item, index) => (
              <Link
                key={item.src}
                href={ROUTES.galeri.path}
                data-tile
                className={`group relative block overflow-hidden ${
                  LAYOUT[index] ?? "md:col-span-4 aspect-square"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.judul}
                  fill
                  sizes="(min-width: 768px) 45vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <span
                  className={`t-small absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 px-4 py-3 font-semibold ${
                    STRIP[index % STRIP.length]
                  }`}
                >
                  <span>{item.judul}</span>
                  {/* Tanggal dibiarkan kosong kalau sumbernya memang belum punya
                      tanggal; tanda "-" hanya akan terbaca seperti nilai rusak. */}
                  {item.tanggal && item.tanggal !== "-" ? (
                    <span className="tabular-nums">{item.tanggal}</span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>

          <Link
            href={ROUTES.galeri.path}
            className="t-small mt-10 inline-flex items-center gap-2 font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
          >
            Seluruh {semua.length} foto ada di halaman galeri
            <span aria-hidden>&rarr;</span>
          </Link>
        </Inner>
      </div>
    </Chapter>
  );
}
