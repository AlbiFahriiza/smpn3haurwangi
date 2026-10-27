"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GalleryItem, SiteContent } from "@/lib/content";
import { Chapter, Inner } from "../chapters/chapter";
import { Reveal } from "@/components/motion/reveal";
import { OpenerChapter } from "../chapters/opener-chapter";
import { KontakChapter } from "../chapters/kontak-chapter";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

gsap.registerPlugin(useGSAP);

/**
 * Bentuk petak diulang dalam satu pola enam langkah supaya deretannya tidak
 * pernah terbaca sebagai kisi kartu yang seragam.
 */
const POLA = [
  "md:col-span-6 aspect-[4/3]",
  "md:col-span-6 aspect-[4/3]",
  "md:col-span-4 aspect-square",
  "md:col-span-4 aspect-square",
  "md:col-span-4 aspect-square",
  "md:col-span-12 aspect-[16/9]",
];

/** Empat pasang warna pita label, semuanya dari palet brand. */
const PITA = [
  "bg-foam text-ink",
  "bg-sky text-ink",
  "bg-marine text-white",
  "bg-line text-ink",
];

/** Durasi gerak lightbox (detik), dipakai bersama oleh buka dan tutup. */
const MASUK = 0.55;
const MENUTUP = 0.42;

export function GaleriTab({ content }: { content: Partial<SiteContent> }) {
  const gallery = content.gallery;
  const semua = gallery?.items ?? [];
  const kategori = gallery?.kategori ?? ["Semua"];

  const [pilih, setPilih] = useState("Semua");
  const [buka, setBuka] = useState<number | null>(null);
  const [asal, setAsal] = useState<DOMRect | null>(null);

  const saringRef = useRef<HTMLDivElement>(null);
  const blokRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pasangRef = useRef(false);
  const arahRef = useRef<1 | -1>(1);
  const menutupRef = useRef(false);
  const menutupTweenRef = useRef<gsap.core.Tween | null>(null);
  const tanpaGerakRef = useRef(false);
  const kotakRef = useRef<HTMLDivElement | null>(null);
  const ketRef = useRef<HTMLElement | null>(null);

  const tersaring = useMemo(
    () => (pilih === "Semua" ? semua : semua.filter((item) => item.kategori === pilih)),
    [semua, pilih],
  );

  const kategoriTerpakai = useMemo(
    () =>
      kategori.filter(
        (nama) => nama === "Semua" || semua.some((item) => item.kategori === nama),
      ),
    [kategori, semua],
  );

  // Pengguna yang meminta gerak minimal: semua animasi di halaman ini memeriksa
  // nilai ref ini lalu menampilkan hasil akhir seketika.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pasang = () => {
      tanpaGerakRef.current = mq.matches;
    };
    pasang();
    mq.addEventListener("change", pasang);
    return () => mq.removeEventListener("change", pasang);
  }, []);

  /**
   * Blok sorot chip kategori: satu balok abyss yang "berpindah" dari chip aktif
   * lama ke chip baru (pola blok hover navigasi). Ukurannya diambil dari chip
   * sasaran, geraknya hanya x/lebar sehingga kolom tidak pernah tersusun ulang.
   */
  const letakkanBlok = useCallback(
    (nama: string, langsung: boolean) => {
      const blok = blokRef.current;
      if (!blok) return;
      const index = kategoriTerpakai.indexOf(nama);
      const target = index >= 0 ? chipRefs.current[index] : null;
      if (!target) {
        gsap.to(blok, { autoAlpha: 0, duration: langsung ? 0 : 0.25, overwrite: "auto" });
        return;
      }
      const nilai = {
        x: target.offsetLeft,
        y: target.offsetTop,
        width: target.offsetWidth,
        height: target.offsetHeight,
        autoAlpha: 1,
      };
      if (langsung) gsap.set(blok, nilai);
      else gsap.to(blok, { ...nilai, duration: 0.42, ease: "expo.out", overwrite: "auto" });
    },
    [kategoriTerpakai],
  );

  // Chip aktif membawa latar abyss sebagai cadangan HTML server (tanpanya teks
  // putihnya tak terbaca sebelum hidrasi). Begitu blok terpasang, latar itu
  // dilepas pada bingkai yang sama, sebelum cat pertama, sehingga yang tersisa
  // hanya blok yang bergerak antarchip.
  useLayoutEffect(() => {
    letakkanBlok(pilih, !pasangRef.current || tanpaGerakRef.current);
    pasangRef.current = true;
    const index = kategoriTerpakai.indexOf(pilih);
    chipRefs.current[index]?.classList.remove("bg-abyss");
  }, [pilih, letakkanBlok, kategoriTerpakai]);

  // Ukuran chip bergeser saat font selesai dimuat atau jendela berubah lebar,
  // jadi blok diukur ulang pada dua kejadian itu.
  useEffect(() => {
    const ukurUlang = () => letakkanBlok(pilih, true);
    window.addEventListener("resize", ukurUlang);
    let batal = false;
    void document.fonts?.ready.then(() => {
      if (!batal) ukurUlang();
    });
    return () => {
      batal = true;
      window.removeEventListener("resize", ukurUlang);
    };
  }, [pilih, letakkanBlok]);

  const geser = (arah: 1 | -1) => {
    const jumlah = tersaring.length;
    if (jumlah === 0 || menutupRef.current) return;
    arahRef.current = arah;
    setBuka((kini) => (kini === null ? kini : (kini + arah + jumlah) % jumlah));
  };

  const bukaFoto = (index: number, kotakAsal: HTMLElement) => {
    // Rect thumbnail dicatat sebelum dialog mount; guliran terkunci selama
    // lightbox terbuka sehingga rect ini tetap sahih saat ditutup.
    setAsal(kotakAsal.getBoundingClientRect());
    setBuka(index);
  };

  const selesaiTutup = () => {
    menutupTweenRef.current?.kill();
    menutupTweenRef.current = null;
    menutupRef.current = false;
    setAsal(null);
    setBuka(null);
  };

  /**
   * Semua permintaan tutup (Escape, tombol X, klik di luar) melewati sini.
   * Dialog baru benar-benar ditutup setelah fotonya menyusut kembali ke rect
   * thumbnail asalnya; selama itu dialog tetap terbuka supaya fokus terkunci.
   */
  const mintaTutup = () => {
    if (buka === null || menutupRef.current) return;
    menutupRef.current = true;
    const kotak = kotakRef.current;
    const rectAsal = asal;
    if (!kotak || !rectAsal || tanpaGerakRef.current) {
      selesaiTutup();
      return;
    }
    // Kotak mungkin masih di tengah animasi (FLIP masuk belum selesai lalu
    // pengguna menekan Escape): ukur lewat nilai transform GSAP supaya target
    // penutupan dihitung dari posisi tata letak aslinya, bukan posisi visual.
    const r = kotak.getBoundingClientRect();
    const curX = gsap.getProperty(kotak, "x") as number;
    const curY = gsap.getProperty(kotak, "y") as number;
    const curSX = gsap.getProperty(kotak, "scaleX") as number;
    const curSY = gsap.getProperty(kotak, "scaleY") as number;
    const lebarAsli = r.width / (curSX || 1);
    const tinggiAsli = r.height / (curSY || 1);
    const tengahAsliX = r.left + r.width / 2 - curX;
    const tengahAsliY = r.top + r.height / 2 - curY;
    if (ketRef.current) {
      gsap.to(ketRef.current, {
        autoAlpha: 0,
        y: 14,
        duration: 0.22,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
    menutupTweenRef.current = gsap.to(kotak, {
      x: rectAsal.left + rectAsal.width / 2 - tengahAsliX,
      y: rectAsal.top + rectAsal.height / 2 - tengahAsliY,
      scaleX: rectAsal.width / lebarAsli,
      scaleY: rectAsal.height / tinggiAsli,
      duration: MENUTUP,
      ease: "power3.inOut",
      overwrite: "auto",
      onComplete: selesaiTutup,
    });
  };

  useEffect(
    () => () => {
      menutupTweenRef.current?.kill();
    },
    [],
  );

  // Papan tombol menggeser foto selama penampil terbuka.
  useEffect(() => {
    if (buka === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (menutupRef.current) return;
      if (event.key === "ArrowRight") geser(1);
      if (event.key === "ArrowLeft") geser(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buka, tersaring]);

  const aktif = buka !== null ? tersaring[buka] : null;

  return (
    <>
      <OpenerChapter
        field={BIDANG_PEMBUKA["/galeri"].field}
        nav={BIDANG_PEMBUKA["/galeri"].ink}
        judul="Galeri"
        pengantar={
          gallery?.description ??
          "Dokumentasi kegiatan SMP Negeri 3 Haurwangi, dari kegiatan belajar hingga pentas seni."
        }
        keterangan={
          <p className="t-small field-soft tabular-nums">
            {semua.length} foto · {kategoriTerpakai.length - 1} kategori
          </p>
        }
        gambar={{
          src: "/images/galeri/pentas-seni-1.jpg",
          alt: "Pentas seni dan pelepasan siswa kelas 9 SMP Negeri 3 Haurwangi",
        }}
      />

      <Chapter field="foam" nav="light" pad="tall" id="semua-foto">
        <Inner>
          <Reveal stagger={0.08}>
            <h2 data-reveal-item className="t-head">
              Dokumentasi kegiatan
            </h2>
            <p data-reveal-item className="t-body field-soft mt-7 max-w-[58ch]">
              Seluruh foto di halaman ini berasal dari dokumentasi resmi kegiatan sekolah. Nama
              kategori mengikuti penamaan pada berkas galeri sekolah, dari kegiatan belajar sampai
              pentas seni dan pelepasan kelas 9.
            </p>
          </Reveal>

          <div
            ref={saringRef}
            role="group"
            aria-label="Saring galeri menurut kategori"
            className="relative mt-12 flex flex-wrap gap-2"
          >
            <span
              ref={blokRef}
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 z-0 rounded-md bg-abyss opacity-0"
            />
            {kategoriTerpakai.map((nama, index) => {
              const jumlah =
                nama === "Semua"
                  ? semua.length
                  : semua.filter((item) => item.kategori === nama).length;
              const sedang = pilih === nama;
              return (
                <button
                  key={nama}
                  type="button"
                  ref={(el) => {
                    chipRefs.current[index] = el;
                  }}
                  onClick={() => {
                    setPilih(nama);
                    setBuka(null);
                  }}
                  aria-pressed={sedang}
                  className={`t-small relative z-10 rounded-md px-5 py-3 font-semibold transition-[color,background-color,transform] duration-200 active:translate-y-px ${
                    sedang ? "bg-abyss text-white" : "field-soft hover:bg-abyss/6"
                  }`}
                >
                  {nama}
                  <span className="tabular-nums"> {jumlah}</span>
                </button>
              );
            })}
          </div>

          {tersaring.length > 0 ? (
            <Reveal
              key={pilih}
              className="mt-10"
              y={24}
              stagger={0.06}
            >
              <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-2.5">
                {tersaring.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    data-reveal-item
                    onClick={(event) => bukaFoto(index, event.currentTarget)}
                    aria-label={`Perbesar foto: ${item.judul}`}
                    className={`group relative block overflow-hidden rounded-xl text-left active:translate-y-px ${
                      POLA[index % POLA.length]
                    }`}
                  >
                    <Image
                      src={item.src}
                      alt={item.judul}
                      fill
                      sizes="(min-width: 768px) 46vw, 92vw"
                      priority={index < 2}
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                    {/* Keterangan naik dari bawah hanya untuk penunjuk yang bisa
                        mengarah (hover); di layar sentuh dan tanpa JavaScript ia
                        memang tampil sejak awal. */}
                    <span
                      className={`t-body absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 px-4 py-3 font-semibold transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${
                        PITA[index % PITA.length]
                      }`}
                    >
                      <span className="truncate">{item.judul}</span>
                      {item.tanggal && item.tanggal !== "-" ? (
                        <span className="t-small tabular-nums">{item.tanggal}</span>
                      ) : (
                        <span className="t-small tabular-nums">{item.kategori}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          ) : (
            <p className="t-body field-soft mt-10">
              Belum ada foto pada kategori ini. Guru dapat menambahkannya lewat panel admin.
            </p>
          )}
        </Inner>
      </Chapter>

      <KontakChapter contact={content.contact} identity={content.identity} />

      <Dialog open={buka !== null} onOpenChange={(open) => !open && mintaTutup()}>
        {/* Kotak dialog sengaja tembus pandang dan tanpa animasi bawaan
            (duration-0): foto di dalamnyalah yang bergerak FLIP dari thumbnail,
            bukan seluruh panel memudar dari kosong. Latar gelapnya tinggal di
            panel foto + keterangan, masing-masing rounded-xl. */}
        <DialogContent
          aria-describedby={undefined}
          className="gap-0 rounded-xl border-0 bg-transparent p-0 text-white shadow-none duration-0 sm:max-w-5xl [&>button]:rounded-lg [&>button]:bg-abyss/70 [&>button]:p-2.5 [&>button]:text-white [&>button]:opacity-90 [&>button]:transition-[background-color,opacity,transform] [&>button]:hover:bg-abyss [&>button]:hover:opacity-100 [&>button]:active:translate-y-px"
        >
          {aktif ? (
            <FotoLightbox
              item={aktif}
              nomor={(buka ?? 0) + 1}
              jumlah={tersaring.length}
              asal={asal}
              arahRef={arahRef}
              tanpaGerakRef={tanpaGerakRef}
              kotakRef={kotakRef}
              ketRef={ketRef}
              onGeser={geser}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Isi lightbox: panel foto + panel keterangan. FLIP masuk dijalankan di sini
 * (bukan di induknya) supaya terpicu pada bingkai pemasangan portal dialog,
 * sebelum cat pertama: foto terlihat langsung berangkat dari posisi thumbnail
 * tanpa kedipan di posisi akhir.
 */
function FotoLightbox({
  item,
  nomor,
  jumlah,
  asal,
  arahRef,
  tanpaGerakRef,
  kotakRef,
  ketRef,
  onGeser,
}: {
  item: GalleryItem;
  nomor: number;
  jumlah: number;
  asal: DOMRect | null;
  arahRef: React.RefObject<1 | -1>;
  tanpaGerakRef: React.RefObject<boolean>;
  kotakRef: React.RefObject<HTMLDivElement | null>;
  ketRef: React.RefObject<HTMLElement | null>;
  onGeser: (arah: 1 | -1) => void;
}) {
  const scope = useRef<HTMLElement>(null);
  const pertamaRef = useRef(true);

  useGSAP(
    () => {
      const kotak = kotakRef.current;
      const ket = ketRef.current;
      if (!kotak || !ket) return;
      const tombolX =
        scope.current?.parentElement?.querySelector<HTMLElement>(
          '[data-slot="dialog-close"]',
        ) ?? null;

      if (pertamaRef.current) {
        pertamaRef.current = false;
        if (!asal || tanpaGerakRef.current) {
          gsap.set(kotak, { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 });
          gsap.set(ket, { y: 0, autoAlpha: 1 });
          if (tombolX) gsap.set(tombolX, { autoAlpha: 1 });
          return;
        }
        const kini = kotak.getBoundingClientRect();
        const garis = gsap.timeline();
        // Foto MEMBESAR dari rect thumbnail (FLIP manual). Skala X dan Y
        // dipisah supaya rasio thumbnail yang beda tetap terbang mulus.
        garis
          .fromTo(
            kotak,
            {
              x: asal.left + asal.width / 2 - (kini.left + kini.width / 2),
              y: asal.top + asal.height / 2 - (kini.top + kini.height / 2),
              scaleX: asal.width / kini.width,
              scaleY: asal.height / kini.height,
              transformOrigin: "50% 50%",
            },
            { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: MASUK, ease: "expo.out" },
          )
          // Keterangan menyusul menumpang saat foto 60% jalan (overlapping
          // action), bukan menunggu foto selesai penuh.
          .fromTo(
            ket,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" },
            MASUK * 0.6,
          );
        if (tombolX) {
          garis.fromTo(
            tombolX,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.24 },
            MASUK * 0.6 + 0.05,
          );
        }
        return;
      }

      // Pergantian foto di dalam lightbox: saling geser singkat mengikuti arah,
      // transform/opacity saja sehingga tata letak tidak pernah bergeser.
      if (tanpaGerakRef.current) return;
      gsap.fromTo(
        kotak,
        { x: arahRef.current * 40, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.34, ease: "power3.out", overwrite: "auto" },
      );
      gsap.fromTo(
        ket,
        { autoAlpha: 0.3 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" },
      );
    },
    { scope, dependencies: [item.src] },
  );

  return (
    <figure ref={scope}>
      <div
        ref={kotakRef}
        data-foto-box
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-deep will-change-transform"
      >
        <Image src={item.src} alt={item.judul} fill sizes="90vw" className="object-contain" />
      </div>
      <figcaption
        ref={ketRef}
        data-foto-ket
        className="mt-2.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 rounded-xl bg-abyss px-6 py-5"
      >
        <div className="min-w-0">
          <DialogTitle className="t-statement text-white">{item.judul}</DialogTitle>
          <p className="t-small mt-1 text-foam/80">
            {item.kategori}
            {item.tanggal && item.tanggal !== "-" ? ` · ${item.tanggal}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onGeser(-1)}
            aria-label="Foto sebelumnya"
            className="t-small rounded-lg bg-white/12 px-4 py-3 font-semibold transition-colors hover:bg-white/25 active:translate-y-px"
          >
            Sebelumnya
          </button>
          <span className="t-small tabular-nums opacity-90">
            {nomor}/{jumlah}
          </span>
          <button
            type="button"
            onClick={() => onGeser(1)}
            aria-label="Foto berikutnya"
            className="t-small rounded-lg bg-white/12 px-4 py-3 font-semibold transition-colors hover:bg-white/25 active:translate-y-px"
          >
            Berikutnya
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
