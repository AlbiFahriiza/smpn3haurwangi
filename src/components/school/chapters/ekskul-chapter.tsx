"use client";

import Link from "next/link";
import type { EkskulSection } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const FALLBACK = [
  "Pramuka",
  "Paskibra",
  "Bulu Tangkis",
  "Bola Voli",
  "Seni & Tari",
  "PMR",
];

/**
 * Bab ekstrakurikuler: pita nama yang terpotong kedua tepi layar, satu nama
 * wajib dinaikkan lebih besar daripada sisanya. Tidak ada potret per kegiatan
 * karena dokumentasinya memang belum ada — yang ada jadwal dan keterangannya.
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

        <ul className="mt-14 grid gap-x-12 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.nama} data-reveal-item>
              <h3 className="t-statement">{item.nama}</h3>
              <p className="t-small field-soft mt-1 tabular-nums">{item.jadwal}</p>
              <p className="t-body field-soft mt-3">{item.deskripsi}</p>
            </li>
          ))}
        </ul>

        <Link
          href={ROUTES.ekskul.path}
          className="t-small mt-12 inline-flex items-center gap-2 font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
        >
          Lihat halaman ekstrakurikuler
          <span aria-hidden>&rarr;</span>
        </Link>
      </Inner>
    </Chapter>
  );
}
