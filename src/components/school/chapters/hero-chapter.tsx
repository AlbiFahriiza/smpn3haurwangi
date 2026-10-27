"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Identity, StudentsSection } from "@/lib/content";
import { ROUTES } from "@/lib/site";

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
   * tanpa angka rekaan. Tiap fakta jadi satu chip bergaris rambut. */
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
        tl.from("[data-hero-field]", { scaleY: 0, duration: 1.25 }, 0).from(
          "[data-hero-title]",
          { yPercent: 34, duration: 1.3 },
          0.05,
        );

        // Klaster kaki hero (catatan, aksi, chip identitas) berada di bawah
        // lipatan pertama: ia menunggu pengunjung menggulir, tidak bermain
        // saat muat. Antar elemen menumpang, stagger 0,07-0,08 detik.
        gsap.from("[data-hero-cluster] > *", {
          y: 18,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-hero-cluster]", start: "top 92%", once: true },
        });
        // Chip identitas menutup baris dengan gerak berujung gentar kecil
        // (back.out): turun sedikit lebih jauh lalu menetap.
        gsap.from("[data-hero-chip]", {
          y: 14,
          opacity: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: "[data-hero-meta]", start: "top 96%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  /** Gulir ke bab denah lewat Lenis supaya jalurnya sama dengan gerak halus
   * situs; bila Lenis tidak aktif (ponsel), tautan jangkar bawaan menangani. */
  const lompatKeDenah = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const lenis = window.__lenis;
    if (!lenis) return;
    event.preventDefault();
    lenis.scrollTo("#fasilitas-sekolah", { duration: 1.1, offset: -84 });
  };

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
      </div>

      {/* Klaster kaki hero: catatan singkat lalu dua aksi utama situs. Tombol
          utama memakai kain terang dengan tinta abyss (bukan tinta putih) supaya
          penanda fokus papan tombol, yang mengikuti warna tinta, tetap terlihat
          jelas di atas kain terang. Tombol kedua bergaris rambut putih. Saat
          disentuh keduanya mengangkat satu piksel, saat ditekan turun satu
          piksel (antisipasi tekan) sebelum aksinya berjalan. */}
      <div
        data-hero-cluster
        className="absolute inset-x-0 bottom-[5.5rem] z-[1] mx-auto flex w-[min(44rem,88vw)] flex-col items-center text-center"
      >
        <p className="t-body text-white/80">
          Sekolah {status} terakreditasi {akreditasi} di {alamat}. {total} siswa dalam {rombel}{" "}
          rombongan belajar.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ROUTES.kontak.path}
            className="t-small inline-flex items-center rounded-lg bg-foam px-6 py-3 font-semibold text-abyss transition hover:-translate-y-px hover:bg-sky active:translate-y-px"
          >
            Hubungi Sekolah
          </Link>
          <a
            href="#fasilitas-sekolah"
            onClick={lompatKeDenah}
            className="t-small inline-flex items-center rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:-translate-y-px hover:border-white/80 hover:bg-white/10 active:translate-y-px"
          >
            Lihat Denah Sekolah
          </a>
        </div>
      </div>

      {/* Baris identitas resmi: chip bergaris rambut yang bisa dipindai mata
          sebelum pengunjung melanjutkan ke bab berikutnya. Di layar paling
          sempit dua item terakhir disembunyikan (datanya tetap utuh di
          footer); kelas displaynya dipilih utuh per kasus supaya hidden dan
          inline-flex tidak pernah berebut di kelas dasar. */}
      <div
        data-hero-meta
        className="hero-meta justify-center gap-2.5 px-5 pb-6 sm:px-8"
        aria-label="Identitas sekolah"
      >
        {meta.map(([label, nilai], index) => (
          <p
            key={label}
            data-hero-chip
            className={`items-baseline gap-2 rounded-md border border-white/25 bg-white/5 px-3.5 py-2 ${
              index >= 2 ? "hidden sm:inline-flex" : "inline-flex"
            }`}
          >
            <span className="text-white/70">{label}</span>{" "}
            <span className="font-semibold tabular-nums text-white">{nilai}</span>
          </p>
        ))}
      </div>

      <span className="sr-only">{nama}</span>
    </section>
  );
}
