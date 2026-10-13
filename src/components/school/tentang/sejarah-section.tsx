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
    <section aria-labelledby="sejarah-title" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Tentang Sekolah
        </p>
        <h1
          id="sejarah-title"
          className="mt-2 text-2xl md:text-4xl font-extrabold text-navy"
        >
          Sejarah & Profil
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-foreground/85">
            {sejarah.length > 0 ? (
              sejarah.map((paragraf, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:text-gold first-letter:text-4xl first-letter:font-extrabold first-letter:float-left first-letter:mr-2 first-letter:leading-[0.9]"
                      : ""
                  }
                >
                  {paragraf}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">
                Profil sekolah belum tersedia. Guru dapat mengisinya melalui panel admin.
              </p>
            )}
            {about?.sambutanTeks && (
              <blockquote className="mt-6 border-l-4 border-gold pl-4 py-1 text-navy font-semibold italic">
                “{about.sambutanTeks}”
              </blockquote>
            )}
          </div>

          {/* Kartu identitas resmi */}
          <aside className="rounded-xl border border-border bg-white shadow-sm self-start">
            <div className="rounded-t-xl bg-navy px-5 py-4 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-gold" aria-hidden />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Identitas Sekolah
              </h2>
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
                  ["Akreditasi", `B — ${id?.skAkreditasi ?? "SK BAN-SM 2016"}`],
                  ["Kurikulum", id?.kurikulum ?? "Kurikulum Merdeka"],
                  ["Kepala Sekolah", id?.kepalaSekolah ?? "Agus Solihin"],
                ].map(([k, v]) => (
                  <TableRow key={k}>
                    <TableHead className="text-muted-foreground font-medium w-[40%] text-xs md:text-sm">
                      {k}
                    </TableHead>
                    <TableCell className="font-semibold text-xs md:text-sm">
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
