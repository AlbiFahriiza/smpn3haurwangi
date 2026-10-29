"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type {
  AboutSection,
  ContactSection,
  Identity,
  StudentsSection,
  TeachersSection,
  VisionSection,
} from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/**
 * Lima bab halaman Tentang Sekolah. Semuanya dibangun dari berkas konten yang
 * sama dengan beranda; yang membedakan hanyalah kelengkapannya — di sini
 * seluruh isi data ditampilkan, bukan cuplikannya.
 *
 * Aturan yang dipegang sama seperti beranda: satu bidang warna datar per bab,
 * tanpa kartu, tanpa garis pemisah, tanpa bayangan. Pemisah antar baris adalah
 * jarak, bukan garis. Sudut membulat mengikuti skala radius Soft Round (chip
 * rounded-md, foto rounded-xl) dan geraknya mengikuti Motion v2: masuk
 * bertumpang, berakhir dengan settle, angka dihitung naik.
 */

/**
 * Deret label–nilai datar. Nilainya sengaja setinggi teks isi, bukan setinggi
 * teks besar: label kecil yang menempel di atas teks besar terbaca seperti
 * kicker bertumpuk, dan itu justru yang harus dihindari.
 *
 * Barisnya bukan kartu: bidang sorot rounded-md hanya muncul saat kursor
 * melintas. Sisi kiri–kanan ditarik keluar sejauh paddingnya supaya teks
 * tetap sejajar dengan kolom sebelah.
 */
