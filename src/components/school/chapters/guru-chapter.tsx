"use client";

import Image from "next/image";
import Link from "next/link";
import type { TeachersSection } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

/**
 * Bab guru: satu kepala yang tetap di tempatnya sementara baris-baris wajah
 * lewat di sebelahnya. Hanya potret yang memang sudah ada di data sekolah yang
 * ditampilkan; jumlah total tetap disebut apa adanya.
 */
export function GuruChapter({ teachers }: { teachers?: TeachersSection }) {
  const semua = teachers?.items ?? [];
  const berfoto = semua.filter((item) => item.foto);
  const statistik = teachers?.statistik ?? [];

  if (berfoto.length === 0) return null;

  return (
    <Chapter field="foam" nav="light" pad="tall" id="guru-dan-tendik">
      <Inner>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h2 className="t-head">Guru &amp; tenaga kependidikan</h2>

              <dl className="mt-8">
                {statistik.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-6 py-2">
                    <dt className="t-small field-soft">{item.label}</dt>
                    <dd className="t-statement tabular-nums">{item.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="t-small field-soft mt-6 max-w-sm">
                {berfoto.length} wajah di samping sudah terdata lengkap dengan foto. Total
                {" "}
                {statistik.find((item) => item.label.toLowerCase().includes("tendik"))?.value ??
                  "16"}
                {" "}
                guru dan tenaga kependidikan bertugas di sekolah ini.
              </p>

              <Link
                href={ROUTES.tentang.path}
                className="t-small mt-6 inline-flex items-center gap-2 font-semibold underline decoration-marine/40 underline-offset-4 transition-colors hover:decoration-marine"
              >
                Profil lengkap di halaman tentang
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>

          <Reveal className="lg:col-span-7" y={32} stagger={0.1}>
            <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {berfoto.map((item) => (
                <li key={item.nama} data-reveal-item>
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-line">
                    <Image
                      src={item.foto}
                      alt={`${item.nama}, ${item.jabatan} SMP Negeri 3 Haurwangi`}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="t-statement mt-4">{item.nama}</h3>
                  <p className="t-small field-soft">
                    {item.jabatan}
                    {item.mapel && item.mapel !== "-" ? ` · ${item.mapel}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Inner>
    </Chapter>
  );
}
