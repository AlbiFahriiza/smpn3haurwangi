"use client";

import type { SiteContent } from "@/lib/content";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { OpenerChapter } from "../chapters/opener-chapter";
import { EkskulDaftarChapter } from "../chapters/ekskul-detail-chapter";
import { KontakChapter } from "../chapters/kontak-chapter";

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
          <p className="t-small field-soft">
            {jumlah > 0 ? `${jumlah} kegiatan` : "Kegiatan"} · berjalan di luar jam pelajaran
            · Pramuka wajib bagi seluruh siswa
          </p>
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
