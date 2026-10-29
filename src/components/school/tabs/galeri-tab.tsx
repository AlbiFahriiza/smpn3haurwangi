"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import type { GalleryItem, SiteContent } from "@/lib/content";
import { Chapter, Inner } from "../chapters/chapter";
import { Reveal } from "@/components/motion/reveal";
import { GERAK, flipBetween } from "@/components/motion/morph";
import { JejakPointer, Pegas, proyeksiMomentum, tahanKaret } from "../galeri-pegas";
import { useTekan } from "../kontak-tekan";
import { OpenerChapter } from "../chapters/opener-chapter";
import { KontakChapter } from "../chapters/kontak-chapter";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

gsap.registerPlugin(Flip, useGSAP);

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

export function GaleriTab({ content }: { content: Partial<SiteContent> }) {
  const gallery = content.gallery;
  const semua = gallery?.items ?? [];
  const kategori = gallery?.kategori ?? ["Semua"];

  const [pilih, setPilih] = useState("Semua");
  const [buka, setBuka] = useState<number | null>(null);

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
  // Elemen thumbnail pemanggil lightbox. Disimpan sebagai elemen (bukan rect)
  // supaya posisi diukur hidup: saat morph masuk thumbnail mungkin masih
  // menyelesaikan umpan balik tekan, dan saat menutup rect-nya selalu segar
  // berapa pun jendela berganti ukuran.
  const asalElRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const flipTlRef = useRef<gsap.core.Timeline | null>(null);
  // Pegas navigasi gesek lightbox; dipakai bersama oleh tab dan isi dialog.
  const pegasRef = useRef<Pegas>(new Pegas());

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

  // Peta src ke urutan tampil: petak tidak pernah lepas dari dokumen saat
  // filter berganti, jadi pola bentuk dan warna mengikuti urutan yang tampak.
  const indeksTampak = useMemo(() => {
    const peta = new Map<string, number>();
    tersaring.forEach((item, urutan) => peta.set(item.src, urutan));
    return peta;
  }, [tersaring]);

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

  /** Selesaikan flip yang sedang jalan: lompat ke akhir dan bersihkan gayanya. */
  const pulihkanFlip = useCallback(() => {
    const tl = flipTlRef.current;
    flipTlRef.current = null;
    tl?.revert();
  }, []);

  /**
   * Ganti kategori dengan transisi tata letak (Flip): petak yang tinggal
   * meluncur ke slot barunya, yang keluar memudar cepat, yang masuk memudar
   * tumbuh. State ditangkap sebelum render; Flip.from dimainkan setelah DOM
   * berganti. Ganti kategori lagi di tengah jalan aman: flip lama selesai
   * seketika dulu (revert) supaya tangkapan baru mulai dari posisi diam.
   */
  const gantiFilter = (nama: string) => {
    if (nama === pilih) return;
    pulihkanFlip();
    setBuka(null);
    const grid = gridRef.current;
    if (!grid || tanpaGerakRef.current) {
      setPilih(nama);
      return;
    }
    // Diamkan dulu animasi apung di petak (Reveal masuk, umpan balik tekan)
    // supaya tangkapan state tidak mewarisi posisi setengah jalan.
    grid.querySelectorAll("[data-galeri-item]").forEach((el) => {
      gsap.getTweensOf(el).forEach((tw) => {
        tw.progress(1);
        tw.kill();
      });
    });
    flipStateRef.current = Flip.getState(grid.querySelectorAll("[data-galeri-item]"));
    setPilih(nama);
  };

  useGSAP(
    () => {
      const state = flipStateRef.current;
      flipStateRef.current = null;
      if (!state) return;
      const grid = gridRef.current;
      if (!grid || tanpaGerakRef.current) return; // hasil akhir sudah ada di DOM
      // absoluteOnLeave: hanya petak yang keluar yang diangkat absolute
      // sebagai hantu sementara; yang tinggal dan yang masuk tetap di aliran
      // di posisi akhirnya sehingga tinggi kisi tidak pernah kolaps.
      flipTlRef.current = Flip.from(state, {
        duration: GERAK.sedang,
        ease: GERAK.ease,
        scale: true,
        absoluteOnLeave: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { autoAlpha: 0, scale: 0.92 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.32,
              ease: "power2.out",
              stagger: { amount: 0.22 },
              overwrite: "auto",
            },
          ),
        onLeave: (els) =>
          gsap.to(els, {
            autoAlpha: 0,
            scale: 0.94,
            duration: 0.2,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });
    },
    { scope: gridRef, dependencies: [tersaring] },
  );

  const geser = (arah: 1 | -1) => {
    const jumlah = tersaring.length;
    if (jumlah === 0 || menutupRef.current) return;
    arahRef.current = arah;
    setBuka((kini) => (kini === null ? kini : (kini + arah + jumlah) % jumlah));
  };

  const bukaFoto = (index: number, elemenAsal: HTMLElement) => {
    asalElRef.current = elemenAsal;
    setBuka(index);
  };

  const selesaiTutup = () => {
    menutupTweenRef.current?.kill();
    menutupTweenRef.current = null;
    menutupRef.current = false;
    asalElRef.current = null;
    setBuka(null);
  };

  /**
   * Semua permintaan tutup (Escape, tombol X, klik di luar) melewati sini.
   * Dialog baru benar-benar ditutup setelah fotonya menyusut kembali ke
   * thumbnail asalnya; selama itu dialog tetap terbuka supaya fokus terkunci.
   */
  const mintaTutup = () => {
    if (buka === null || menutupRef.current) return;
    menutupRef.current = true;
    pegasRef.current.berhenti();
    const kotak = kotakRef.current;
    const asalEl = asalElRef.current;
    const rectAsal = asalEl && asalEl.isConnected ? asalEl.getBoundingClientRect() : null;
    if (!kotak || !rectAsal || rectAsal.width < 1 || tanpaGerakRef.current) {
      selesaiTutup();
      return;
    }
    // Kotak mungkin masih di tengah animasi (morph masuk, pegas, atau sedang
    // ditarik): ukur lewat nilai transform GSAP supaya target penutupan
    // dihitung dari posisi tata letak aslinya, bukan posisi visual.
    const r = kotak.getBoundingClientRect();
    const curX = gsap.getProperty(kotak, "x") as number;
    const curY = gsap.getProperty(kotak, "y") as number;
    const curSX = gsap.getProperty(kotak, "scaleX") as number;
    const curSY = gsap.getProperty(kotak, "scaleY") as number;
    const lebarAsli = r.width / (curSX || 1);
    const tinggiAsli = r.height / (curSY || 1);
    const tengahAsliX = r.left + r.width / 2 - curX;
    const tengahAsliY = r.top + r.height / 2 - curY;
    // Skala seragam mencerminkan morph masuk (flipBetween "seragam"): foto
    // menyusut mengecil ke thumbnail tanpa distorsi rasio.
    const skalaTutup = (rectAsal.width / lebarAsli + rectAsal.height / tinggiAsli) / 2;
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
      scaleX: skalaTutup,
      scaleY: skalaTutup,
      duration: GERAK.sedang,
      ease: GERAK.ease,
      overwrite: "auto",
      onComplete: selesaiTutup,
    });
  };

  useEffect(
    () => () => {
      menutupTweenRef.current?.kill();
      pegasRef.current.berhenti();
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
                  onClick={() => gantiFilter(nama)}
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

          <Reveal className="mt-10" y={24} stagger={0.06}>
            <div ref={gridRef} className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-2.5">
              {semua.map((item) => (
                <KotakFoto
                  key={item.src}
                  item={item}
                  indeks={indeksTampak.get(item.src) ?? -1}
                  tampak={indeksTampak.has(item.src)}
                  onBuka={bukaFoto}
                />
              ))}
            </div>
          </Reveal>
          {tersaring.length === 0 ? (
            <p className="t-body field-soft mt-10">
              Belum ada foto pada kategori ini. Guru dapat menambahkannya lewat panel admin.
            </p>
          ) : null}
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
              asalElRef={asalElRef}
              arahRef={arahRef}
              tanpaGerakRef={tanpaGerakRef}
              menutupRef={menutupRef}
              pegasRef={pegasRef}
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
 * Satu petak galeri. Petak tidak pernah lepas dari dokumen saat kategori
 * berganti; ia hanya disembunyikan (display:none) supaya Flip dapat mengenali
 * elemen yang "masuk" dan "keluar" kategori lalu menganimasikannya. Hover:
 * foto membesar 1.03 dan pita keterangan naik dari bawah. Tekan: useTekan
 * "padat" menurunkan dan mengecilkan petak seketika saat pointer menyentuh,
 * kembali dengan pegas kecil saat dilepas.
 */
function KotakFoto({
  item,
  indeks,
  tampak,
  onBuka,
}: {
  item: GalleryItem;
  indeks: number;
  tampak: boolean;
  onBuka: (indeks: number, elemenAsal: HTMLElement) => void;
}) {
  const tekan = useTekan("padat");
  return (
    <button
      type="button"
      data-galeri-item
      data-reveal-item
      data-flip-id={item.src}
      onClick={(event) => tampak && onBuka(indeks, event.currentTarget)}
      aria-label={`Perbesar foto: ${item.judul}`}
      className={`group relative block overflow-hidden rounded-xl text-left active:translate-y-px ${
        tampak ? POLA[indeks % POLA.length] : "hidden"
      }`}
      {...tekan}
    >
      <Image
        src={item.src}
        alt={item.judul}
        fill
        sizes="(min-width: 768px) 46vw, 92vw"
        priority={tampak && indeks < 2}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      {/* Keterangan naik dari bawah hanya untuk penunjuk yang bisa
          mengarah (hover); di layar sentuh dan tanpa JavaScript ia
          memang tampil sejak awal. */}
      <span
        className={`t-body absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 px-4 py-3 font-semibold transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${
          tampak ? PITA[indeks % PITA.length] : ""
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
  );
}

/**
 * Isi lightbox: panel foto + panel keterangan. Morph masuk dijalankan di sini
 * (bukan di induknya) supaya terpicu pada bingkai pemasangan portal dialog,
 * sebelum cat pertama: foto terlihat langsung berangkat dari posisi thumbnail
 * (flipBetween, elemen bersama) tanpa kedipan di posisi akhir.
 *
 * Navigasi antar foto: tombol, papan ketik, atau gesekan horizontal. Gesekan
 * mengikuti jari 1:1 (JejakPointer), berhenti lentur di ujung daftar
 * (tahanKaret), dan pelepasan mewariskan kecepatan jari ke pegas penyelesai
 * (Pegas + proyeksiMomentum) sehingga tidak ada "dinding" antara jari dan
 * animasi. Semua tahap bisa dicegat: menyentuh foto di tengah pegas
 * menghentikannya dan tarikan baru mulai dari posisi tampilan saat itu.
 */
function FotoLightbox({
  item,
  nomor,
  jumlah,
  asalElRef,
  arahRef,
  tanpaGerakRef,
  menutupRef,
  pegasRef,
  kotakRef,
  ketRef,
  onGeser,
}: {
  item: GalleryItem;
  nomor: number;
  jumlah: number;
  asalElRef: React.RefObject<HTMLElement | null>;
  arahRef: React.RefObject<1 | -1>;
  tanpaGerakRef: React.RefObject<boolean>;
  menutupRef: React.RefObject<boolean>;
  pegasRef: React.RefObject<Pegas>;
  kotakRef: React.RefObject<HTMLDivElement | null>;
  ketRef: React.RefObject<HTMLElement | null>;
  onGeser: (arah: 1 | -1) => void;
}) {
  const scope = useRef<HTMLElement>(null);
  const pertamaRef = useRef(true);
  // Benar setelah foto berhenti di tempatnya; tarikan baru boleh mulai.
  const siapRef = useRef(false);
  // Serah-terima kecepatan jari dari gesekan ke animasi foto berikutnya.
  const serahRef = useRef<{ arah: 1 | -1; vx: number } | null>(null);
  const tarikRef = useRef<{
    id: number;
    sx: number;
    sy: number;
    base: number;
    sumbu: 0 | 1 | -1;
  } | null>(null);
  const jejakRef = useRef(new JejakPointer());

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
        siapRef.current = true;
        if (tanpaGerakRef.current || !asalElRef.current) {
          gsap.set(kotak, { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 });
          gsap.set(ket, { y: 0, autoAlpha: 1 });
          if (tombolX) gsap.set(tombolX, { autoAlpha: 1 });
          return;
        }
        // Foto BERMORPH dari thumbnail (elemen bersama, skala seragam supaya
        // isi tidak terdistorsi). flipBetween membaca rect hidup kedua elemen,
        // bisa dicegat (overwrite auto), dan lompat jika gerak dikurangkan.
        const morph = flipBetween(asalElRef.current, kotak, {
          durasi: GERAK.panjang,
          ease: GERAK.ease,
          skala: "seragam",
          selesai: () => {
            siapRef.current = true;
          },
        });
        if (!morph) siapRef.current = true;
        // Keterangan dan tombol tutup menyusul menumpang saat foto 60% jalan
        // (overlapping action), bukan menunggu foto selesai penuh.
        gsap.fromTo(
          ket,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out", delay: GERAK.panjang * 0.6 },
        );
        if (tombolX) {
          gsap.fromTo(
            tombolX,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.24, delay: GERAK.panjang * 0.6 + 0.05 },
          );
        }
        return;
      }

      // ---- Pergantian foto di dalam lightbox (tombol/papan ketik/gesek) ----
      // Interupsi yang mungkin masih jalan dibersihkan dulu: morph masuk yang
      // belum selesai dilompati ke identitas supaya foto baru mulai dari nol.
      gsap.killTweensOf(kotak);
      gsap.set(kotak, { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 });
      gsap.killTweensOf(ket);
      gsap.set(ket, { y: 0, autoAlpha: 1 });
      if (tombolX) {
        gsap.killTweensOf(tombolX);
        gsap.set(tombolX, { autoAlpha: 1 });
      }
      siapRef.current = true;
      if (tanpaGerakRef.current) return; // langsung tampil
      pegasRef.current.berhenti();
      const serah = serahRef.current;
      serahRef.current = null;
      const arah = serah?.arah ?? arahRef.current;
      const lebar = kotak.offsetWidth || 480;
      // Gesekan: foto berikutnya datang dari jauh membawa kecepatan jari;
      // tombol/papan ketik: saling geser singkat mengikuti arah.
      const jarak = serah ? Math.min(lebar * 0.7, 560) : 48;
      gsap.fromTo(
        kotak,
        { autoAlpha: serah ? 0.25 : 0 },
        { autoAlpha: 1, duration: 0.2, ease: "power1.out" },
      );
      pegasRef.current.mulai(
        {
          x: {
            posisi: arah * jarak,
            kecepatan: serah ? gsap.utils.clamp(-2800, 2800, serah.vx) : 0,
            sasaran: 0,
            eps: 0.35,
            tulis: (n) => gsap.set(kotak, { x: n }),
          },
        },
        serah ? { respons: 0.34, redaman: 0.88 } : { respons: 0.3, redaman: 1 },
      );
      gsap.fromTo(
        ket,
        { autoAlpha: 0.35 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
      );
      return () => {
        pegasRef.current.berhenti();
      };
    },
    { scope, dependencies: [item.src] },
  );

  const mulaiTarik = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (!siapRef.current || menutupRef.current) return;
    const kotak = kotakRef.current;
    if (!kotak) return;
    kotak.setPointerCapture(event.pointerId);
    // Pegas yang sedang jalan dihentikan dan tarikan mulai dari posisi
    // tampilan sekarang: animasi boleh dicegat kapan saja.
    pegasRef.current.berhenti();
    tarikRef.current = {
      id: event.pointerId,
      sx: event.clientX,
      sy: event.clientY,
      base: (gsap.getProperty(kotak, "x") as number) || 0,
      sumbu: 0,
    };
    jejakRef.current.reset();
    jejakRef.current.catat(event.clientX, event.clientY);
  };

  const gerakTarik = (event: React.PointerEvent<HTMLDivElement>) => {
    const t = tarikRef.current;
    const kotak = kotakRef.current;
    if (!t || !kotak || event.pointerId !== t.id) return;
    if (menutupRef.current) return; // penutupan sedang jalan: jangan melawan tween-nya
    jejakRef.current.catat(event.clientX, event.clientY);
    const dx = event.clientX - t.sx;
    const dy = event.clientY - t.sy;
    // Hysteresis arah: baru pastu horizontal setelah melewati ambang,
    // supaya ketukan kecil tidak membuat foto bergoyang.
    if (t.sumbu === 0) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) t.sumbu = 1;
      else if (Math.abs(dy) > 8) t.sumbu = -1;
      if (t.sumbu === 0) return;
    }
    if (t.sumbu !== 1) return;
    const indeks = nomor - 1;
    const lebar = kotak.offsetWidth || 1;
    let x = t.base + dx;
    // Ujung daftar: resistensi karet, makin jauh makin berat ditarik.
    if ((x > 0 && indeks === 0) || (x < 0 && indeks === jumlah - 1)) {
      x = tahanKaret(x, lebar);
    }
    gsap.set(kotak, { x });
  };

  const lepasTarik = (event: React.PointerEvent<HTMLDivElement>) => {
    const t = tarikRef.current;
    const kotak = kotakRef.current;
    if (!t || !kotak || event.pointerId !== t.id) return;
    tarikRef.current = null;
    if (menutupRef.current) return; // penutupan menang: lepasan ini batal
    const kini = (gsap.getProperty(kotak, "x") as number) || 0;
    if (t.sumbu !== 1) {
      // Bukan gesekan horizontal; kalau pegas sempat dicegat, lanjutkan pulang.
      if (kini !== 0 && !tanpaGerakRef.current) {
        pegasRef.current.mulai(
          {
            x: { posisi: kini, sasaran: 0, eps: 0.35, tulis: (n) => gsap.set(kotak, { x: n }) },
          },
          { respons: 0.3, redaman: 1 },
        );
      }
      return;
    }
    const { vx } = jejakRef.current.kecepatan();
    const indeks = nomor - 1;
    const lebar = kotak.offsetWidth || 1;
    // Ke mana gerak masih meluncur kalau jari tidak lagi menahan.
    const mendarat = kini + proyeksiMomentum(vx);
    let arah: 1 | -1 | 0 = 0;
    if (Math.abs(vx) > 240) arah = vx < 0 ? 1 : -1;
    else if (Math.abs(kini) > lebar * 0.3) arah = kini < 0 ? 1 : -1;
    else if (Math.abs(mendarat) > lebar * 0.28) arah = mendarat < 0 ? 1 : -1;
    if (arah !== 0) {
      const adaTetangga = arah === 1 ? indeks < jumlah - 1 : indeks > 0;
      if (adaTetangga) {
        // Komit: foto berganti dan kecepatan jari diwariskan ke animasinya.
        serahRef.current = { arah, vx };
        onGeser(arah);
        return;
      }
    }
    // Batalkan: pegas pulang ke tengah mewarisi kecepatan jari.
    if (tanpaGerakRef.current) {
      gsap.set(kotak, { x: 0 });
      return;
    }
    pegasRef.current.mulai(
      {
        x: { posisi: kini, kecepatan: vx, sasaran: 0, eps: 0.35, tulis: (n) => gsap.set(kotak, { x: n }) },
      },
      { respons: 0.32, redaman: 0.85 },
    );
  };

  return (
    <figure ref={scope}>
      <div
        ref={kotakRef}
        data-foto-box
        onPointerDown={mulaiTarik}
        onPointerMove={gerakTarik}
        onPointerUp={lepasTarik}
        onPointerCancel={lepasTarik}
        onLostPointerCapture={lepasTarik}
        className="relative aspect-[4/3] w-full cursor-grab touch-pan-y overflow-hidden rounded-xl bg-deep will-change-transform"
      >
        <Image
          src={item.src}
          alt={item.judul}
          fill
          sizes="90vw"
          draggable={false}
          className="object-contain"
        />
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
