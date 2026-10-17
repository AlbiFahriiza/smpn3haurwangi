"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { HomeSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/**
 * Bab berita: satu gambar besar memimpin, dua kabar lainnya turun sebagai pita
 * bergantian nada. Tanggal ditulis apa adanya karena data sekolah hanya
 * menyimpan bulan, bukan tanggal.
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
                className="relative aspect-[3/2] w-full overflow-hidden bg-line"
              >
                <Image
                  src={utama.image}
                  alt={utama.title}
                  fill
                  sizes="(min-width: 1024px) 55vw, 92vw"
                  className="object-cover"
                />
              </div>
            </div>

            <Reveal className="lg:col-span-5" stagger={0.08}>
              <h3 data-reveal-item className="t-statement">
                {utama.title}
              </h3>
              <p data-reveal-item className="t-small field-soft mt-2 tabular-nums">
                {utama.date}
              </p>
              <p data-reveal-item className="t-body field-soft mt-3">
                {utama.excerpt}
              </p>
            </Reveal>
          </div>

          {sisa.length > 0 && (
            <ol className="mt-10">
              {sisa.map((item, index) => (
                <li
                  key={item.title}
                  data-reveal-item
                  className={`grid grid-cols-[5rem_1fr] items-center gap-5 px-5 py-6 md:grid-cols-[7rem_1fr_auto] md:gap-8 md:px-7 ${
                    index % 2 === 0 ? "bg-white" : "bg-line"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-abyss">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="8rem"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="t-statement">{item.title}</h3>
                    <p className="t-body field-soft mt-1">{item.excerpt}</p>
                  </div>
                  <p className="t-small field-soft col-start-2 tabular-nums md:col-start-3">
                    {item.date}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Inner>
      </div>
    </Chapter>
  );
}
