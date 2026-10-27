"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { HomeSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/** Gelambung gerak yang dipakai foto saat disentuh: cepat di awal, panjang
 * menetap di akhir (cubic-bezier milik desain), dan mati otomatis ketika
 * pengguna meminta gerak minimal. */
const FOTO_HOVER =
  "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]";

/**
 * Bab berita: satu gambar besar memimpin, dua kabar lainnya turun sebagai pita
 * bergantian nada. Kartu dan potret memakai sudut pelan (rounded-xl), tanggal
 * jadi chip kecil (rounded-md). Tanggal ditulis apa adanya karena data
 * sekolah hanya menyimpan bulan, bukan tanggal.
 */
export function BeritaChapter({ berita }: { berita?: HomeSection["berita"] }) {
  const scope = useRef<HTMLDivElement>(null);
  const items = berita ?? [];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-kabar-utama]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-kabar-utama]", start: "top 86%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  if (items.length === 0) return null;

  const [utama, ...sisa] = items;

  return (
    <Chapter field="sky" nav="light" pad="tall" id="kabar-sekolah">
      <div ref={scope}>
        <Inner>
          <h2 className="t-head">Kabar dari sekolah</h2>

          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <div
                data-kabar-utama
                className="group relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-line"
              >
                <Image
                  src={utama.image}
                  alt={utama.title}
                  fill
                  sizes="(min-width: 1024px) 55vw, 92vw"
                  className={`object-cover ${FOTO_HOVER}`}
                />
              </div>
            </div>

            <Reveal className="lg:col-span-5" stagger={0.08}>
              <h3 data-reveal-item className="t-statement">
                {utama.title}
              </h3>
              <p
                data-reveal-item
                className="t-small tabular-nums mt-4 inline-flex items-baseline gap-2 rounded-md bg-white px-3 py-1.5 font-semibold"
              >
                {utama.date}
              </p>
              <p data-reveal-item className="t-body field-soft mt-4">
                {utama.excerpt}
              </p>
            </Reveal>
          </div>

          {sisa.length > 0 && (
            <Reveal className="mt-10" y={26} stagger={0.07}>
              <ol className="space-y-2">
                {sisa.map((item, index) => (
                  <li
                    key={item.title}
                    data-reveal-item
                    className={`grid grid-cols-[5rem_1fr] items-center gap-5 rounded-xl px-5 py-6 md:grid-cols-[7rem_1fr_auto] md:gap-8 md:px-7 ${
                      index % 2 === 0 ? "bg-white" : "bg-line"
                    }`}
                  >
                    <div className="group relative aspect-square w-full overflow-hidden rounded-md bg-abyss">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="8rem"
                        className={`object-cover ${FOTO_HOVER}`}
                      />
                    </div>
                    <div>
                      <h3 className="t-statement">{item.title}</h3>
                      <p className="t-body field-soft mt-1">{item.excerpt}</p>
                    </div>
                    <p className="t-small tabular-nums col-start-2 justify-self-start rounded-md bg-white px-3 py-1.5 font-semibold md:col-start-3 md:justify-self-end">
                      {item.date}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </Inner>
      </div>
    </Chapter>
  );
}
