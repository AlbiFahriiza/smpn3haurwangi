"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { XIcon } from "lucide-react";
import type { EkskulSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";
import { flipBetween, GERAK } from "@/components/motion/morph";
import { useTekan } from "../kontak-tekan";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

/** Urutan hari resmi sekolah, dipakai untuk menyusun chip saringan jadwal. */
const NAMA_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * Potret pendamping tiap kegiatan, semuanya foto asli sekolah dari
 * dokumentasi resmi: upacara untuk Paskibra, pentas seni untuk Seni & Tari,
 * lapang badminton dan lapang upacara untuk kedua olahraganya. Teks alt tetap
 * menulis apa yang benar-benar tampil di foto, bukan nama kegiatannya, karena
 * tiap kegiatan memang belum punya dokumentasi khusus.
 */
export const FOTO_EKSKUL: Record<string, { src: string; alt: string }> = {
  Pramuka: {
    src: "/images/galeri/kegiatan-luar-1.jpg",
    alt: "Kegiatan siswa di luar sekolah",
  },
  Paskibra: {
    src: "/images/galeri/upacara-apel-pagi.jpg",
    alt: "Upacara dan apel pagi di sekolah",
  },
  "Bulu Tangkis": {
    src: "/images/fasilitas/fasilitas-7.jpg",
    alt: "Lapang badminton sekolah",
  },
  "Bola Voly": {
    src: "/images/fasilitas/fasilitas-8.jpg",
    alt: "Lapang upacara sekolah",
  },
  "Seni & Tari": {
    src: "/images/galeri/pentas-seni-4.jpg",
    alt: "Suasana pentas seni siswa",
  },
  "PMR (Palang Merah Remaja)": {
    src: "/images/galeri/kegiatan-siswa-2.jpg",
    alt: "Kegiatan siswa bersama guru pembina",
  },
};

/** Kegiatan yang baru ditambah admin dan belum punya potret di daftar ini
 *  memakai satu foto cadangan yang tetap jujur tentang isinya. */
const FOTO_CADANGAN = { src: "/images/galeri/kegiatan-siswa-1.jpg", alt: "Kegiatan siswa" };

export function fotoKegiatan(nama: string) {
  return FOTO_EKSKUL[nama] ?? FOTO_CADANGAN;
}

/**
 * Hari yang disebut sebuah jadwal. "Latihan mingguan" dan "Latihan rutin"
 * tidak menyebut hari apa pun, jadi tergolong rutin tanpa hari tetap.
 */
export function hariJadwal(jadwal: string): string[] {
  const teks = jadwal.toLowerCase();
  return NAMA_HARI.filter((hari) => teks.includes(hari.toLowerCase()));
}

/** Proyeksi momentum pelepasan (pola Apple): jarak yang masih ditempuh
 *  guliran setelah jari diangkat bila deselerasinya 0,998 per bingkai. */
const proyeksiMomentum = (kecepatan: number) => (kecepatan / 1000) * (0.998 / (1 - 0.998));

/** Tahanan karet pada batas deretan: makin jauh melampaui, makin berat
 *  diikuti, jadi berhenti terasa "menahan", bukan membeku mendadak. */
const tahananKaret = (lewah: number, ukuran: number) =>
  (lewah * ukuran * 0.55) / (ukuran + 0.55 * Math.abs(lewah));

/** Tiga elemen kartu yang menjadi titik berangkat elemen bersama di panel. */
type AsalBersama = {
  foto: HTMLElement | null;
  judul: HTMLElement | null;
  jadwal: HTMLElement | null;
};

/**
 * Daftar ekstrakurikuler versi lengkap. Tiap kegiatan jadi kartu landscape
 * dengan potret dan jadwalnya; chip hari menyaring tanpa membuang kartu mana
 * pun dari dokumen. Mengetuk kartu membuka panel baca fokus yang benar-benar
 * elemen bersama dengan kartunya (flipBetween dari morph.tsx, FLIP manual
 * satu bahasa dengan morph logo dan lightbox galeri): potret, judul, dan
 * keterangan jadwal masing-masing terbang dari posisinya di kartu ke posisinya
 * di panel, lalu mengecil kembali ke kartu yang sama saat ditutup. Di ponsel
 * deretan kartu digeser dengan seretan satu banding satu, proyeksi momentum,
 * jepitan kartu terdekat, dan tahanan karet di kedua ujung.
 */
export function EkskulDaftarChapter({ ekskul }: { ekskul?: EkskulSection }) {
  const items = ekskul?.items ?? [];

  const [pilih, setPilih] = useState("Semua");
  const [buka, setBuka] = useState<number | null>(null);
  const [tanpaGerak, setTanpaGerak] = useState(false);
  const [namaLama, setNamaLama] = useState<string | null>(null);

  const scope = useRef<HTMLDivElement>(null);
  const blokRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const deretRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);
  const judulRef = useRef<HTMLHeadingElement>(null);
  const jadwalRef = useRef<HTMLSpanElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const tutupRef = useRef<HTMLButtonElement>(null);
  const asalRef = useRef<AsalBersama | null>(null);
  const asalTombol = useRef<HTMLButtonElement | null>(null);
  const arahRef = useRef<1 | -1>(1);
  const menutupRef = useRef(false);
  const menutupTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const tanpaGerakRef = useRef(false);
  const namaLamaRef = useRef<string | null>(null);
  const pertamaRef = useRef(true);

  // Umpan balik tekan ala iOS untuk chip saringan dan tombol panel. Kartu
  // sendiri sudah ditekan oleh penggeser deretnya (lihat efek deret di bawah)
  // supaya umpan baliknya menyatu dengan gerak seret; tombol pelapis kartu
  // tidak dipasangi lagi agar dua skala tidak bertumpuk pada satu ketukan.
  const tekanChip = useTekan();
  const tekanGeser = useTekan();
  const tekanTutup = useTekan();

  const CHIP = useMemo(() => {
    const hari = NAMA_HARI.filter((h) =>
      items.some((item) => hariJadwal(item.jadwal).includes(h)),
    );
    const rutin = items.some((item) => hariJadwal(item.jadwal).length === 0);
    return ["Semua", ...hari, ...(rutin ? ["Rutin"] : [])];
  }, [items]);

  const jumlahChip = (opsi: string) =>
    opsi === "Semua"
      ? items.length
      : opsi === "Rutin"
        ? items.filter((item) => hariJadwal(item.jadwal).length === 0).length
        : items.filter((item) => hariJadwal(item.jadwal).includes(opsi)).length;

  const cocok = (jadwal: string) =>
    pilih === "Semua" ||
    (pilih === "Rutin"
      ? hariJadwal(jadwal).length === 0
      : hariJadwal(jadwal).includes(pilih));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pasang = () => {
      tanpaGerakRef.current = mq.matches;
      setTanpaGerak(mq.matches);
    };
    pasang();
    mq.addEventListener("change", pasang);
    return () => mq.removeEventListener("change", pasang);
  }, []);

  /**
   * Satu blok sorot yang berpindah antar chip (pola blok hover navigasi).
   * Bloknya di luar aliran sehingga perpindahannya tidak menggeser tata letak;
   * geraknya murni transform: ukuran layout blok disamakan dulu dengan ukuran
   * visualnya, lalu x/y/scaleX/scaleY menghubungkannya ke ukuran chip tujuan.
   * Warna latar chip aktif pada HTML awal tetap dicat sendiri agar tampilan
   * tanpa JS benar; begitu blok siap, cat itu dilepas lewat DOM sebelum paint.
   */
  const letakkanBlok = useCallback(
    (opsi: string, langsung: boolean) => {
      const blok = blokRef.current;
      if (!blok) return;
      const idx = CHIP.indexOf(opsi);
      const sasaran = idx >= 0 ? chipRefs.current[idx] : null;
      if (!sasaran) {
        gsap.to(blok, { autoAlpha: 0, duration: langsung ? 0 : 0.2, overwrite: "auto" });
        return;
      }
      const sx = (gsap.getProperty(blok, "scaleX") as number) || 1;
      const sy = (gsap.getProperty(blok, "scaleY") as number) || 1;
      const lebarKini = blok.offsetWidth * sx;
      const tinggiKini = blok.offsetHeight * sy;
      if (lebarKini <= 0 || tinggiKini <= 0) {
        // Pemakaian pertama: blok belum berukuran, pasang seketika.
        gsap.set(blok, {
          x: sasaran.offsetLeft,
          y: sasaran.offsetTop,
          width: sasaran.offsetWidth,
          height: sasaran.offsetHeight,
          scaleX: 1,
          scaleY: 1,
          transformOrigin: "0 0",
          autoAlpha: 1,
        });
        return;
      }
      // Normalisasi: lebar/tinggi layout disamakan dengan ukuran visual saat
      // ini (termasuk saat masih di tengah penerbangan) supaya animasi
      // berikutnya berangkat dari apa yang sedang terlihat di layar.
      gsap.set(blok, {
        width: lebarKini,
        height: tinggiKini,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: "0 0",
      });
      const nilai = {
        x: sasaran.offsetLeft,
        y: sasaran.offsetTop,
        scaleX: sasaran.offsetWidth / lebarKini,
        scaleY: sasaran.offsetHeight / tinggiKini,
        autoAlpha: 1,
      };
      if (langsung) gsap.set(blok, nilai);
      else gsap.to(blok, { ...nilai, duration: 0.4, ease: "expo.out", overwrite: "auto" });
    },
    [CHIP],
  );

  // Dipasang lewat useGSAP (layout effect) supaya blok sudah duduk di chip
  // aktif sebelum paint pertama; setiap saringan berganti ia ikut pindah.
  useGSAP(
    () => {
      const idx = CHIP.indexOf(pilih);
      const chip = idx >= 0 ? chipRefs.current[idx] : null;
      if (chip) chip.classList.remove("bg-abyss");
      letakkanBlok(pilih, tanpaGerak);
    },
    { scope, dependencies: [pilih, tanpaGerak, letakkanBlok] },
  );

  // Lebar chip bergeser setelah font selesai dimuat atau jendela berubah
  // ukuran; ukur ulang tanpa gerakan supaya blok tetap menempel.
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

  // Chip jadwal masuk satu per satu bertumpang (stagger 0.06), lalu kartu
  // menyusul membuka kisaran atasnya (clip-path) dengan stagger 0.07.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-saring] > button", {
          y: 10,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-saring]", start: "top 90%", once: true },
        });
        gsap.from("[data-kartu]", {
          clipPath: "inset(0% 0% 100% 0%)",
          y: 20,
          duration: 0.9,
          stagger: 0.07,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-deret]", start: "top 86%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  /**
   * Panel baca fokus, bagian elemen bersama: potret, judul, dan chip jadwal
   * terbang dari kartu yang diketuk lewat flipBetween (morph.tsx: FLIP manual
   * dengan durasi, easing, dan cara interupsi yang sama di seluruh situs;
   * bingkai panel sekadar memudar di belakangnya). Begitu panel terbuka,
   * tombol Sebelumnya dan Berikutnya mengganti kegiatan tanpa menutup panel:
   * potret saling padam dengan susut skala kecil dan teks bergeser mengikuti
   * arah pindah. Pengguna gerak minimal langsung mendapat hasil akhir tanpa
   * penerbangan.
   */
  useGSAP(
    () => {
      if (buka === null) return;
      const panel = panelRef.current;
      const scrim = scrimRef.current;
      const foto = fotoRef.current;
      const judul = judulRef.current;
      const jadwal = jadwalRef.current;
      if (!panel || !scrim || !foto || !judul || !jadwal) return;
      const bingkai = panel.querySelector<HTMLElement>("[data-panel-bingkai]");
      const mm = gsap.matchMedia();

      mm.add(REDUCE, () => {
        pertamaRef.current = false;
        if (bingkai) gsap.set(bingkai, { autoAlpha: 1 });
        gsap.set(scrim, { autoAlpha: 1 });
      });

      mm.add(NO_REDUCE, () => {
        if (pertamaRef.current) {
          pertamaRef.current = false;
          const asal = asalRef.current;
          const tl = gsap.timeline();
          tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);
          if (bingkai) {
            tl.fromTo(bingkai, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0);
          }
          // Elemen bersama berangkat dari kartu lewat flipBetween: potret
          // memimpin satu tarikan penuh (skala "seragam" supaya isinya tidak
          // terdistorsi dan geraknya terasa "angkat dan taruh"), lalu judul dan
          // chip jadwal menumpang di belakangnya (mulai saat potret baru 10-20%
          // jalan). Kedua kotak diukur pada bingkai yang sama sebelum paint,
          // jadi kartu dan panel tidak pernah melesat berlainan.
          flipBetween(asal?.foto ?? null, foto, { durasi: GERAK.panjang, skala: "seragam" });
          flipBetween(asal?.judul ?? null, judul, {
            durasi: GERAK.sedang,
            skala: "seragam",
            jeda: 0.05,
          });
          flipBetween(asal?.jadwal ?? null, jadwal, {
            durasi: GERAK.sedang,
            skala: "seragam",
            jeda: 0.09,
          });
          // Isi pelengkap menyusul saat penerbangan foto baru 36% jalan.
          tl.fromTo(
            panel.querySelectorAll("[data-panel-tambahan]"),
            { y: 14, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" },
            0.18,
          );
          if (tutupRef.current) {
            tl.fromTo(tutupRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 }, 0.28);
          }
          return;
        }

        // Pergantian kegiatan di dalam panel: potret baru memudar masuk dengan
        // susut skala kecil sementara potret lama memudar pergi; teks bergeser
        // mengikuti arah. Semuanya transform dan opacity saja.
        gsap.set([panel, foto, judul, jadwal], { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 });
        const pudar = namaLamaRef.current;
        const fotoBaru = foto.querySelector("[data-foto-baru]");
        const fotoLama = foto.querySelector("[data-foto-lama]");
        if (fotoBaru) {
          gsap.fromTo(
            fotoBaru,
            { autoAlpha: 0, scale: 1.04 },
            { autoAlpha: 1, scale: 1, duration: 0.45, ease: "expo.out", overwrite: "auto" },
          );
        }
        if (fotoLama) {
          gsap.to(fotoLama, {
            autoAlpha: 0,
            scale: 0.98,
            duration: 0.3,
            ease: "power2.in",
            overwrite: "auto",
            onComplete: () => setNamaLama((kini) => (kini === pudar ? null : kini)),
          });
        }
        gsap.fromTo(
          panel.querySelectorAll("[data-panel-teks]"),
          { x: arahRef.current * 26, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: "power3.out", overwrite: "auto" },
        );
      });

      return () => mm.revert();
    },
    { scope, dependencies: [buka] },
  );

  const bukaKartu = useCallback((index: number, tombol: HTMLButtonElement) => {
    // Penutupan yang belum selesai dibatalkan dulu supaya dua arah gerak tidak
    // saling menimpa (kartu memang tak bisa diklik selama panel menutup, ini
    // hanya pengaman tambahan).
    if (menutupRef.current) {
      menutupTweenRef.current?.kill();
      menutupRef.current = false;
    }
    const kartu = tombol.closest("li");
    asalRef.current = {
      foto: kartu?.querySelector<HTMLElement>("[data-kartu-foto]") ?? null,
      judul: kartu?.querySelector<HTMLElement>("[data-kartu-judul]") ?? null,
      jadwal: kartu?.querySelector<HTMLElement>("[data-kartu-jadwal]") ?? null,
    };
    asalTombol.current = tombol;
    pertamaRef.current = true;
    setBuka(index);
  }, []);

  /**
   * Tutup dengan arah balik: isi pelengkap mundur dulu, lalu potret, judul,
   * dan chip jadwal mengecil kembali ke posisinya di kartu asal. Target
   * dihitung dari nilai layar saat itu (bukan nilai akhir animasi pembuka)
   * supaya penutupan di tengah penerbangan tetap mulus meneruskan gerak yang
   * sedang berjalan, dan fokus dikembalikan ke kartu yang membukanya.
   */
  const tutup = () => {
    if (buka === null || menutupRef.current) return;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    const selesai = () => {
      menutupRef.current = false;
      namaLamaRef.current = null;
      setBuka(null);
      setNamaLama(null);
      asalTombol.current?.focus({ preventScroll: true });
    };
    if (tanpaGerak || !panel) {
      selesai();
      return;
    }
    menutupRef.current = true;
    const asal = asalRef.current;
    const bingkai = panel.querySelector<HTMLElement>("[data-panel-bingkai]");
    const tl = gsap.timeline({ onComplete: selesai });
    tl.to(
      panel.querySelectorAll("[data-panel-tambahan]"),
      { y: -8, autoAlpha: 0, duration: 0.18, stagger: 0.03, ease: "power2.in" },
      0,
    );
    if (tutupRef.current) {
      tl.to(tutupRef.current, { autoAlpha: 0, duration: 0.15, ease: "power1.in", overwrite: "auto" }, 0);
    }
    // flipBetween menambatkan skala di titik tengah elemen, jadi tepi kiri
    // atas tata letak (tanpa transform) dihitung dengan melepas dulu geseran
    // skala di kedua sisi. Kotak kartu diukur saat penutupan dimulai, bukan
    // memakai kotak basi dari saat klik, supaya tetap tepat walau tata letak
    // sempat berganti di tengah panel terbuka.
    const pulangkan = (el: HTMLElement | null, sumber: HTMLElement | null, mulai: number) => {
      if (!el || !sumber) return;
      const rect = sumber.getBoundingClientRect();
      const kini = el.getBoundingClientRect();
      const x = (gsap.getProperty(el, "x") as number) || 0;
      const y = (gsap.getProperty(el, "y") as number) || 0;
      const sx = (gsap.getProperty(el, "scaleX") as number) || 1;
      const sy = (gsap.getProperty(el, "scaleY") as number) || 1;
      const w = kini.width / sx;
      const h = kini.height / sy;
      const tepiX = kini.left - x - ((1 - sx) * w) / 2;
      const tepiY = kini.top - y - ((1 - sy) * h) / 2;
      const sxT = rect.width / w;
      const syT = rect.height / h;
      tl.to(
        el,
        {
          x: rect.left - tepiX - ((1 - sxT) * w) / 2,
          y: rect.top - tepiY - ((1 - syT) * h) / 2,
          scaleX: sxT,
          scaleY: syT,
          duration: GERAK.sedang,
          ease: "power3.inOut",
          overwrite: "auto",
        },
        mulai,
      );
    };
    pulangkan(fotoRef.current, asal?.foto ?? null, 0.05);
    pulangkan(judulRef.current, asal?.judul ?? null, 0.07);
    pulangkan(jadwalRef.current, asal?.jadwal ?? null, 0.09);
    if (scrim) {
      tl.to(scrim, { autoAlpha: 0, duration: 0.26, ease: "power2.in", overwrite: "auto" }, 0.08);
    }
    if (bingkai) {
      tl.to(bingkai, { autoAlpha: 0, duration: 0.2, ease: "power1.in", overwrite: "auto" }, 0.16);
    }
    menutupTweenRef.current = tl;
  };

  // Menggeser kegiatan di dalam panel terbuka; potret kegiatan yang ditinggal
  // disimpan dulu sebagai lapisan lama untuk saling padam.
  const geser = useCallback(
    (arah: 1 | -1) => {
      if (buka === null || menutupRef.current) return;
      const jumlah = items.length;
      if (jumlah < 2) return;
      arahRef.current = arah;
      if (!tanpaGerak) {
        namaLamaRef.current = items[buka].nama;
        setNamaLama(items[buka].nama);
      }
      setBuka((kini) => (kini === null ? kini : (kini + arah + jumlah) % jumlah));
    },
    [buka, items, tanpaGerak],
  );

  // Papan tombol menggeser kegiatan selama panel terbuka.
  useEffect(() => {
    if (buka === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (menutupRef.current) return;
      if (event.key === "ArrowRight") geser(1);
      else if (event.key === "ArrowLeft") geser(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buka, geser]);

  useEffect(
    () => () => {
      menutupTweenRef.current?.kill();
    },
    [],
  );

  // Panel terbuka: kunci gulir latar (Lenis di desktop ikut dihentikan) dan
  // taruh fokus pada tombol tutup supaya papan tombol mulai dari dalam panel.
  // Hanya dijalankan saat panel muncul, bukan setiap kali kegiatan digeser.
  const panelTampil = buka !== null;
  useEffect(() => {
    if (!panelTampil) return;
    const lenis = window.__lenis ?? null;
    lenis?.stop();
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tutupRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = sebelumnya;
      lenis?.start();
    };
  }, [panelTampil]);

  /**
   * Deretan kartu di ponsel digeser dengan seretan satu banding satu: posisi
   * jari diikuti persis sejak ditekan, kecepatan jejak terakhir diwarisi
   * sebagai proyeksi momentum lalu dijepit ke kartu terdekat, dan kedua ujung
   * deret menahan dengan geseran karet. Sentuhan tetap boleh menggulir halaman
   * secara vertikal (touch-action: pan-y) sehingga deret tidak pernah membawa
   * halaman ikut tergelincir. Menekan kartu juga langsung memberi umpan balik
   * (mengecil 0.97 dan turun 1px) pada saat pointer-down, bukan menunggu
   * klik; begitu gerakan menjadi seretan, tekanan itu dilepaskan dan kliknya
   * ditelan supaya kartu tidak ikut terbuka setelah dipakai menyeret.
   */
  useEffect(() => {
    const ul = deretRef.current;
    if (!ul) return;

    const semuaKartu = () => Array.from(ul.querySelectorAll<HTMLElement>("li"));
    const seret = {
      aktif: false,
      id: -1,
      x0: 0,
      s0: 0,
      sudahGeser: false,
      habiskanKlik: false,
      klik: null as Element | null,
      contoh: [] as Array<{ x: number; t: number }>,
    };
    let lepasTween: gsap.core.Tween | null = null;
    let karetTween: gsap.core.Tween | null = null;
    let karetPasang = false;
    let tekanTween: gsap.core.Tween | null = null;
    let ditekan: HTMLElement | null = null;

    const lepasTekan = () => {
      const el = ditekan;
      ditekan = null;
      if (!el) return;
      tekanTween?.kill();
      tekanTween = gsap.to(el, {
        scale: 1,
        y: 0,
        duration: 0.32,
        ease: "back.out(1.4)",
        overwrite: "auto",
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      seret.sudahGeser = false;
      seret.habiskanKlik = false;
      const kartu = (event.target as Element).closest("li");
      if (kartu instanceof HTMLElement) {
        ditekan = kartu;
        tekanTween?.kill();
        tekanTween = gsap.to(kartu, {
          scale: 0.97,
          y: 1,
          duration: 0.1,
          ease: "power1.out",
          overwrite: "auto",
        });
      }
      // Deret hanya bisa diseret bila memang meluap (di layar lebar ia kisi).
      if (ul.scrollWidth <= ul.clientWidth + 1 || seret.aktif) return;
      seret.aktif = true;
      seret.id = event.pointerId;
      seret.x0 = event.clientX;
      seret.s0 = ul.scrollLeft;
      seret.klik = event.target instanceof Element ? event.target : null;
      seret.contoh = [{ x: event.clientX, t: performance.now() }];
      lepasTween?.kill();
      lepasTween = null;
      karetTween?.kill();
      karetTween = null;
      ul.setPointerCapture(event.pointerId);
      if (event.pointerType === "mouse") event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!seret.aktif || event.pointerId !== seret.id) return;
      const dx = event.clientX - seret.x0;
      if (!seret.sudahGeser && Math.abs(dx) > 8) {
        seret.sudahGeser = true;
        lepasTekan();
      }
      seret.contoh.push({ x: event.clientX, t: performance.now() });
      if (seret.contoh.length > 6) seret.contoh.shift();
      const maks = ul.scrollWidth - ul.clientWidth;
      const mentah = seret.s0 - dx;
      let gulir = mentah;
      let lewah = 0;
      if (mentah < 0) {
        lewah = -mentah;
        gulir = 0;
      } else if (mentah > maks) {
        lewah = mentah - maks;
        gulir = maks;
      }
      ul.scrollLeft = gulir;
      if (lewah > 0) {
        karetPasang = true;
        karetTween?.kill();
        karetTween = null;
        gsap.set(semuaKartu(), { x: (mentah < 0 ? 1 : -1) * tahananKaret(lewah, ul.clientWidth) });
      } else if (karetPasang) {
        karetPasang = false;
        gsap.set(semuaKartu(), { x: 0 });
      }
    };

    const jepitTerdekat = (posisi: number) => {
      const maks = ul.scrollWidth - ul.clientWidth;
      const lis = semuaKartu();
      let terbaik = 0;
      let jarakTerbaik = Infinity;
      if (lis.length > 0) {
        const awal = lis[0].offsetLeft;
        for (const li of lis) {
          const p = li.offsetLeft - awal;
          if (Math.abs(p - posisi) < jarakTerbaik) {
            jarakTerbaik = Math.abs(p - posisi);
            terbaik = p;
          }
        }
      }
      // Ujung kanan deret tetap dianggap titik jepit supaya kartu terakhir
      // bisa tergelincir penuh masuk layar.
      if (Math.abs(maks - posisi) < jarakTerbaik) terbaik = maks;
      return Math.max(0, Math.min(terbaik, maks));
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!seret.aktif || event.pointerId !== seret.id) return;
      seret.aktif = false;
      lepasTekan();
      try {
        ul.releasePointerCapture(event.pointerId);
      } catch {
        // tangkapan bisa sudah lepas sendiri
      }
      const batal = event.type === "pointercancel";
      // Ketukan tanpa seretan membuka kartu langsung dari sini: penangkapan
      // pointer memindahkan sasaran klik ke wadah deret, jadi klik tombolnya
      // tidak akan pernah sampai.
      if (!seret.sudahGeser && !batal) {
        const tombol = seret.klik?.closest("button");
        const indeks = tombol instanceof HTMLButtonElement ? tombol.dataset.indeks : undefined;
        if (tombol instanceof HTMLButtonElement && indeks !== undefined) {
          seret.habiskanKlik = true;
          bukaKartu(Number(indeks), tombol);
        }
      }
      seret.klik = null;
      // Kecepatan dihitung dari jejak gerakan ±120 ms terakhir, bukan hanya
      // titik terakhir, lalu diproyeksikan untuk memilih kartu jepitan.
      const kini = performance.now();
      const jejak = seret.contoh.filter((c) => kini - c.t <= 120);
      const mula = jejak[0] ?? seret.contoh[0];
      const akhir = seret.contoh[seret.contoh.length - 1];
      const kecepatan =
        mula && akhir && akhir.t > mula.t ? ((akhir.x - mula.x) / (akhir.t - mula.t)) * 1000 : 0;
      const maks = ul.scrollWidth - ul.clientWidth;
      const titikHenti = batal
        ? ul.scrollLeft
        : Math.max(0, Math.min(ul.scrollLeft + proyeksiMomentum(-kecepatan), maks));
      const sasaran = jepitTerdekat(titikHenti);
      if (karetPasang) {
        karetPasang = false;
        karetTween = gsap.to(semuaKartu(), {
          x: 0,
          duration: 0.45,
          ease: "back.out(1.2)",
          overwrite: "auto",
        });
      }
      lepasTween?.kill();
      lepasTween = gsap.to(ul, {
        scrollLeft: sasaran,
        duration: tanpaGerakRef.current
          ? 0
          : Math.min(0.7, 0.3 + Math.abs(sasaran - ul.scrollLeft) / 1400),
        ease: tanpaGerakRef.current ? "none" : "expo.out",
        overwrite: "auto",
      });
    };

    const onClickTangkap = (event: MouseEvent) => {
      if (!seret.sudahGeser && !seret.habiskanKlik) return;
      seret.sudahGeser = false;
      seret.habiskanKlik = false;
      event.preventDefault();
      event.stopPropagation();
    };

    // Gulir roda/trackpad dari pengguna memutus animasi jepitan yang berjalan
    // supaya gerakan bisa dialihkan kapan saja.
    const onWheel = () => {
      lepasTween?.kill();
      lepasTween = null;
      if (karetPasang) {
        karetPasang = false;
        karetTween?.kill();
        karetTween = null;
        gsap.set(semuaKartu(), { x: 0 });
      }
    };

    ul.addEventListener("pointerdown", onPointerDown);
    ul.addEventListener("pointermove", onPointerMove);
    ul.addEventListener("pointerup", onPointerUp);
    ul.addEventListener("pointercancel", onPointerUp);
    ul.addEventListener("click", onClickTangkap, true);
    ul.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      ul.removeEventListener("pointerdown", onPointerDown);
      ul.removeEventListener("pointermove", onPointerMove);
      ul.removeEventListener("pointerup", onPointerUp);
      ul.removeEventListener("pointercancel", onPointerUp);
      ul.removeEventListener("click", onClickTangkap, true);
      ul.removeEventListener("wheel", onWheel);
      lepasTween?.kill();
      karetTween?.kill();
      tekanTween?.kill();
    };
  }, [bukaKartu]);

  const padaKunciPanel = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      tutup();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const bisaFokus = panelRef.current.querySelectorAll<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    if (bisaFokus.length === 0) return;
    const pertama = bisaFokus[0];
    const terakhir = bisaFokus[bisaFokus.length - 1];
    if (event.shiftKey && document.activeElement === pertama) {
      event.preventDefault();
      terakhir.focus();
    } else if (!event.shiftKey && document.activeElement === terakhir) {
      event.preventDefault();
      pertama.focus();
    }
  };

  if (items.length === 0) return null;

  const pembinaKosong = items.every((item) => !item.pembina || item.pembina === "-");
  const terlihat = items.filter((item) => cocok(item.jadwal)).length;
  const aktif = buka !== null ? items[buka] : null;
  const wajibAktif =
    aktif !== null ? /wajib/i.test(`${aktif.deskripsi} ${aktif.jadwal}`) : false;

  return (
    <Chapter field="foam" nav="light" pad="tall" id="daftar-ekskul">
      <Inner>
        <div ref={scope}>
          <Reveal stagger={0.08}>
            <h2 data-reveal-item className="t-head">
              {items.length} kegiatan
            </h2>
            <p data-reveal-item className="t-body field-soft mt-7 max-w-[56ch]">
              Semuanya berjalan di luar jam pelajaran. Pramuka wajib bagi seluruh siswa;
              selebihnya dipilih sesuai minat.
            </p>
            <p data-reveal-item className="t-small field-soft mt-4 max-w-[56ch]">
              Potret tiap kartu diambil dari dokumentasi kegiatan sekolah sehari-hari karena
              kegiatan ekstrakurikuler belum memiliki dokumentasi khusus.
            </p>
          </Reveal>

          {/* Chip saringan jadwal. Kartu yang tidak cocok hanya meredup, tidak
              pernah dibuang dari dokumen, supaya tata letak tidak melompat. */}
          <div
            data-saring
            role="group"
            aria-label="Saring kegiatan menurut jadwal"
            className="relative mt-10 flex flex-wrap gap-2"
          >
            <span
              ref={blokRef}
              data-blok
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 h-0 w-0 rounded-md bg-abyss opacity-0"
            />
            {CHIP.map((opsi, index) => {
              const nyala = opsi === pilih;
              return (
                <button
                  key={opsi}
                  type="button"
                  ref={(node) => {
                    chipRefs.current[index] = node;
                  }}
                  onClick={() => setPilih(opsi)}
                  {...tekanChip}
                  aria-pressed={nyala}
                  className={`t-small relative z-10 rounded-md px-4 py-2.5 font-semibold transition-[color,background-color,transform] duration-200 active:translate-y-px active:scale-[0.97] active:duration-100 ${
                    nyala
                      ? "bg-abyss text-white"
                      : "field-soft hover:bg-abyss/8 hover:text-ink"
                  }`}
                >
                  {opsi}
                  <span className="tabular-nums"> {jumlahChip(opsi)}</span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="sr-only">
            Menampilkan {terlihat} dari {items.length} kegiatan.
          </p>

          {/* Di ponsel deretan digeser dengan seretan (lihat efek deret di
              atas); di layar lebar ia menjadi kisi dua kolom kartu landscape. */}
          <ul
            data-deret
            ref={deretRef}
            className="mt-8 -mx-[clamp(1.25rem,4.5vw,4.5rem)] flex touch-pan-y gap-4 overflow-x-auto px-[clamp(1.25rem,4.5vw,4.5rem)] pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-8 md:overflow-visible md:px-0 md:pb-0"
          >
            {items.map((item, index) => {
              const wajib = /wajib/i.test(`${item.deskripsi} ${item.jadwal}`);
              const foto = fotoKegiatan(item.nama);
              const redup = !cocok(item.jadwal);
              return (
                <li
                  key={item.nama}
                  data-kartu
                  className={`group relative w-[78vw] max-w-[24rem] shrink-0 overflow-hidden rounded-xl bg-sky transition-[opacity,filter] duration-500 md:w-auto md:max-w-none ${
                    redup ? "opacity-40 saturate-[.65]" : ""
                  }`}
                >
                  <div className={`transition-transform duration-500 ${redup ? "scale-[.98]" : ""}`}>
                    <div data-kartu-foto className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        sizes="(min-width: 768px) 45vw, 78vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                      />
                    </div>
                    <div className="px-5 py-4 md:px-6 md:py-5">
                      <div className="transition-transform duration-500 group-hover:translate-x-[2px] group-focus-within:translate-x-[2px]">
                        <h3 data-kartu-judul className="t-statement flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: item.warna }}
                          />
                          <span className="roll" data-roll={item.nama}>
                            <span className="roll-face">{item.nama}</span>
                          </span>
                        </h3>
                      </div>
                      <p
                        data-kartu-jadwal
                        className="t-small field-soft mt-2 transition-transform duration-500 group-hover:translate-x-[3px] group-hover:delay-75 group-focus-within:translate-x-[3px] group-focus-within:delay-75"
                      >
                        {item.jadwal}
                        {wajib ? " · wajib" : ""}
                      </p>
                      <p className="t-body mt-3 line-clamp-2 transition-transform duration-500 group-hover:translate-x-[3px] group-hover:delay-150 group-focus-within:translate-x-[3px] group-focus-within:delay-150">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-indeks={index}
                    onClick={(event) => bukaKartu(index, event.currentTarget)}
                    aria-label={`Baca fokus: ${item.nama}`}
                    className="absolute inset-0 rounded-xl text-ink"
                  />
                </li>
              );
            })}
          </ul>

          {pembinaKosong ? (
            <p className="t-small field-soft mt-10 max-w-[70ch]">
              Nama pembina tiap kegiatan belum tercatat pada berkas resmi sekolah, jadi tidak
              dicantumkan di sini.
            </p>
          ) : null}

          {/* Panel baca fokus: elemen bersama dengan kartu asalnya (FLIP).
              Isi kartu selalu ada di dokumen untuk SEO dan noscript; panel ini
              hanyalah tampilan lanjutan atas data yang sama. Bingkainya
              dipisah dari isi supaya potret, judul, dan chip jadwal bisa
              terbang keluar batas panel tanpa terpotong. */}
          {aktif ? (
            <div className="fixed inset-0 z-50" onKeyDown={padaKunciPanel}>
              <div
                ref={scrimRef}
                onClick={tutup}
                aria-hidden
                className="absolute inset-0 bg-abyss/80 opacity-0"
              />
              <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
                <div
                  ref={panelRef}
                  data-panel
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="judul-detail-ekskul"
                  className="relative flex max-h-[calc(100svh-2rem)] w-full max-w-xl flex-col"
                >
                  <div
                    data-panel-bingkai
                    aria-hidden
                    className="absolute inset-0 z-0 rounded-xl bg-foam opacity-0 outline outline-1 -outline-offset-1 outline-line"
                  />
                  <div
                    ref={fotoRef}
                    className="relative z-[1] aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-xl"
                  >
                    {namaLama ? (
                      <Image
                        key={`lama-${namaLama}`}
                        data-foto-lama
                        src={fotoKegiatan(namaLama).src}
                        alt=""
                        aria-hidden
                        fill
                        sizes="min(90vw, 36rem)"
                        className="object-cover"
                      />
                    ) : null}
                    <Image
                      key={aktif.nama}
                      data-foto-baru
                      src={fotoKegiatan(aktif.nama).src}
                      alt={fotoKegiatan(aktif.nama).alt}
                      fill
                      sizes="min(90vw, 36rem)"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative z-[1] shrink-0 px-5 pt-5 md:px-7 md:pt-6">
                    <h3
                      ref={judulRef}
                      data-panel-judul
                      data-panel-teks
                      id="judul-detail-ekskul"
                      className="t-statement flex items-center gap-2.5"
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: aktif.warna }}
                      />
                      {aktif.nama}
                    </h3>
                    <div data-panel-teks className="mt-3 flex flex-wrap gap-2">
                      <span
                        ref={jadwalRef}
                        data-panel-jadwal
                        className="t-small inline-flex items-center rounded-md bg-sky px-3 py-1.5 font-semibold"
                      >
                        {aktif.jadwal}
                      </span>
                      {wajibAktif ? (
                        <span
                          data-panel-tambahan
                          className="t-small inline-flex items-center rounded-md bg-marine px-3 py-1.5 font-semibold text-white"
                        >
                          Wajib bagi seluruh siswa
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-7 md:pb-6">
                    <p data-panel-tambahan data-panel-teks className="t-body mt-4">
                      {aktif.deskripsi}
                    </p>
                    {aktif.pembina && aktif.pembina !== "-" ? (
                      <p data-panel-tambahan data-panel-teks className="t-small field-soft mt-4">
                        Pembina: {aktif.pembina}
                      </p>
                    ) : null}
                    <div data-panel-tambahan data-panel-teks className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => geser(-1)}
                        {...tekanGeser}
                        aria-label="Kegiatan sebelumnya"
                        className="t-small rounded-lg bg-sky px-4 py-3 font-semibold transition-[background-color,transform] duration-300 hover:bg-abyss/10 active:translate-y-px active:scale-[0.97] active:duration-100"
                      >
                        Sebelumnya
                      </button>
                      <span className="t-small tabular-nums">
                        {(buka ?? 0) + 1}/{items.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => geser(1)}
                        {...tekanGeser}
                        aria-label="Kegiatan berikutnya"
                        className="t-small rounded-lg bg-sky px-4 py-3 font-semibold transition-[background-color,transform] duration-300 hover:bg-abyss/10 active:translate-y-px active:scale-[0.97] active:duration-100"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                  <button
                    ref={tutupRef}
                    type="button"
                    onClick={tutup}
                    {...tekanTutup}
                    className="t-small absolute top-3 right-3 z-[2] inline-flex items-center gap-1.5 rounded-lg bg-foam px-3.5 py-2.5 font-semibold text-ink transition-[background-color,transform] duration-300 hover:bg-sky active:translate-y-px active:scale-[0.97] active:duration-100"
                  >
                    <XIcon aria-hidden className="size-4" />
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Inner>
    </Chapter>
  );
}