function DaftarNilai({ baris }: { baris: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
      {baris.map(([label, nilai]) => (
        <div
          key={label}
          data-reveal-item
          className="min-w-0 -mx-3 rounded-md px-3 py-2.5 transition-colors duration-200 hover:bg-white/10"
        >
          <dt className="t-small field-soft">{label}</dt>
          <dd className="t-body mt-1">{nilai}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Satu angka penting dengan labelnya. Label dan angka duduk sebaris; kalau
 * ditumpuk, label kecil di atas angka besar terbaca sebagai kicker.
 * Angkanya memakai tabular-nums supaya kolomnya sejajar; nilai angka murni
 * diberi tanda data-count untuk dihitung naik saat masuk layar.
 */
function Angka({ label, nilai }: { label: string; nilai: string }) {
  const hitung = /^\d+$/.test(nilai.trim()) ? Number(nilai) : null;
  return (
    <div data-reveal-item className="flex items-baseline justify-between gap-6">
      <dt className="t-small field-soft">{label}</dt>
      <dd className="t-statement tabular-nums" data-count={hitung ?? undefined}>
        {nilai}
      </dd>
    </div>
  );
}

/**
 * Pembungkus yang menghitung naik semua [data-count] di dalamnya saat masuk
 * layar. Hasil akhir sudah tercetak di HTML; penghitungan hanya menimpa
 * isinya selama animasi (konten tetap di DOM), dan tidak jalan sama sekali
 * bila pengguna meminta gerak dikurangi. Ease expo.out memberi ujung gerak
 * yang melunak, bukan berhenti kaku.
 */
function HitungNaik({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        scope.current?.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          if (!Number.isFinite(target) || target <= 0) return;
          const hitung = { v: 0 };
          gsap.to(hitung, {
            v: target,
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(hitung.v).toLocaleString("id-ID");
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}

export function SejarahChapter({
  about,
  identity,
}: {
  about?: AboutSection;
  identity?: Identity;
}) {
  const sejarah = about?.sejarah ?? [];
  const kutipan = about?.sambutanTeks;
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        /* Inisial besar masuk dengan settle back.out: sedikit menumbung
           lalu duduk di tempatnya, seperti stempel yang ditekan. */
        gsap.from("[data-drop-cap]", {
          scale: 1.24,
          rotation: -3,
          opacity: 0,
          duration: 0.9,
          ease: "back.out(1.4)",
          transformOrigin: "left top",
          scrollTrigger: { trigger: "[data-drop-cap]", start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <Chapter field="foam" nav="light" pad="tall" id="sejarah">
      <Inner>
        <div ref={scope}>
          <Reveal stagger={0.08}>
            <h2 data-reveal-item className="t-head">
              Sejarah sekolah
            </h2>

            <div className="mt-10 grid gap-x-16 gap-y-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                {sejarah.length > 0 ? (
                  sejarah.map((paragraf, urutan) => {
                    const hurufAwal = paragraf.charAt(0);
                    const bermulaHuruf = urutan === 0 && /[A-Za-z]/.test(hurufAwal);
                    return (
                      <p
                        key={paragraf.slice(0, 24)}
                        data-reveal-item
                        className="t-body mb-5 max-w-[62ch]"
                      >
                        {bermulaHuruf ? (
                          <>
                            {/* Inisial editorial: huruf pertama diangkat jadi drop
                                cap. Tetap teks biasa, bukan hiasan, supaya terbaca
                                oleh pembaca layar dan tetap muncul tanpa JavaScript. */}
                            <span
                              data-drop-cap
                              className="float-left -mt-[0.05em] mr-[0.14em] text-[3.3em] leading-[0.82] font-extrabold text-marine"
                            >
                              {hurufAwal}
                            </span>
                            {paragraf.slice(1)}
                          </>
                        ) : (
                          paragraf
                        )}
                      </p>
                    );
                  })
                ) : (
                  <p data-reveal-item className="t-body field-soft max-w-[62ch]">
                    Sejarah sekolah belum diisi. Guru dapat melengkapinya melalui panel admin.
                  </p>
                )}
              </div>

              <div className="lg:col-span-5">
                {kutipan ? (
                  <figure data-reveal-item className="lg:sticky lg:top-28">
                    <blockquote className="t-statement max-w-[26ch] font-serif italic">
                      {kutipan}
                    </blockquote>
                    <figcaption className="t-small field-soft mt-5">
                      {identity?.kepalaSekolah ?? "Agus Solihin"}, Kepala Sekolah
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </Inner>
    </Chapter>
  );
}

export function IdentitasChapter({
  identity,
  contact,
}: {
  identity?: Identity;
  contact?: ContactSection;
}) {
  const id = identity;
  const surel = contact?.email ?? id?.email ?? "smpn3_haurwangi@yahoo.com";
  const surelUrl = `mailto:${surel}?subject=Pertanyaan%20tentang%20SMP%20Negeri%203%20Haurwangi`;
  const alamatLengkap = [
    id?.alamat ?? "Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi",
    id?.kabupaten ?? "Kabupaten Cianjur",
    id?.provinsi ?? "Provinsi Jawa Barat",
    id?.kodePos ?? "43282",
  ].join(", ");

  const baris: Array<[string, React.ReactNode]> = [
    ["Nama sekolah", id?.nama ?? "SMP Negeri 3 Haurwangi"],
    ["NPSN", <span key="npsn" className="tabular-nums">{id?.npsn ?? "20252209"}</span>],
    ["Bentuk & status", `${id?.bentuk ?? "SMP"} · ${id?.status ?? "Negeri"}`],
    ["Akreditasi", `Peringkat ${id?.akreditasi ?? "B"} (${id?.skAkreditasi ?? "SK BAN-SM 2016"})`],
    ["Kurikulum", id?.kurikulum ?? "Kurikulum Merdeka"],
    ["Penyelenggaraan", id?.penyelenggaraan ?? "Sehari Penuh / 5 Hari"],
    ["Berdiri", `${id?.berdiri ?? "26 April 2006"} · SK ${id?.skPendirian ?? "421.3/Kep.71-Ks/2006"}`],
    ["Luas tanah", <span key="luas" className="tabular-nums">{id?.luasTanah ?? "6.138 m²"}</span>],
    ["Kepala sekolah", id?.kepalaSekolah ?? "Agus Solihin"],
    ["Operator sekolah", id?.operator ?? "Risha Agustiansyah"],
    [
      "Surel resmi",
      /* Satu-satunya saluran yang bisa diklik di tabel ini: tekan turun 1px
         (anticipation) sebelum surel terbuka. */
      <a
        key="surel"
        href={surelUrl}
        className="inline-block rounded-md break-words underline decoration-white/40 underline-offset-4 transition-[text-decoration-color,translate] duration-200 hover:decoration-white active:translate-y-px"
      >
        {surel}
      </a>,
    ],
    ["Alamat lengkap", alamatLengkap],
  ];

  return (
    <Chapter field="marine" nav="dark" pad="tall" id="identitas">
      <Inner>
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <h2 data-reveal-item className="t-head">
              Identitas resmi
            </h2>
            <p data-reveal-item className="t-body mt-7 max-w-[38ch]">
              Seluruh angka dan nama di bab ini berasal dari data resmi sekolah dan
              Kemendikdasmen, bukan perkiraan.
            </p>
            <p data-reveal-item className="t-small field-soft mt-5 max-w-[38ch]">
              Nomor telepon belum dipublikasikan pada sumber resmi, jadi tidak dicantumkan.
              Surel adalah saluran resmi yang aktif.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-8" stagger={0.05}>
            <DaftarNilai baris={baris} />
          </Reveal>
        </div>
      </Inner>
    </Chapter>
  );
}

export function VisiMisiChapter({ vision }: { vision?: VisionSection }) {
  const misi = vision?.misi ?? [];
  const tujuan = vision?.tujuan ?? [];

  return (
    <Chapter field="foam" nav="light" pad="tall" id="visi-misi">
      <Inner>
        <Reveal stagger={0.08}>
          <h2 data-reveal-item className="t-head">
            Visi &amp; misi
          </h2>
          <p data-reveal-item className="t-statement mt-10 max-w-[46ch]">
            {vision?.visi ??
              "Terwujudnya peserta didik yang beriman, bertakwa, berilmu, dan berakhlak mulia."}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <Reveal stagger={0.05}>
            <h3 data-reveal-item className="t-body field-soft">
              Misi
            </h3>
            {/* Daftar berurut asli; nomornya jadi penanda badge rounded-md.
               role="list" dipasang eksplisit karena penanda gambar dihapus,
               supaya pembaca layar tetap mengumumkan urutannya. */}
            <ol role="list" className="mt-6 list-none space-y-5">
              {misi.map((butir, urutan) => (
                <li key={butir.slice(0, 24)} data-reveal-item className="t-body flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky t-small font-semibold tabular-nums"
                  >
                    {urutan + 1}
                  </span>
                  <span className="max-w-[58ch]">{butir}</span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal stagger={0.05}>
            <h3 data-reveal-item className="t-body field-soft">
              Tujuan
            </h3>
            <ol role="list" className="mt-6 list-none space-y-5">
              {tujuan.map((butir, urutan) => (
                <li key={butir.slice(0, 24)} data-reveal-item className="t-body flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky t-small font-semibold tabular-nums"
                  >
                    {urutan + 1}
                  </span>
                  <span className="max-w-[58ch]">{butir}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {vision?.motto ? (
          <Reveal className="mt-16">
            <p data-reveal-item className="t-body field-soft">
              Moto sekolah
            </p>
            {/* Motto memakai aksen serif miring: satu dari dua tempat yang
               diizinkan DESIGN.md untuk keluarga huruf ini. */}
            <p data-reveal-item className="t-statement mt-3 max-w-[34ch] font-serif italic">
              {vision.motto}
            </p>
          </Reveal>
        ) : null}

        {vision?.catatan ? (
          <p className="t-small field-soft mt-12 max-w-[70ch]">{vision.catatan}</p>
        ) : null}
      </Inner>
    </Chapter>
  );
}

/** Urutan kelompok mengikuti jabatan pada data, bukan urutan yang dikarang. */
const URUTAN_JABATAN = ["Kepala Sekolah", "Guru", "Operator Sekolah"];

export function GuruRosterChapter({ teachers }: { teachers?: TeachersSection }) {
  const semua = teachers?.items ?? [];
  const statistik = teachers?.statistik ?? [];

  if (semua.length === 0) return null;

  const kelompok = URUTAN_JABATAN.map((jabatan) => ({
    jabatan,
    orang: semua.filter((item) => item.jabatan === jabatan),
  })).filter((grup) => grup.orang.length > 0);

  const sisa = semua.filter((item) => !URUTAN_JABATAN.includes(item.jabatan));
  if (sisa.length > 0) kelompok.push({ jabatan: "Lainnya", orang: sisa });

  return (
    <Chapter field="deep" nav="dark" pad="tall" id="guru-dan-tendik">
      <Inner>
        <Reveal stagger={0.08}>
          <h2 data-reveal-item className="t-head">
            Guru &amp; tenaga kependidikan
          </h2>
          <p data-reveal-item className="t-body field-soft mt-7 max-w-[56ch]">
            Yang terdata lengkap di bawah ini adalah sebagian dari seluruh guru dan tenaga
            kependidikan sekolah. Sisanya belum punya keterangan resmi, jadi tidak ditulis.
          </p>
        </Reveal>

        <HitungNaik>
          <dl className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {statistik.map((item) => (
              <Angka key={item.label} label={item.label} nilai={item.value} />
            ))}
          </dl>
        </HitungNaik>

        <div className="mt-20 space-y-16">
          {kelompok.map((grup) => (
            <Reveal key={grup.jabatan} stagger={0.07}>
              <h3 data-reveal-item className="t-body field-soft">
                {grup.jabatan}
              </h3>
              <ul className="mt-8 grid gap-x-12 gap-y-12 lg:grid-cols-2">
                {grup.orang.map((orang) => (
                  <li
                    key={orang.nama}
                    data-reveal-item
                    className={orang.foto ? "grid gap-6 sm:grid-cols-[8.5rem_1fr]" : ""}
                  >
                    {/* Garis rambut seirama latar gelap bab ini membingkai
                        potret kecil, tanpa menambah bayangan berlapis. */}
                    {orang.foto ? (
                      <div className="group relative aspect-[4/5] w-full max-w-[8.5rem] overflow-hidden rounded-xl bg-abyss outline outline-1 -outline-offset-1 outline-line">
                        <Image
                          src={orang.foto}
                          alt={`${orang.nama}, ${orang.jabatan} SMP Negeri 3 Haurwangi`}
                          fill
                          sizes="8.5rem"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <h4 className="t-statement">{orang.nama}</h4>
                      <p className="t-small field-soft mt-1">
                        {orang.jabatan}
                        {orang.mapel && orang.mapel !== "-" ? ` · ${orang.mapel}` : ""}
                      </p>
                      <p className="t-body mt-4 max-w-[52ch]">{orang.deskripsi}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {teachers?.catatan ? (
          <p className="t-small field-soft mt-16 max-w-[70ch]">{teachers.catatan}</p>
        ) : null}
      </Inner>
    </Chapter>
  );
}

export function SiswaChapter({ students }: { students?: StudentsSection }) {
  const kelas = students?.kelas ?? [];
  const fasilitas = students?.fasilitasBelajar ?? [];

  const angka: Array<[string, string]> = [
    ["Siswa", String(students?.total ?? 382)],
    ["Putra", String(students?.lakiLaki ?? 199)],
    ["Putri", String(students?.perempuan ?? 183)],
    ["Rombongan belajar", String(students?.rombel ?? 12)],
    ["Rata-rata per kelas", String(students?.rasioKelas ?? 32)],
  ];

  return (
    <Chapter field="sky" nav="light" pad="tall" id="siswa-dan-rombel">
      <Inner>
        <Reveal stagger={0.08}>
          <h2 data-reveal-item className="t-head">
            Siswa &amp; rombel
          </h2>
        </Reveal>

        <HitungNaik>
          <dl className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {angka.map(([label, nilai]) => (
              <Angka key={label} label={label} nilai={nilai} />
            ))}
          </dl>
        </HitungNaik>

        {kelas.length > 0 ? (
          <Reveal className="mt-20" stagger={0.04}>
            <h3 data-reveal-item className="t-body field-soft">
              Rombongan belajar
            </h3>
            <ul className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {kelas.map((item) => (
                <li key={item.kelas} data-reveal-item className="flex items-baseline justify-between gap-4">
                  <span className="t-statement">{item.kelas}</span>
                  <span className="t-small field-soft tabular-nums">{item.jumlah} siswa</span>
                </li>
              ))}
            </ul>
            {kelas.every((item) => !item.waliKelas) ? (
              <p className="t-small field-soft mt-6 max-w-[62ch]">
                Nama wali kelas belum tercatat pada berkas sekolah, jadi hanya jumlah siswa
                per rombel yang ditampilkan.
              </p>
            ) : null}
          </Reveal>
        ) : null}

        {fasilitas.length > 0 ? (
          <Reveal className="mt-20" stagger={0.06}>
            <h3 data-reveal-item className="t-body field-soft">
              Fasilitas belajar
            </h3>
            <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {fasilitas.map((item) => (
                <Angka key={item.nama} label={item.nama} nilai={item.jumlah} />
              ))}
            </dl>
          </Reveal>
        ) : null}

        {students?.catatan ? (
          <p className="t-small field-soft mt-20 max-w-[70ch]">{students.catatan}</p>
        ) : null}
      </Inner>
    </Chapter>
  );
}
