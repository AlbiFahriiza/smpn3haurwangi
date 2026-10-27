"use client";

import type { SiteContent } from "@/lib/content";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { OpenerChapter } from "../chapters/opener-chapter";
import { EkskulDaftarChapter } from "../chapters/ekskul-detail-chapter";
import { KontakChapter } from "../chapters/kontak-chapter";

/** Chip meta kecil bergaris rambut, dipakai baris keterangan pembuka. */
const CHIP_META =
  "t-small inline-flex items-center rounded-md px-3 py-1.5 font-semibold outline outline-1 -outline-offset-1 outline-white/30 text-white/85";

/**
 * Halaman Ekstrakurikuler: pita nama yang sama seperti di beranda, lalu daftar
 * lengkap tiap kegiatan beserta jadwal dan keterangannya.
 */
export function EkskulTab({ content }: { content: Partial<SiteContent> }) {
  const items = content.ekskul?.items ?? [];
  const jumlah = items.length;

  return (
    <>
      <OpenerChapter
        field={BIDANG_PEMBUKA["/ekstrakurikuler"].field}
        nav={BIDANG_PEMBUKA["/ekstrakurikuler"].ink}
        judul="Ekstrakurikuler"
        pengantar={
          content.ekskul?.description ??
          "Kegiatan ekstrakurikuler wajib dan pilihan yang menyalurkan bakat, minat, dan karakter siswa."
        }
        keterangan={
          <div className="flex flex-wrap gap-2">
            <span className={CHIP_META}>
              {jumlah > 0 ? `${jumlah} kegiatan` : "Kegiatan"}
            </span>
            <span className={CHIP_META}>Di luar jam pelajaran</span>
            <span className={CHIP_META}>Pramuka wajib bagi seluruh siswa</span>
          </div>
        }
        gambar={{
          src: "/images/galeri/pentas-seni-2.jpg",
          alt: "Panggung pentas seni siswa SMP Negeri 3 Haurwangi",
        }}
      />
      <EkskulDaftarChapter ekskul={content.ekskul} />
      <KontakChapter contact={content.contact} identity={content.identity} />
    </>
  );
}
