"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Maximize2, XIcon } from "lucide-react";
import type { DenahSection, Identity, StudentsSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";

gsap.registerPlugin(ScrollTrigger);

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

type Tempat = {
  nama: string;
  detail: string;
  src: string;
};

/**
 * Bab fasilitas: satu panel berbingkai abyss dengan potret tempat di atasnya,
 * dipilih dari daftar nama di sebelahnya. Potret bergerak dua persen naik-turun
 * mengikuti gulir seperti benda nyata di atas bingkainya, dan ketika pengunjung
 * memilih tempat lain, potret itu berangkat dari item legenda yang diklik lalu
 * menetap kembali ke tempatnya (FLIP manual: rect awal diukur, lalu animasi
 * x/y/scale menuju rect akhir, murni transform tanpa reflow).
 */
export function FasilitasChapter({
  denah,
  students,
  identity,
}: {
  denah?: DenahSection;
  students?: StudentsSection;
  identity?: Identity;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Denah besar (lightbox): terbang dari figur denah kecil memakai FLIP manual
  // yang sama dengan panel ekskul, supaya momen geraknya seragam antarhalaman.
  const [denahBuka, setDenahBuka] = useState(false);
  const denahAsal = useRef<DOMRect | null>(null);
  const denahPanel = useRef<HTMLDivElement>(null);
  const denahScrim = useRef<HTMLDivElement>(null);
  const denahTutup = useRef<HTMLButtonElement>(null);

  // Keterangan tiap tempat diambil dari data sekolah; potret hanya dipakai
  // untuk tempat yang memang punya dokumentasi.
  const places: Tempat[] = [
    {
      nama: denah?.fasilitas?.[0]?.nama ?? "Lapang Upacara / Voli",
      detail:
        denah?.fasilitas?.[0]?.detail ??
        "Tempat upacara bendera setiap Senin dan olahraga voli",
      src: "/images/fasilitas/fasilitas-8.jpg",
    },
    {
      nama: denah?.fasilitas?.[1]?.nama ?? "Lapang Badminton",
      detail: denah?.fasilitas?.[1]?.detail ?? "Lapangan bulu tangkis di sisi tengah sekolah",
      src: "/images/fasilitas/fasilitas-7.jpg",
    },
    {
      nama: "Ruang Kelas",
      detail: "14 ruang kelas pada blok G, dipakai tiga tingkat kelas.",
      src: "/images/fasilitas/fasilitas-9.jpg",
    },
    {
      nama: "Gedung Induk",
      detail: "Blok A sampai C: ruang guru, ruang kepala sekolah, dan tata usaha.",
      src: "/images/fasilitas/fasilitas-5.jpg",
    },
    {
      nama: "Halaman Depan",
      detail: "Halaman dan area parkir tepat di depan sekolah.",
      src: "/images/fasilitas/fasilitas-6.jpg",
    },
  ];

  const active = places[Math.min(activeIndex, places.length - 1)];
  const kode = denah?.keterangan ?? [];
  const bisa = students?.fasilitasBelajar ?? [];
  const denahGambar = denah?.image ?? "/images/denah-sekolah.jpg";

  // Panel denah besar berangkat dari figur denah yang diklik (FLIP manual:
  // rect figur diukur saat klik, panel diukur sebelum paint, lalu fromTo
  // x/y/scale menjembataninya). Gerak minimal langsung menampilkan hasil.
  useGSAP(
    () => {
      if (!denahBuka) return;
      const panel = denahPanel.current;
      const scrim = denahScrim.current;
      if (!panel || !scrim) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const asal = denahAsal.current;
        if (asal) {
          const akhir = panel.getBoundingClientRect();
          gsap.fromTo(
            panel,
            {
              x: asal.left - akhir.left,
              y: asal.top - akhir.top,
              scale: Math.max(asal.width / akhir.width, 0.2),
              transformOrigin: "top left",
            },
            { x: 0, y: 0, scale: 1, duration: 0.5, ease: "expo.out" },
          );
        }
        gsap.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
      });
      mm.add(REDUCE, () => {
        gsap.set(scrim, { autoAlpha: 1 });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [denahBuka] },
  );

  // Saat panel terbuka: gulir latar dikunci (Lenis ikut dihentikan) dan fokus
  // papan tombol masuk dari tombol tutup.
  useEffect(() => {
    if (!denahBuka) return;
    const lenis = window.__lenis ?? null;
    lenis?.stop();
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    denahTutup.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = sebelumnya;
      lenis?.start();
    };
  }, [denahBuka]);

  const bukaDenah = (event: React.MouseEvent<HTMLButtonElement>) => {
    denahAsal.current =
      event.currentTarget.closest("figure")?.getBoundingClientRect() ?? null;
    setDenahBuka(true);
  };

  const tutupDenah = () => {
    setDenahBuka(false);
    denahAsal.current = null;
  };

  const padaKunciDenah = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      tutupDenah();
    } else if (event.key === "Tab") {
      // Kunci fokus sederhana: hanya tombol tutup yang bisa difokus di panel.
      event.preventDefault();
      denahTutup.current?.focus({ preventScroll: true });
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          "[data-disc-object]",
          { yPercent: -2 },
          {
            yPercent: 2,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        // Panel terbuka dari balik garis atasnya (clip-path, bukan opacity),
        // jadi tidak pernah bertabrakan properti dengan FLIP x/y/scale.
        gsap.from("[data-disc-object]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-disc]", start: "top 82%", once: true },
        });
        gsap.from("[data-place-list] > li", {
          y: 18,
          opacity: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-place-list]", start: "top 86%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  /**
   * FLIP manual: item legenda yang diklik dan panel potret sama-sama diukur
   * rect-nya, lalu panel dianimasikan transform dari rect item menuju rect
   * asalnya dengan ease expo.out. Dengan begitu potret "berangkat" dari item
   * yang dipilih, bukan muncul dari kosong. Gerak minimal: potret berganti
   * seketika tanpa perjalanan.
   */
  const pilihTempat = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (index === activeIndex) return;
    setActiveIndex(index);

    const panel = scope.current?.querySelector<HTMLElement>("[data-disc-object]");
    if (!panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = event.currentTarget.getBoundingClientRect();
    const to = panel.getBoundingClientRect();
    // Skala awal dijaga seragam (bukan x/y terpisah) supaya potret tidak
    // melar; dibatasi supaya panel kecil tapi masih terbaca saat berangkat.
    const skala = Math.min(Math.max(from.height / to.height, 0.3), 1);
    gsap.fromTo(
      panel,
      {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: skala,
      },
      { x: 0, y: 0, scale: 1, duration: 0.55, ease: "expo.out", overwrite: "auto" },
    );
  };

  return (
    <Chapter field="sky" nav="light" pad="tall" id="fasilitas-sekolah">
      <div ref={scope}>
        <Inner>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            {/* Panel potret tempat */}
            <div className="lg:col-span-6">
              <div data-disc className="relative mx-auto aspect-square w-full max-w-[30rem]">
                <div className="absolute inset-0 rounded-xl bg-abyss" aria-hidden />
                {/* z-index supaya panel yang sedang terbang dari item legenda
                    melintas di atas daftar, bukan tersembunyi di baliknya. */}
                <div
                  data-disc-object
                  className="absolute inset-[7%] z-[1] overflow-hidden rounded-xl"
                >
                  <Image
                    key={active.src}
                    src={active.src}
                    alt={`${active.nama} SMP Negeri 3 Haurwangi`}
                    fill
                    sizes="(min-width: 1024px) 30rem, 84vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="t-small mt-6 text-center lg:text-left">
                <span className="t-hero tabular-nums block leading-none">
                  {identity?.luasTanah ?? "6.138 m²"}
                </span>
                <span className="field-soft block">Luas lahan sekolah</span>
              </p>
            </div>

            {/* Daftar tempat */}
            <div className="lg:col-span-6">
              <h2 className="t-head">Fasilitas sekolah</h2>
              <p className="t-body field-soft mt-4">
                Pilih satu tempat untuk melihat keterangannya. Semua nama dan ukuran di bawah
                diambil dari data resmi sekolah.
              </p>

              <ul data-place-list className="mt-8">
                {places.map((place, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={place.nama}>
                      <button
                        type="button"
                        onClick={(event) => pilihTempat(index, event)}
                        aria-pressed={isActive}
                        className={`w-full rounded-md px-5 py-4 text-left transition active:translate-y-px ${
                          isActive ? "bg-abyss text-white" : "hover:bg-abyss/6"
                        }`}
                      >
                        <span className="flex items-baseline gap-4">
                          <span className={`t-statement ${isActive ? "" : "field-soft"}`}>
                            {place.nama}
                          </span>
                        </span>
                        <span
                          className={`t-small mt-1 block ${
                            isActive ? "text-white/90" : "field-soft"
                          }`}
                        >
                          {place.detail}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Inner>

        {/* Denah + keterangan blok */}
        <Inner className="mt-16 md:mt-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <figure className="relative lg:col-span-7">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                <Image
                  src={denahGambar}
                  alt="Denah blok bangunan SMP Negeri 3 Haurwangi"
                  fill
                  sizes="(min-width: 1024px) 55vw, 92vw"
                  className="object-contain"
                />
                {/* Penanda perbesar di pojok: papan tombol yang sama lebar dengan
                    figur, jadi seluruh denah bisa diklik, termasuk dari ponsel. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-abyss/85 px-2.5 py-1.5 text-white"
                >
                  <Maximize2 className="size-3.5" />
                  <span className="t-small font-semibold">Perbesar</span>
                </span>
                <button
                  type="button"
                  onClick={bukaDenah}
                  aria-label="Perbesar denah sekolah"
                  className="absolute inset-0 cursor-zoom-in rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                />
              </div>
              <figcaption className="t-small field-soft mt-3">
                {denah?.title ?? "Denah Sekolah"}
                {denah?.description ? `. ${denah.description}` : ""}{" "}
                Klik denah untuk membacanya dalam ukuran besar.
              </figcaption>
            </figure>

            <div className="lg:col-span-5">
              <h3 className="t-statement">Blok A sampai K</h3>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
                {kode.map((item) => (
                  <div key={item.kode} className="flex gap-2">
                    <dt className="t-small tabular-nums font-semibold">{item.kode}</dt>
                    <dd className="t-small field-soft">{item.nama}</dd>
                  </div>
                ))}
              </dl>

              {bisa.length > 0 && (
                <ul className="mt-8 space-y-2">
                  {bisa.map((item) => (
                    <li key={item.nama} className="t-small flex justify-between gap-4">
                      <span>{item.nama}</span>
                      <span className="tabular-nums font-semibold">{item.jumlah}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Inner>

        {/* Denah dalam ukuran besar: terbang dari figur kecilnya (FLIP), bisa
            ditutup lewat pita kelabu, tombol Tutup, atau tombol Escape. */}
        {denahBuka ? (
          <div className="fixed inset-0 z-50" onKeyDown={padaKunciDenah}>
            <div
              ref={denahScrim}
              onClick={tutupDenah}
              aria-hidden
              className="absolute inset-0 bg-abyss/80 opacity-0"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div
                ref={denahPanel}
                role="dialog"
                aria-modal="true"
                aria-label="Denah sekolah diperbesar"
                className="relative overflow-hidden rounded-xl bg-white outline outline-1 -outline-offset-1 outline-line"
              >
                <div className="relative h-[82svh] w-[min(92vw,64rem)]">
                  <Image
                    src={denahGambar}
                    alt="Denah blok bangunan SMP Negeri 3 Haurwangi, tampilan diperbesar"
                    fill
                    sizes="92vw"
                    className="object-contain"
                  />
                </div>
                <button
                  ref={denahTutup}
                  type="button"
                  onClick={tutupDenah}
                  className="t-small absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-abyss px-3.5 py-2.5 font-semibold text-white transition-transform duration-200 active:translate-y-px"
                >
                  <XIcon aria-hidden className="size-4" />
                  Tutup
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Chapter>
  );
}
