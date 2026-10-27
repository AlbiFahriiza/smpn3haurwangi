"use client";

import Image from "next/image";
import Link from "next/link";
import type { EkskulSection } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";
import { fotoKegiatan } from "./ekskul-detail-chapter";

const FALLBACK = [
  "Pramuka",
  "Paskibra",
  "Bulu Tangkis",
  "Bola Voli",
  "Seni & Tari",
  "PMR",
];

/** Bentuk petak dibuat bergantian lebar dan sempit supaya deretannya tidak
 *  pernah terbaca sebagai kisi kartu yang seragam. */
const PETAK = [
  { kisi: "md:col-span-6", bentuk: "md:aspect-[16/9]" },
  { kisi: "md:col-span-3", bentuk: "md:aspect-[4/3]" },
  { kisi: "md:col-span-3", bentuk: "md:aspect-[4/3]" },
  { kisi: "md:col-span-3", bentuk: "md:aspect-[4/3]" },
  { kisi: "md:col-span-3", bentuk: "md:aspect-[4/3]" },
  { kisi: "md:col-span-6", bentuk: "md:aspect-[16/9]" },
];

/**
 * Bab ekstrakurikuler: pita nama yang terpotong kedua tepi layar, satu nama
 * wajib dinaikkan lebih besar daripada sisanya, lalu kartu-kartu landscape
 * berpotret asli sebagai pratinjau halaman ekstrakurikuler. API komponen ini
 * dipakai juga oleh beranda, jadi hanya isi dalamannya yang diperkaya.
 */
export function EkskulChapter({ ekskul }: { ekskul?: EkskulSection }) {
  const items = ekskul?.items ?? [];
  const names = items.length > 0 ? items.map((item) => item.nama) : FALLBACK;
  const wajib = items.find((item) => item.deskripsi.toLowerCase().includes("wajib"))?.nama;

  return (
    <Chapter field="abyss" nav="dark" pad="tall" id="ekstrakurikuler">
      <div className="band" aria-hidden="true">
        <div className="band-track">
          {[0, 1].map((half) => (
            <span key={half} className="flex items-baseline gap-[1.2em]">
              {names.map((name) => {
                const besar = name === wajib;
                return (
                  <span
                    key={`${half}-${name}`}
                    className={`t-hero whitespace-nowrap ${besar ? "text-white" : "text-white/50"}`}
                  >
                    {name}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      </div>

      <Inner className="mt-14 md:mt-20">
        {/* Judul bab ini dipegang pita nama di atas; heading ini menutup celah
            struktur supaya enam nama kegiatan punya induk yang jelas. */}
        <h2 className="sr-only">Ekstrakurikuler</h2>
        <Reveal className="max-w-3xl" stagger={0.06}>
          <p data-reveal-item className="t-statement">
            Enam kegiatan ekstrakurikuler di SMP Negeri 3 Haurwangi
            {wajib ? `, dengan ${wajib} sebagai kegiatan wajib bagi seluruh siswa` : ""}.
          </p>
          <p data-reveal-item className="t-body field-soft mt-4">
            {ekskul?.description ??
              "Kegiatan ekstrakurikuler wajib dan pilihan yang menyalurkan bakat, minat, dan karakter siswa."}
          </p>
        </Reveal>

        {/* Pratinjau kartu: di ponsel digulir menyamping dengan jepitan snap,
            di layar lebar tersusun asimetris. Potret diambil dari dokumentasi
            kegiatan sekolah sehari-hari. */}
        {items.length > 0 ? (
          <Reveal className="mt-14" stagger={0.07}>
            <ul
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 -mx-[clamp(1.25rem,4.5vw,4.5rem)] px-[clamp(1.25rem,4.5vw,4.5rem)] md:mx-0 md:grid md:grid-cols-12 md:snap-none md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0"
            >
              {items.map((item, index) => {
                const petak = PETAK[index % PETAK.length];
                const foto = fotoKegiatan(item.nama);
                return (
                  <li
                    key={item.nama}
                    data-reveal-item
                    className={`w-[78vw] max-w-[22rem] shrink-0 snap-start md:w-auto md:max-w-none ${petak.kisi}`}
                  >
                    <Link
                      href={ROUTES.ekskul.path}
                      className="group block rounded-xl transition-transform duration-150 active:translate-y-px"
                    >
                      <span
                        className={`block aspect-[16/10] overflow-hidden rounded-xl ${petak.bentuk}`}
                      >
                        <Image
                          src={foto.src}
                          alt={foto.alt}
                          fill
                          sizes="(min-width: 768px) 50vw, 78vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="mt-3 block transition-transform duration-500 group-hover:translate-x-[2px]">
                        <span className="t-statement flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: item.warna }}
                          />
                          {item.nama}
                        </span>
                        <span className="t-small field-soft mt-1 block tabular-nums">
                          {item.jadwal}
                        </span>
                      </span>
                      <span className="t-small field-soft mt-2 line-clamp-2 block">
                        {item.deskripsi}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ) : null}

        <Link
          href={ROUTES.ekskul.path}
          className="t-small mt-12 inline-flex items-center gap-2 rounded-lg bg-foam px-5 py-3 font-semibold text-abyss transition-[background-color,transform] duration-200 hover:bg-sky active:translate-y-px"
        >
          Lihat halaman ekstrakurikuler
          <span aria-hidden>&rarr;</span>
        </Link>
      </Inner>
    </Chapter>
  );
}
