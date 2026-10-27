"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { XIcon } from "lucide-react";
import type { EkskulSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

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
  "Bola Voli": {
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

/**
 * Daftar ekstrakurikuler versi lengkap. Tiap kegiatan jadi kartu landscape
 * dengan potret dan jadwalnya; chip hari menyaring tanpa membuang kartu mana
 * pun dari dokumen. Mengetuk kartu membuka panel baca fokus yang terbang dari
 * posisi kartunya (FLIP manual: getBoundingClientRect lalu gsap.fromTo
 * x/y/scale), itulah momen khas halaman ini.
 */
export function EkskulDaftarChapter({ ekskul }: { ekskul?: EkskulSection }) {
  const items = ekskul?.items ?? [];

  const [pilih, setPilih] = useState("Semua");
  const [buka, setBuka] = useState<number | null>(null);
  const [tanpaGerak, setTanpaGerak] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  const blokRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const tutupRef = useRef<HTMLButtonElement>(null);
  const asalRect = useRef<DOMRect | null>(null);
  const asalTombol = useRef<HTMLButtonElement | null>(null);

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
    const pasang = () => setTanpaGerak(mq.matches);
    pasang();
    mq.addEventListener("change", pasang);
    return () => mq.removeEventListener("change", pasang);
  }, []);

  /**
   * Satu blok sorot yang berpindah antar chip (pola blok hover navigasi):
   * diukur dari ukuran chip tujuan lalu digerakkan transform. Blok ini
   * absolute dan di luar aliran, jadi perpindahannya tidak menggeser tata
   * letak. Warna latar chip aktif pada HTML awal tetap dicat sendiri agar
   * tampilan tanpa JS benar; begitu blok siap, cat itu dilepas lewat DOM
   * sebelum paint supaya pengecatan sepenuhnya dipegang blok.
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
      gsap.to(blok, {
        x: sasaran.offsetLeft,
        y: sasaran.offsetTop,
        width: sasaran.offsetWidth,
        height: sasaran.offsetHeight,
        autoAlpha: 1,
        duration: langsung ? 0 : 0.4,
        ease: "expo.out",
        overwrite: "auto",
      });
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

  // Kartu masuk dengan kisaran atas terbuka (clip-path) dan bertumpang
  // sedikit (stagger 0.07), semuanya transform/opacity/clip-path saja.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-saring]", {
          y: 14,
          opacity: 0,
          duration: 0.55,
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
   * Panel baca fokus terbang dari kartu yang diketuk: posisi dan lebar kartu
   * diukur saat klik, panel yang baru terpasang diukur sebelum paint, lalu
   * fromTo x/y/scale menjembatani keduanya. Pengguna gerak minimal langsung
   * mendapat hasil akhir tanpa penerbangan.
   */
  useGSAP(
    () => {
      if (buka === null) return;
      const panel = panelRef.current;
      const scrim = scrimRef.current;
      if (!panel || !scrim) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const asal = asalRect.current;
        if (asal) {
          const akhir = panel.getBoundingClientRect();
          gsap.fromTo(
            panel,
            {
              x: asal.left - akhir.left,
              y: asal.top - akhir.top,
              scale: asal.width / akhir.width,
              transformOrigin: "top left",
            },
            { x: 0, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" },
          );
        }
        gsap.fromTo(
          panel.querySelectorAll("[data-panel-isi] > *"),
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            delay: 0.18,
            ease: "power3.out",
          },
        );
        gsap.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
      });
      mm.add(REDUCE, () => {
        gsap.set(scrim, { autoAlpha: 1 });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [buka] },
  );

  const bukaKartu = (index: number, tombol: HTMLButtonElement) => {
    asalRect.current = tombol.getBoundingClientRect();
    asalTombol.current = tombol;
    setBuka(index);
  };

  // Tutup dengan arah balik: isi panel mundur dulu, panel mengecil kembali
  // ke kartu asalnya, lalu fokus dikembalikan ke kartu yang membukanya.
  const tutup = () => {
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    const selesai = () => {
      setBuka(null);
      asalTombol.current?.focus({ preventScroll: true });
    };
    if (tanpaGerak || !panel) {
      selesai();
      return;
    }
    const asal = asalRect.current;
    const tl = gsap.timeline({ onComplete: selesai });
    tl.to(panel.querySelectorAll("[data-panel-isi] > *"), {
      y: -10,
      opacity: 0,
      duration: 0.2,
      stagger: 0.03,
      ease: "power2.in",
    });
    // Ukuran tata letak (bukan visual) dipakai untuk arah balik supaya
    // hitungan tetap benar walau penerbangan pembuka belum selesai.
    const wadah = panel.offsetParent;
    if (asal && wadah instanceof HTMLElement) {
      const kotakWadah = wadah.getBoundingClientRect();
      tl.to(
        panel,
        {
          x: asal.left - kotakWadah.left - panel.offsetLeft,
          y: asal.top - kotakWadah.top - panel.offsetTop,
          scale: asal.width / panel.offsetWidth,
          duration: 0.32,
          ease: "expo.inOut",
        },
        0.06,
      );
    } else {
      tl.to(panel, { autoAlpha: 0, scale: 0.97, duration: 0.22, ease: "power2.in" }, 0.06);
    }
    if (scrim) tl.to(scrim, { autoAlpha: 0, duration: 0.26, ease: "power2.in" }, 0.08);
  };

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

  // Panel terbuka: kunci gulir latar (Lenis di desktop ikut dihentikan) dan
  // taruh fokus pada tombol tutup supaya papan tombol mulai dari dalam panel.
  useEffect(() => {
    if (buka === null) return;
    const lenis = window.__lenis ?? null;
    lenis?.stop();
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tutupRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = sebelumnya;
      lenis?.start();
    };
  }, [buka]);

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
                  aria-pressed={nyala}
                  className={`t-small relative z-10 rounded-md px-4 py-2.5 font-semibold transition-colors duration-300 ${
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

          {/* Di ponsel deretan digulir menyamping dengan jepitan snap; di
              layar lebar ia menjadi kisi dua kolom kartu landscape. */}
          <ul
            data-deret
            className="mt-8 -mx-[clamp(1.25rem,4.5vw,4.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4.5vw,4.5rem)] pb-2 md:mx-0 md:grid md:grid-cols-2 md:snap-none md:gap-x-6 md:gap-y-8 md:overflow-visible md:px-0 md:pb-0"
          >
            {items.map((item, index) => {
              const wajib = /wajib/i.test(`${item.deskripsi} ${item.jadwal}`);
              const foto = fotoKegiatan(item.nama);
              const redup = !cocok(item.jadwal);
              return (
                <li
                  key={item.nama}
                  data-kartu
                  className={`group relative w-[78vw] max-w-[24rem] shrink-0 snap-start overflow-hidden rounded-xl bg-sky transition-[opacity,filter] duration-500 active:translate-y-px md:w-auto md:max-w-none ${
                    redup ? "opacity-40 saturate-[.65]" : ""
                  }`}
                >
                  <div
                    className={`transition-transform duration-500 ${redup ? "scale-[.98]" : ""}`}
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        sizes="(min-width: 768px) 45vw, 78vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="px-5 py-4 md:px-6 md:py-5">
                      <div className="transition-transform duration-500 group-hover:translate-x-[2px]">
                        <h3 className="t-statement flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: item.warna }}
                          />
                          {item.nama}
                        </h3>
                        <p className="t-small field-soft mt-2">
                          {item.jadwal}
                          {wajib ? " · wajib" : ""}
                        </p>
                      </div>
                      <p className="t-body mt-3 line-clamp-2">{item.deskripsi}</p>
                    </div>
                  </div>
                  <button
                    type="button"
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
              hanyalah tampilan lanjutan atas data yang sama. */}
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
                  className="relative max-h-[calc(100svh-2rem)] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-xl bg-foam outline outline-1 -outline-offset-1 outline-line"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <Image
                      src={fotoKegiatan(aktif.nama).src}
                      alt={fotoKegiatan(aktif.nama).alt}
                      fill
                      sizes="min(90vw, 36rem)"
                      className="object-cover"
                    />
                  </div>
                  <button
                    ref={tutupRef}
                    type="button"
                    onClick={tutup}
                    className="t-small absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-foam px-3.5 py-2.5 font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-sky active:translate-y-px"
                  >
                    <XIcon aria-hidden className="size-4" />
                    Tutup
                  </button>
                  <div data-panel-isi className="px-5 py-5 md:px-7 md:py-6">
                    <h3 id="judul-detail-ekskul" className="t-statement flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: aktif.warna }}
                      />
                      {aktif.nama}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="t-small rounded-md bg-sky px-3 py-1.5 font-semibold">
                        {aktif.jadwal}
                      </span>
                      {wajibAktif ? (
                        <span className="t-small rounded-md bg-marine px-3 py-1.5 font-semibold text-white">
                          Wajib bagi seluruh siswa
                        </span>
                      ) : null}
                    </div>
                    <p className="t-body mt-4">{aktif.deskripsi}</p>
                    {aktif.pembina && aktif.pembina !== "-" ? (
                      <p className="t-small field-soft mt-4">Pembina: {aktif.pembina}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Inner>
    </Chapter>
  );
}
