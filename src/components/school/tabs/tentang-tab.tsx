"use client";

import type { SiteContent } from "@/lib/content";
import { BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import { OpenerChapter } from "../chapters/opener-chapter";
import {
  GuruRosterChapter,
  IdentitasChapter,
  SejarahChapter,
  SiswaChapter,
  VisiMisiChapter,
} from "../chapters/tentang-chapters";
import { KontakChapter } from "../chapters/kontak-chapter";

/**
 * Halaman Tentang Sekolah: versi lengkap dari bab profil di beranda. Beranda
 * memberi cuplikan supaya orang tahu sekolah ini apa; halaman ini menampilkan
 * seluruh isi berkas konten apa adanya, termasuk catatan bagian mana yang
 * datanya belum lengkap.
 */
export function TentangTab({ content }: { content: Partial<SiteContent> }) {
  const identity = content.identity;

  const fakta = [
    identity?.npsn ? `NPSN ${identity.npsn}` : null,
    identity?.akreditasi ? `Akreditasi ${identity.akreditasi}` : null,
    identity?.berdiri ? `Berdiri ${identity.berdiri}` : null,
    identity?.kurikulum ?? null,
  ].filter((baris): baris is string => Boolean(baris));

  return (
    <>
      <OpenerChapter
        field={BIDANG_PEMBUKA["/tentang"].field}
        nav={BIDANG_PEMBUKA["/tentang"].ink}
        judul="Tentang sekolah"
        pengantar="Sejarah, identitas resmi, visi & misi, daftar guru dan tenaga kependidikan, serta keadaan siswa SMP Negeri 3 Haurwangi."
        keterangan={
          <p className="t-small field-soft">{fakta.join(" · ")}</p>
        }
        gambar={{
          src: "/images/galeri/apel-sekolah.jpg",
          alt: "Apel pagi siswa di halaman SMP Negeri 3 Haurwangi",
        }}
      />
      <SejarahChapter about={content.about} identity={identity} />
      <IdentitasChapter identity={identity} contact={content.contact} />
      <VisiMisiChapter vision={content.vision} />
      <GuruRosterChapter teachers={content.teachers} />
      <SiswaChapter students={content.students} />
      <KontakChapter contact={content.contact} identity={identity} />
    </>
  );
}
