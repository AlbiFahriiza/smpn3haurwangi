"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MapPin } from "lucide-react";
import type { RoutinesSection, SiteContent } from "@/lib/content";
import { Chapter, Inner } from "../chapters/chapter";
import { Reveal } from "@/components/motion/reveal";
import { OpenerChapter } from "../chapters/opener-chapter";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { useToast } from "@/hooks/use-toast";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/** Benar kalau pengunjung meminta gerak dikurangkan; animasi dilewati menjadi lompatan. */
function tanpaGerak(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Tiga penanda yang pertama terlihat saat orang sampai di sekolah. */
const PENANDA = [
  {
    src: "/images/hero/gerbang-utama.jpg",
    alt: "Gerbang utama SMP Negeri 3 Haurwangi dari Jalan Buniayu",
    judul: "Gerbang utama",
  },
  {
    src: "/images/fasilitas/fasilitas-6.jpg",
    alt: "Halaman dan tempat parkir SMP Negeri 3 Haurwangi",
    judul: "Halaman & parkir",
  },
  {
    src: "/images/fasilitas/fasilitas-9.jpg",
    alt: "Blok ruang kelas SMP Negeri 3 Haurwangi",
    judul: "Blok ruang kelas",
  },
];

const HARI_LAYANAN = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;
type Hari = (typeof HARI_LAYANAN)[number];

/**
 * Baca teks jam layanan resmi (misalnya "Senin-Jumat, 07.00-15.30 WIB") menjadi
 * daftar hari buka dan jamnya. Kalau teksnya tidak bisa dibaca, tab hari tidak
 * dirender dan teks aslinya ditampilkan apa adanya supaya data admin apa pun
 * tetap tampil jujur.
 */
function bacaJamLayanan(teks: string): { hariBuka: Hari[]; jam: string } | null {
  const rentang = teks.match(/^([A-Za-z]+)\s*[-–]\s*([A-Za-z]+)/);
  const jam = teks.match(/\d{1,2}\.\d{2}\s*[-–]\s*\d{1,2}\.\d{2}(?:\s*WIB)?/i);
  if (!rentang || !jam) return null;
  const cari = (nama: string) =>
    HARI_LAYANAN.findIndex((hari) => nama.toLowerCase().includes(hari.toLowerCase()));
  const awal = cari(rentang[1]);
  const akhir = cari(rentang[2]);
  if (awal < 0 || akhir < awal) return null;
  return {
    hariBuka: HARI_LAYANAN.slice(awal, akhir + 1) as Hari[],
    jam: jam[0].replace(/–/g, "-").replace(/\s*-\s*/g, "-"),
  };
}

/**
 * Nama kegiatan resmi yang berjalan pada hari itu, dibaca dari data rutinitas
 * sekolah. Tidak ada yang dikarang: hanya kegiatan yang kolom waktunya
 * benar-benar menyebut hari tersebut, rentang Senin-Jumat, atau "setiap hari".
 */
function kegiatanHari(hari: Hari, routines?: RoutinesSection): string[] {
  const items = routines?.items ?? [];
  const nama: string[] = [];
  for (const item of items) {
    const teks = item.waktu.toLowerCase();
    if (teks.includes("akhir tahun")) continue;
    if (/senin\s*[-–]\s*jumat/.test(teks) || teks.includes("setiap hari")) {
      if (hari !== "Sabtu" && hari !== "Minggu") nama.push(item.nama);
    } else if (teks.includes(hari.toLowerCase())) {
      nama.push(item.nama);
    }
  }
  return nama;
}

/**
 * Jam layanan per hari: deretan chip hari dengan satu blok sorot yang berpindah
 * mengikuti hari terpilih (pola blok penanda di batang navigasi), lalu panel jam
 * untuk hari itu. Isi panel seluruhnya dari data resmi.
 */
function JamLayananHari({
  jadwal,
  routines,
}: {
  jadwal: { hariBuka: Hari[]; jam: string };
  routines?: RoutinesSection;
}) {
  const [hari, setHari] = useState<Hari>("Senin");
  const lingkup = useRef<HTMLDivElement>(null);
  const blokRef = useRef<HTMLSpanElement>(null);
  const tombolRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const belumPernahBerganti = useRef(true);

  // Blok diukur dari kotak tombol, bukan dikira-kira, supaya pas di semua
  // ukuran layar (chip bisa melipat jadi dua baris di ponsel).
  const pindahkanBlok = useCallback(
    (langsung: boolean) => {
      const blok = blokRef.current;
      if (!blok) return;
      const sasaran = tombolRefs.current[HARI_LAYANAN.indexOf(hari)];
      if (!sasaran) return;
      gsap.to(blok, {
        x: sasaran.offsetLeft,
        y: sasaran.offsetTop,
        width: sasaran.offsetWidth,
        height: sasaran.offsetHeight,
        autoAlpha: 1,
        duration: langsung || tanpaGerak() ? 0 : 0.45,
        ease: "expo.out",
        overwrite: "auto",
      });
    },
    [hari],
  );

  // Posisi pertama dipasang sebelum cat (useGSAP berjalan sebagai layout
  // effect) supaya blok tidak pernah terlihat menempel di pojok kiri.
  useGSAP(() => pindahkanBlok(false), {
    scope: lingkup,
    dependencies: [pindahkanBlok],
  });

  // Lebar chip bergeser setelah font termuat dan saat jendela berubah ukuran;
  // blok diukur ulang pada dua kejadian itu, tanpa animasi.
  useEffect(() => {
    const ukurUlang = () => pindahkanBlok(true);
    window.addEventListener("resize", ukurUlang);
    let batal = false;
    void document.fonts?.ready.then(() => {
      if (!batal) ukurUlang();
    });
    return () => {
      batal = true;
      window.removeEventListener("resize", ukurUlang);
    };
  }, [pindahkanBlok]);

  // Isi panel berganti menumpang saat hari dipilih. Pergantian pertama
  // (pemasangan awal) dilewati supaya tidak bertumpuk dengan Reveal induknya.
  useGSAP(
    () => {
      if (belumPernahBerganti.current) {
        belumPernahBerganti.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-jam-item]", {
          y: 8,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
      return () => mm.revert();
    },
    { scope: lingkup, dependencies: [hari], revertOnUpdate: true },
  );

  const pindahkanFokus = (index: number, arah: number) => {
    const berikut = (index + arah + HARI_LAYANAN.length) % HARI_LAYANAN.length;
    setHari(HARI_LAYANAN[berikut]);
    tombolRefs.current[berikut]?.focus();
  };

  const buka = jadwal.hariBuka.includes(hari);
  const kegiatan = kegiatanHari(hari, routines);
  const keterangan =
    kegiatan.length > 0
      ? `Kegiatan terjadwal hari ${hari}: ${kegiatan.join(" · ")}.`
      : buka
        ? "Kegiatan belajar mengajar berjalan sesuai jadwal rutin sekolah."
        : "Tidak ada kegiatan terjadwal pada data resmi sekolah.";

  return (
    <div ref={lingkup}>
      <div
        role="tablist"
        aria-label="Pilih hari layanan"
        className="relative mt-6 flex max-w-[36rem] flex-wrap gap-2"
      >
        {/* Blok sorot: satu-satunya penanda hari terpilih dan ia yang bergerak
            antar hari, bukan tiap chip menyalah sendiri-sendiri. */}
        <span
          ref={blokRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-10 w-0 rounded-md bg-ink/12 opacity-0"
        />
        {HARI_LAYANAN.map((opsi, index) => {
          const aktif = opsi === hari;
          return (
            <button
              key={opsi}
              type="button"
              ref={(node) => {
                tombolRefs.current[index] = node;
              }}
              role="tab"
              id={`hari-${opsi}`}
              aria-selected={aktif}
              aria-controls={`jam-${opsi}`}
              tabIndex={aktif ? 0 : -1}
              onClick={() => setHari(opsi)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  pindahkanFokus(index, 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  pindahkanFokus(index, -1);
                }
              }}
              className={`t-small relative z-10 rounded-md px-4 py-2.5 transition-[background-color,color,translate] duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine ${
                aktif ? "font-semibold text-ink" : "text-ink/85 hover:bg-ink/8"
              }`}
            >
              {opsi}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`jam-${hari}`} aria-labelledby={`hari-${hari}`} className="mt-6">
        <p data-jam-item className="t-small field-soft">
          {buka ? "Jam layanan kantor" : "Di luar jam layanan kantor"}
        </p>
        <p data-jam-item className="t-statement tabular mt-2">
          {buka ? jadwal.jam : "Kantor sekolah tutup"}
        </p>
        {/* Tinggi dua baris kecil dipesan supaya pergantian hari tidak
            menggeser isi di bawahnya. */}
        <p data-jam-item className="t-small field-soft mt-3 min-h-10 max-w-[56ch]">
          {keterangan}
        </p>
      </div>
    </div>
  );
}

type Kolom = "nama" | "pesan";

const PESAN_KOSONG: Record<Kolom, string> = {
  nama: "Nama masih kosong; tulis dulu nama Anda.",
  pesan: "Pesan masih kosong; tulis dulu pertanyaan atau masukan Anda.",
};

/**
 * Halaman Kontak: alamat, surel, jam layanan, peta, dan satu formulir yang
 * mengarahkan pesan ke surel resmi sekolah.
 *
 * Nomor telepon tidak ditampilkan karena sumber resmi belum mempublikasikannya;
 * hal itu disebutkan terbuka supaya tidak terbaca sebagai data yang hilang.
 */
export function KontakTab({ content }: { content: Partial<SiteContent> }) {
  const contact = content.contact;
  const identity = content.identity;
  const { toast } = useToast();
  const [status, setStatus] = useState<"siap" | "terbuka">("siap");
  const [galat, setGalat] = useState<Record<Kolom, string>>({ nama: "", pesan: "" });
  const bentukRef = useRef<HTMLFormElement>(null);
  const petaScope = useRef<HTMLDivElement>(null);

  // Peta Google kadang tidak termuat: jaringan lambat, terblokir, atau perangkat
  // lama. Begitu bingkai peta mendekati layar (iframe malas mulai dimuat di
  // titik itu), tenggat dijalankan; lewat tenggat tanpa kabar siap berarti
  // panel pengganti yang mengambil tempat, lengkap dengan tautan yang tetap
  // bisa diklik, sehingga tidak pernah ada kotak kosong yang mematikan.
  const [petaSiap, setPetaSiap] = useState(false);
  const [petaGagal, setPetaGagal] = useState(false);
  const petaSiapRef = useRef(false);

  const alamat = contact?.alamat ?? identity?.alamat ?? "";
  const surel = contact?.email ?? identity?.email ?? "smpn3_haurwangi@yahoo.com";
  const jam = contact?.jamLayanan ?? "Senin-Jumat, 07.00-15.30 WIB";
  const jadwal = bacaJamLayanan(jam);
  const petaEmbed = contact?.mapsEmbed ?? "https://www.google.com/maps?q=-6.8005,107.3064&z=16&output=embed";
  const petaTautan = contact?.mapsLink ?? "https://www.google.com/maps?q=-6.8005,107.3064";
  const sosial = contact?.sosial ?? [];
  const surelUrl = `mailto:${surel}?subject=Pertanyaan%20tentang%20SMP%20Negeri%203%20Haurwangi`;

  useEffect(() => {
    const wadah = petaScope.current;
    if (!wadah) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          timer = setTimeout(() => {
            if (!petaSiapRef.current) setPetaGagal(true);
          }, 9000);
          io.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    io.observe(wadah);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Panel peta dikupas naik dari balik tepi bawahnya, gerak clip-path saja.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-peta-panel]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-peta-panel]", start: "top 86%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: petaScope },
  );

  // Galat masuk menumpang: keduanya naik bersamaan dengan jeda kecil.
  useGSAP(
    () => {
      if (!galat.nama && !galat.pesan) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from("[data-galat]", {
          y: 6,
          opacity: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
      return () => mm.revert();
    },
    { scope: bentukRef, dependencies: [galat], revertOnUpdate: true },
  );

  // Umpan balik terkirim: centang tergambar dan label berganti dengan settle
  // back.out. Keduanya hanya aksen; pengiriman tetap jalan tanpa animasi.
  useGSAP(
    () => {
      if (status !== "terbuka") return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          "[data-cek-garis]",
          { strokeDashoffset: 20 },
          { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" },
        );
        gsap.from("[data-cek]", { scale: 0.4, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
        gsap.from("[data-label-tombol]", {
          y: 8,
          opacity: 0,
          duration: 0.45,
          ease: "power3.out",
          delay: 0.06,
        });
      });
      return () => mm.revert();
    },
    { scope: bentukRef, dependencies: [status], revertOnUpdate: true },
  );

  // Validasi saat kolom ditinggalkan: galat dipasang kalau kosong, dilepas
  // kalau terisi; teks yang sudah diketik selalu dipertahankan.
  const periksaSaatLepas =
    (kolom: Kolom) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const valid = event.currentTarget.value.trim().length > 0;
    setGalat((kini) => {
      const berikut = valid ? "" : PESAN_KOSONG[kolom];
      return kini[kolom] === berikut ? kini : { ...kini, [kolom]: berikut };
    });
  };

  // Galat lama dicabut begitu pengguna mulai mengisi ulang kolomnya.
  const cabutGalatSaatIsi =
    (kolom: Kolom) => (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!event.currentTarget.value.trim()) return;
    setGalat((kini) => (kini[kolom] ? { ...kini, [kolom]: "" } : kini));
  };

  const kirim = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nama = String(data.get("nama") ?? "").trim();
    const pesan = String(data.get("pesan") ?? "").trim();
    if (!nama || !pesan) {
      setGalat({
        nama: nama ? "" : PESAN_KOSONG.nama,
        pesan: pesan ? "" : PESAN_KOSONG.pesan,
      });
      document.getElementById(nama ? "pesan-isi" : "pesan-nama")?.focus();
      return;
    }
    setGalat({ nama: "", pesan: "" });
    setStatus("terbuka");
    window.location.href = `mailto:${surel}?subject=${encodeURIComponent(
      `Pesan dari ${nama} melalui website sekolah`,
    )}&body=${encodeURIComponent(pesan)}`;
    toast({
      title: "Aplikasi surel dibuka",
      description: "Lanjutkan pengiriman pesan dari aplikasi surel Anda.",
    });
  };

  const keterangan: Array<[string, React.ReactNode]> = [
    ["Alamat", alamat],
    [
      "Surel resmi",
      <a
        key="surel"
        href={surelUrl}
        className="break-words underline decoration-marine/40 underline-offset-4 transition-colors hover:decoration-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        {surel}
      </a>,
    ],
    ["Jam layanan", jam],
    [
      "Telepon",
      <span key="telepon" className="field-soft">
        Belum dipublikasikan pada sumber resmi sekolah
      </span>,
    ],
  ];

  return (
    <>
      <OpenerChapter
        field={BIDANG_PEMBUKA["/kontak"].field}
        nav={BIDANG_PEMBUKA["/kontak"].ink}
        judul="Kontak"
        pengantar="Alamat, surel, dan jam layanan SMP Negeri 3 Haurwangi. Surel adalah saluran resmi yang paling cepat dibalas."
        keterangan={
          <p className="t-small field-soft">
            Jalan Buniayu, Kertamukti · {jam}
          </p>
        }
        gambar={{
          src: "/images/galeri/foto-bersama-guru-1.jpg",
          alt: "Guru dan staf SMP Negeri 3 Haurwangi",
        }}
      />

      <Chapter field="foam" nav="light" pad="tall" id="alamat-dan-surel">
        <Inner>
          <Reveal stagger={0.07}>
            <h2 data-reveal-item className="t-head">
              Alamat &amp; saluran resmi
            </h2>
            <p data-reveal-item className="t-body field-soft mt-7 max-w-[56ch]">
              Surel resmi yang dipublikasikan sekolah hanya satu, dan itulah saluran yang dibaca
              pada hari kerja. Selain surel, kunjungan langsung sebaiknya dijadwalkan lebih dulu.
            </p>

            <dl className="mt-12 grid gap-x-16 gap-y-8 md:grid-cols-2">
              {keterangan.map(([label, nilai]) => (
                <div key={label} data-reveal-item className="min-w-0">
                  <dt className="t-small field-soft">{label}</dt>
                  <dd className="t-body mt-1">{nilai}</dd>
                </div>
              ))}
            </dl>

            {sosial.length > 0 ? (
              <div data-reveal-item className="mt-12">
                <p className="t-small field-soft">Saluran lain</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sosial.map((kanal) => (
                    <a
                      key={kanal.nama}
                      href={kanal.url}
                      {...(kanal.url.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="t-small rounded-md bg-abyss px-5 py-3 font-semibold text-white transition-[background-color,translate] duration-200 hover:bg-deep active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                    >
                      {kanal.nama}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Reveal>

          <Reveal className="mt-12" stagger={0.06}>
            <h3 data-reveal-item className="t-body field-soft">
              Jam layanan per hari
            </h3>
            <p data-reveal-item className="t-small field-soft mt-3 max-w-[56ch]">
              Pilih hari untuk melihat jam buka layanan kantor dan kegiatan yang berjalan pada
              hari itu.
            </p>
            <div data-reveal-item className="mt-2">
              {jadwal ? (
                <JamLayananHari jadwal={jadwal} routines={content.routines} />
              ) : (
                <p className="t-body mt-4">{jam}</p>
              )}
            </div>
          </Reveal>

          <Reveal className="mt-20" stagger={0.06}>
            <h3 data-reveal-item className="t-body field-soft">
              Penanda saat berkunjung
            </h3>
            <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-3">
              {PENANDA.map((penanda) => (
                <li key={penanda.src} data-reveal-item>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-deep">
                    <Image
                      src={penanda.src}
                      alt={penanda.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="t-small field-soft mt-3">{penanda.judul}</p>
                </li>
              ))}
            </ul>
            <p className="t-body field-soft mt-6 max-w-[62ch]">
              Ketiga tempat di atas adalah yang paling sering ditanyakan saat kunjungan;
              sebutkan salah satunya saat menghubungi sekolah lewat surel.
            </p>
          </Reveal>
        </Inner>
      </Chapter>

      <Chapter field="sky" nav="light" pad="tall" id="peta-dan-pesan">
        <Inner>
          <div className="grid gap-x-16 gap-y-24 lg:grid-cols-12 lg:gap-y-14">
            <Reveal className="lg:col-span-7" stagger={0.07}>
              <h2 data-reveal-item className="t-head">
                Peta lokasi
              </h2>
              <p data-reveal-item className="t-body field-soft mt-6 max-w-[52ch]">
                Sekolah berada di Jalan Buniayu, Desa Kertamukti, Kecamatan Haurwangi,
                Kabupaten Cianjur. Untuk kunjungan, sebutkan tanggal dan keperluannya lebih
                dulu supaya bisa dijadwalkan.
              </p>
              <div ref={petaScope} className="mt-8">
                {/* Bingkai peta: sudut pelan dengan garis rambut; overflow-hidden
                    wajib supaya peta tidak keluar dari sudutnya. Tinggi minimum
                    dijaga agar panel pengganti tetap layak saat iframe dilepas. */}
                <div
                  data-peta-panel
                  className="relative min-h-[320px] overflow-hidden rounded-xl outline outline-1 -outline-offset-1 outline-line md:min-h-[420px]"
                >
                  {/* Panel pengganti di balik iframe: terlihat selagi peta masih
                      dimuat, lalu menjadi satu-satunya isi bila tenggat habis. */}
                  {!petaSiap ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-4 bg-sky px-6 text-center"
                    >
                      <MapPin aria-hidden className="size-9 text-marine" />
                      <p className="t-body max-w-[40ch]">
                        {petaGagal
                          ? "Peta daring tidak dapat dimuat pada perangkat ini. Lokasi tetap bisa dibuka di aplikasi peta."
                          : "Peta lokasi sekolah sedang dimuat."}
                      </p>
                      <a
                        href={petaTautan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="t-small rounded-lg bg-marine px-5 py-3 font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-abyss active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        Buka lokasi di Google Maps
                      </a>
                    </div>
                  ) : null}
                  {!petaGagal ? (
                    <iframe
                      src={petaEmbed}
                      title="Peta lokasi SMP Negeri 3 Haurwangi"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      onLoad={(event) => {
                        // Kejadian "load" ikut menyala untuk halaman kosong
                        // ketika navigasi gagal, jadi cek isinya: peta Google
                        // yang betul-betul termuat punya bingkai anak di dalam
                        // iframe (window.length > 0). Kalau kosong, biarkan
                        // tenggat yang memutuskan menggantikan peta.
                        const bingkaiAnak = event.currentTarget.contentWindow?.length ?? 0;
                        if (bingkaiAnak > 0) {
                          petaSiapRef.current = true;
                          setPetaSiap(true);
                        }
                      }}
                      className="relative z-10 h-[320px] w-full border-0 md:h-[420px]"
                    />
                  ) : null}
                </div>
              </div>
              <p data-reveal-item className="t-small field-soft mt-4">
                Koordinat -6,8005 / 107,3064 ·{" "}
                <a
                  href={petaTautan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  Buka di Google Maps
                </a>
              </p>
            </Reveal>

            <Reveal className="lg:col-span-5" stagger={0.07}>
              <h2 data-reveal-item className="t-head">
                Kirim pesan
              </h2>
              <p data-reveal-item className="t-body field-soft mt-6 max-w-[42ch]">
                Tulis pertanyaan, saran, atau masukan. Pesan akan diteruskan ke surel resmi
                sekolah lewat aplikasi surel di perangkat Anda.
              </p>

              {/* Validasi bawaan browser dimatikan supaya galat bisa ditampilkan
                  inline dengan animasi; atribut required tetap dipakai sebagai
                  penanda semantik bagi pembaca layar. */}
              <form
                data-reveal-item
                ref={bentukRef}
                onSubmit={kirim}
                noValidate
                className="mt-8 space-y-6"
              >
                <div className="form-field group relative">
                  <label
                    htmlFor="pesan-nama"
                    className="t-small transition-[color,transform] duration-200 group-focus-within:translate-x-1"
                  >
                    Nama
                  </label>
                  <input
                    id="pesan-nama"
                    name="nama"
                    required
                    autoComplete="name"
                    placeholder="Nama lengkap Anda"
                    aria-invalid={galat.nama ? true : undefined}
                    aria-describedby={galat.nama ? "galat-nama" : undefined}
                    onBlur={periksaSaatLepas("nama")}
                    onInput={cabutGalatSaatIsi("nama")}
                    className="t-body mt-2 w-full rounded-md bg-white px-4 py-3 text-ink placeholder:text-ink/70"
                  />
                  {galat.nama ? (
                    <p
                      data-galat
                      id="galat-nama"
                      role="alert"
                      className="t-small absolute inset-x-0 top-full mt-1 font-semibold text-ink"
                    >
                      {galat.nama}
                    </p>
                  ) : null}
                </div>
                <div className="form-field group relative">
                  <label
                    htmlFor="pesan-isi"
                    className="t-small transition-[color,transform] duration-200 group-focus-within:translate-x-1"
                  >
                    Pesan
                  </label>
                  <textarea
                    id="pesan-isi"
                    name="pesan"
                    required
                    rows={5}
                    placeholder="Tulis pertanyaan, saran, atau masukan Anda"
                    aria-invalid={galat.pesan ? true : undefined}
                    aria-describedby={galat.pesan ? "galat-pesan" : undefined}
                    onBlur={periksaSaatLepas("pesan")}
                    onInput={cabutGalatSaatIsi("pesan")}
                    className="t-body mt-2 w-full resize-none rounded-md bg-white px-4 py-3 text-ink placeholder:text-ink/70"
                  />
                  {galat.pesan ? (
                    <p
                      data-galat
                      id="galat-pesan"
                      role="alert"
                      className="t-small absolute inset-x-0 top-full mt-1 font-semibold text-ink"
                    >
                      {galat.pesan}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  className="t-body inline-flex items-center gap-2 rounded-lg bg-abyss px-7 py-4 font-semibold text-white transition-[background-color,translate] duration-200 hover:bg-deep active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                >
                  {status === "terbuka" ? (
                    <>
                      <svg data-cek viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                        <path
                          data-cek-garis
                          d="M5 13l4 4L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={20}
                          strokeDashoffset={0}
                        />
                      </svg>
                      <span data-label-tombol>Aplikasi surel dibuka</span>
                    </>
                  ) : (
                    <span data-label-tombol>Kirim pesan</span>
                  )}
                </button>
              </form>
            </Reveal>
          </div>
        </Inner>
      </Chapter>
    </>
  );
}
