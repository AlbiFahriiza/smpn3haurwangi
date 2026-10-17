"use client";

import type { AboutSection, Identity } from "@/lib/content";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeCheck } from "lucide-react";

export function SejarahSection({
  about,
  identity,
}: {
  about?: AboutSection;
  identity?: Identity;
}) {
  const sejarah = about?.sejarah ?? [];
  const id = identity;

  return (
    <section aria-labelledby="sejarah-title" className="bg-foam py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h1
          id="sejarah-title"
          className="text-3xl md:text-4xl font-extrabold text-abyss tracking-tight"
        >
          Sejarah & Profil
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[3fr_2fr]">
          <div className="min-w-0 space-y-5 text-sm md:text-[15px] leading-[1.85] text-ink/90 max-w-[68ch]">
            {sejarah.length > 0 ? (
              sejarah.map((paragraf, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:text-marine first-letter:text-5xl first-letter:font-extrabold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85]"
                      : ""
                  }
                >
                  {paragraf}
                </p>
              ))
            ) : (
              <p className="text-slate-ink">
                Profil sekolah belum tersedia. Guru dapat mengisinya melalui panel admin.
              </p>
            )}
            {about?.sambutanTeks && (
              <blockquote className="mt-7 border-l-[3px] border-marine pl-5 py-1 font-serif italic text-lg text-abyss leading-relaxed">
                {about.sambutanTeks}
              </blockquote>
            )}
          </div>

          {/* Kartu identitas resmi */}
          <aside className="min-w-0 rounded-lg border border-line bg-white self-start shadow-[0_14px_36px_-24px_oklch(0.298_0.076_252.5/0.3)]">
            <div className="rounded-t-lg bg-abyss px-5 py-4 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-white" aria-hidden />
              <h2 className="text-sm font-bold text-white">Identitas Sekolah</h2>
            </div>
            <Table>
              <TableBody>
                {[
                  ["Nama", id?.nama ?? "SMP Negeri 3 Haurwangi"],
                  ["NPSN", id?.npsn ?? "20252209"],
                  ["Status", id?.status ?? "Negeri"],
                  ["Alamat", id?.alamat ?? "Jalan Buniayu, Desa Kertamukti"],
                  ["Kabupaten", id?.kabupaten ?? "Kabupaten Cianjur"],
                  ["Kode Pos", id?.kodePos ?? "43282"],
                  ["Berdiri", id?.berdiri ?? "26 April 2006"],
                  ["SK Pendirian", id?.skPendirian ?? "421.3/Kep.71-Ks/2006"],
                  ["Akreditasi", `B, ${id?.skAkreditasi ?? "SK BAN-SM 2016"}`],
                  ["Kurikulum", id?.kurikulum ?? "Kurikulum Merdeka"],
                  ["Kepala Sekolah", id?.kepalaSekolah ?? "Agus Solihin"],
                ].map(([k, v]) => (
                  <TableRow key={k}>
                    <TableHead className="text-slate-ink font-medium w-[40%] text-xs md:text-sm">
                      {k}
                    </TableHead>
                    <TableCell className="font-semibold text-xs md:text-sm text-abyss">
                      {v}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </aside>
        </div>
      </div>
    </section>
  );
}
