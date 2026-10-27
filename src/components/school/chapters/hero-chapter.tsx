"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Identity, StudentsSection } from "@/lib/content";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/**
 * Bab pembuka: dua bidang datar bertemu tepat di garis tengah layar. Judul
 * berdiri melintang di atas garis itu — baris pertama tinta gelap di bidang
 * terang, baris kedua tinta terang di bidang biru. Karena baris kedua sewarna
 * bidang terang, ia baru muncul saat bidang biru naik menutupi garis.
 */
export function HeroChapter({
  identity,
  students,
}: {
  identity?: Identity;
  students?: StudentsSection;
}) {
  const scope = useRef<HTMLElement>(null);

  const nama = identity?.nama ?? "SMP Negeri 3 Haurwangi";
  const status = (identity?.status ?? "Negeri").toLowerCase();
  const akreditasi = identity?.akreditasi ?? "B";
  const alamat =
    identity?.alamat ?? "Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi, Kab. Cianjur, Jawa Barat 43282";
  const total = students?.total ?? 382;
  const rombel = students?.rombel ?? 12;

  /** Baris fakta resmi di kaki hero: data identitas sekolah apa adanya,
   * tanpa angka rekaan. Bentuknya tipografis dengan garis rambut, bukan kartu. */
  const meta: Array<[string, string]> = [
    ["NPSN", identity?.npsn ?? "20252209"],
    ["Akreditasi", akreditasi],
    ["Kurikulum", identity?.kurikulum ?? "Kurikulum Merdeka"],
    ["Jenis", identity?.penyelenggaraan ?? "Sehari Penuh / 5 Hari"],
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        // Hanya gerak, tanpa animasi opacity: teks pembuka (LCP halaman) harus
        // terbaca sejak cat pertama, bukan menunggu tween selesai.
        tl.from("[data-hero-field]", { scaleY: 0, duration: 1.25 }, 0)
          .from("[data-hero-title]", { yPercent: 34, duration: 1.3 }, 0.05)
          .from("[data-hero-note]", { y: 16, duration: 1 }, 0.6);
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} data-nav="light" aria-labelledby="hero-title" className="hero">
      <div className="hero-fields" aria-hidden="true">
        {/* Tekstur grid institusional di bidang terang: garis tipis 1px yang
            menegaskan bahasa rupa kelembagaan, bukan dekorasi acak. */}
        <div className="hero-field-top bg-civic-grid" />
        <div className="hero-field-bottom" data-hero-field />
      </div>

      <div className="hero-stage">
        <h1 id="hero-title" data-hero-title className="t-hero hero-title">
          <span className="hero-title-line hero-title-top">SMP Negeri 3</span>{" "}
          <span className="hero-title-line hero-title-bottom">Haurwangi</span>
        </h1>

        <p data-hero-note className="hero-note t-body">
          Sekolah {status} terakreditasi {akreditasi} di {alamat}. {total} siswa dalam {rombel}{" "}
          rombongan belajar.
        </p>
      </div>

      {/* Baris identitas resmi: satu baris fakta yang bisa dipindai mata
          sebelum pengunjung mulai menggulir. Di layar paling sempit dua item
          terakhir disembunyikan (datanya tetap utuh di footer). */}
      <div className="hero-meta" aria-label="Identitas sekolah">
        {meta.map(([label, nilai], index) => (
          <p
            key={label}
            className={`hero-meta-item ${index >= 2 ? "hidden sm:flex" : ""}`}
          >
            <span className="hero-meta-label">{label}</span>{" "}
            <span className="hero-meta-value">{nilai}</span>
          </p>
        ))}
      </div>

      <span className="sr-only">{nama}</span>
    </section>
  );
}
