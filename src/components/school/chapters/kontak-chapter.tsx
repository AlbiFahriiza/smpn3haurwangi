"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { ContactSection, Identity } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

const STRIP = [
  { src: "/images/hero/gerbang-utama.jpg", alt: "Gerbang utama SMP Negeri 3 Haurwangi" },
  { src: "/images/fasilitas/fasilitas-8.jpg", alt: "Lapang upacara SMP Negeri 3 Haurwangi" },
  { src: "/images/galeri/kegiatan-luar-2.jpg", alt: "Foto bersama warga SMP Negeri 3 Haurwangi" },
];

/**
 * Bab penutup: tiga potret sekolah, satu bar tiga sel berisi alamat, surel, dan
 * jam layanan, lalu satu petak aksi. Nomor telepon sengaja tidak dicantumkan
 * karena sumber resmi belum mempublikasikannya.
 */
export function KontakChapter({
  contact,
  identity,
}: {
  contact?: ContactSection;
  identity?: Identity;
}) {
  const scope = useRef<HTMLDivElement>(null);

  const alamat = contact?.alamat ?? identity?.alamat ?? "";
  const email = contact?.email ?? identity?.email ?? "";
  const jam = contact?.jamLayanan ?? "Senin-Jumat, 07.00-15.30 WIB";
  const peta = contact?.mapsLink ?? "https://www.google.com/maps?q=-6.8005,107.3064";
  const surelUrl = `mailto:${email}?subject=Pertanyaan%20tentang%20SMP%20Negeri%203%20Haurwangi`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-strip-foto]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.1,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-strip-foto]", start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <Chapter field="deep" nav="dark" pad="tall" id="kontak">
      <div ref={scope}>
        <Inner>
          <Reveal>
            <h2 data-reveal-item className="t-head">
              Hubungi sekolah
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-3 gap-2">
            {STRIP.map((foto) => (
              <div
                key={foto.src}
                data-strip-foto
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-abyss"
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 31vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>

          <Reveal className="mt-2" stagger={0.07}>
            <div className="grid gap-6 md:grid-cols-12 md:gap-4">
              <div data-reveal-item className="md:col-span-5 md:rounded-xl md:bg-white/8 md:p-6">
                <p className="t-small field-soft">Alamat</p>
                <p className="t-body mt-2">{alamat}</p>
              </div>
              <div data-reveal-item className="md:col-span-4 md:rounded-xl md:bg-white/16 md:p-6">
                <p className="t-small field-soft">Surel resmi</p>
                <a
                  href={surelUrl}
                  className="t-body mt-2 block break-words underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  {email}
                </a>
              </div>
              <div data-reveal-item className="md:col-span-3 md:rounded-xl md:bg-white/8 md:p-6">
                <p className="t-small field-soft">Jam layanan</p>
                <p className="t-body mt-2">{jam}</p>
              </div>
            </div>
          </Reveal>

          {/* Petak aksi */}
          <Reveal className="mt-2" y={24}>
            <div
              data-reveal-item
              className="grid gap-8 overflow-hidden rounded-xl bg-marine p-7 text-white md:grid-cols-12 md:items-end md:p-12"
            >
              <div className="md:col-span-7">
                <p className="t-statement max-w-[34ch]">
                  Ada pertanyaan tentang pendaftaran, jadwal, atau kunjungan sekolah?
                </p>
                <p className="t-body mt-4 text-white/85">
                  Surel sekolah dibaca dan dibalas pada hari kerja. Untuk kunjungan, sebutkan
                  tanggal dan keperluannya supaya bisa dijadwalkan lebih dulu.
                </p>
              </div>
              <div className="md:col-span-5 md:justify-self-end">
                <div className="flex flex-col items-start gap-4 md:items-end">
                  <a
                    href={surelUrl}
                    className="t-body rounded-lg bg-foam px-6 py-4 font-semibold text-ink transition-[background-color,translate] duration-200 hover:bg-white hover:-translate-y-px active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Kirim surel ke sekolah
                  </a>
                  <a
                    href={peta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-small underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                  >
                    Lihat lokasi di peta
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-6" stagger={0.07}>
            <p data-reveal-item className="t-body field-soft max-w-[62ch]">
              Nomor telepon belum dipublikasikan pada sumber resmi sekolah, jadi tidak dicantumkan
              di sini. Alamat dan surel di atas berasal dari data resmi Kemendikdasmen.
            </p>
            <Link
              href={ROUTES.kontak.path}
              data-reveal-item
              className="t-small mt-8 inline-flex items-center gap-2 font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              Halaman kontak lengkap dengan peta
              <span aria-hidden>&rarr;</span>
            </Link>
          </Reveal>
        </Inner>
      </div>
    </Chapter>
  );
}
