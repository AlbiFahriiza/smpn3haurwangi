"use client";

import { useState } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { Chapter, Inner } from "../chapters/chapter";
import { Reveal } from "@/components/motion/reveal";
import { OpenerChapter } from "../chapters/opener-chapter";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { useToast } from "@/hooks/use-toast";

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
  const [terkirim, setTerkirim] = useState(false);

  const alamat = contact?.alamat ?? identity?.alamat ?? "";
  const surel = contact?.email ?? identity?.email ?? "smpn3_haurwangi@yahoo.com";
  const jam = contact?.jamLayanan ?? "Senin-Jumat, 07.00-15.30 WIB";
  const petaEmbed = contact?.mapsEmbed ?? "https://www.google.com/maps?q=-6.8005,107.3064&z=16&output=embed";
  const petaTautan = contact?.mapsLink ?? "https://www.google.com/maps?q=-6.8005,107.3064";
  const sosial = contact?.sosial ?? [];
  const surelUrl = `mailto:${surel}?subject=Pertanyaan%20tentang%20SMP%20Negeri%203%20Haurwangi`;

  const kirim = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nama = String(data.get("nama") ?? "");
    const pesan = String(data.get("pesan") ?? "");
    window.location.href = `mailto:${surel}?subject=${encodeURIComponent(
      `Pesan dari ${nama} melalui website sekolah`,
    )}&body=${encodeURIComponent(pesan)}`;
    setTerkirim(true);
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
        className="break-words underline decoration-marine/40 underline-offset-4 transition-colors hover:decoration-marine"
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
                      className="t-small bg-abyss px-5 py-3 font-semibold text-white transition-colors hover:bg-deep"
                    >
                      {kanal.nama}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Reveal>

          <Reveal className="mt-20" stagger={0.06}>
            <h3 data-reveal-item className="t-body field-soft">
              Penanda saat berkunjung
            </h3>
            <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-3">
              {PENANDA.map((penanda) => (
                <li key={penanda.src} data-reveal-item>
                  <div className="relative aspect-[4/3] overflow-hidden bg-deep">
                    <Image
                      src={penanda.src}
                      alt={penanda.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
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
              <div data-reveal-item className="mt-8">
                <iframe
                  src={petaEmbed}
                  title="Peta lokasi SMP Negeri 3 Haurwangi"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="h-[320px] w-full border-0 md:h-[420px]"
                />
              </div>
              <p data-reveal-item className="t-small field-soft mt-4">
                Koordinat -6,8005 / 107,3064 ·{" "}
                <a
                  href={petaTautan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
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

              <form data-reveal-item onSubmit={kirim} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="pesan-nama" className="t-small field-soft">
                    Nama
                  </label>
                  <input
                    id="pesan-nama"
                    name="nama"
                    required
                    autoComplete="name"
                    placeholder="Nama lengkap Anda"
                    className="t-body mt-2 w-full bg-white px-4 py-3 text-ink placeholder:text-ink/70"
                  />
                </div>
                <div>
                  <label htmlFor="pesan-isi" className="t-small field-soft">
                    Pesan
                  </label>
                  <textarea
                    id="pesan-isi"
                    name="pesan"
                    required
                    rows={5}
                    placeholder="Tulis pertanyaan, saran, atau masukan Anda"
                    className="t-body mt-2 w-full resize-none bg-white px-4 py-3 text-ink placeholder:text-ink/70"
                  />
                </div>
                <button
                  type="submit"
                  className="t-body bg-abyss px-7 py-4 font-semibold text-white transition-colors hover:bg-deep"
                >
                  {terkirim ? "Buka aplikasi surel" : "Kirim pesan"}
                </button>
              </form>
            </Reveal>
          </div>
        </Inner>
      </Chapter>
    </>
  );
}
