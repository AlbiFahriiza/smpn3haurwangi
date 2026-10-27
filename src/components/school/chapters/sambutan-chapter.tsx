"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { AboutSection, HomeSection, Identity } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Chapter, Inner } from "./chapter";
import { PeelText } from "@/components/motion/reveal";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

const STATEMENT_LINES = [
  "Menorehkan prestasi di tengah alam Cianjur,",
  "berdiri di atas fondasi iman,",
  "ilmu, dan amal.",
];

/**
 * Bab sambutan: satu panel gelap ditanam di bidang terang. Kalimat dari
 * sambutan resmi kepala sekolah dipakai apa adanya sebagai pernyataan,
 * di samping potret gerbang sekolah dibuka oleh topeng berbentuk pintu.
 */
export function SambutanChapter({
  sambutan,
  about,
  identity,
}: {
  sambutan?: HomeSection["sambutan"];
  about?: AboutSection;
  identity?: Identity;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const teks = sambutan?.teks ?? [];
  const nama = sambutan?.nama ?? identity?.kepalaSekolah ?? "Agus Solihin";
  const jabatan = sambutan?.jabatan ?? `Kepala ${identity?.nama ?? "SMP Negeri 3 Haurwangi"}`;
  const pernyataan = about?.sambutanTeks ?? STATEMENT_LINES.join(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-sambutan-photo]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-sambutan-photo]", start: "top 88%", once: true },
        });
        gsap.from("[data-sambutan-text] > *", {
          y: 24,
          opacity: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power4.out",
          scrollTrigger: { trigger: "[data-sambutan-text]", start: "top 84%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  if (teks.length === 0) return null;

  return (
    <Chapter field="foam" nav="light" pad="normal" id="sambutan">
      <Inner>
        <div
          ref={scope}
          className="rounded-xl bg-abyss p-6 text-white md:p-12 lg:p-16"
        >
          <h2 className="t-head">{sambutan?.title ?? "Sambutan Kepala Sekolah"}</h2>

          <p className="t-statement mt-6 max-w-[60rem] text-white/85">
            <PeelText lines={STATEMENT_LINES} />
          </p>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-14">
            <figure className="max-w-[22rem] lg:col-span-5">
              <div className="aspect-[3/4] overflow-hidden rounded-xl" data-sambutan-photo>
                <Image
                  src="/images/hero/gerbang-utama.jpg"
                  alt="Gerbang utama SMP Negeri 3 Haurwangi"
                  width={720}
                  height={960}
                  sizes="(min-width: 1024px) 30vw, 80vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="t-small mt-3 text-white/70">
                Gerbang utama sekolah, Jalan Buniayu.
              </figcaption>
            </figure>

            <div className="lg:col-span-6 lg:col-start-7">
              <div data-sambutan-text className="space-y-6">
                <p className="t-body">{teks[0]}</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <p className="t-body text-white/80">{teks[1]}</p>
                  <div className="space-y-6">
                    {teks[2] && <p className="t-body text-white/80">{teks[2]}</p>}
                    <Link
                      href={ROUTES.tentang.path}
                      className="t-small inline-flex items-center gap-2 font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                    >
                      Baca sejarah dan visi sekolah
                      <span aria-hidden>&rarr;</span>
                    </Link>
                  </div>
                </div>

                <p className="t-small text-white/70">
                  {nama}, {jabatan}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Inner>
    </Chapter>
  );
}

/** Dipakai halaman tentang; pernyataan yang sama tanpa panel. */
export function SambutanStatement({ teks }: { teks?: string }) {
  return <p className="t-statement">{teks ?? STATEMENT_LINES.join(" ")}</p>;
}
