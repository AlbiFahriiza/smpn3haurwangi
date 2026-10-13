"use client";

import type { StudentsSection } from "@/lib/content";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Info, BookOpen } from "lucide-react";

export function SiswaSection({ students }: { students?: StudentsSection }) {
  if (!students) return null;

  const total = students.total ?? 0;
  const lakiLaki = students.lakiLaki ?? 0;
  const perempuan = students.perempuan ?? 0;
  const pctL = total > 0 ? Math.round((lakiLaki / total) * 100) : 0;
  const pctP = total > 0 ? Math.round((perempuan / total) * 100) : 0;
  const kelas = students.kelas ?? [];
  const fasilitas = students.fasilitasBelajar ?? [];

  return (
    <section
      aria-labelledby="siswa-title"
      className="py-14 md:py-20 bg-secondary/50 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Peserta Didik
          </p>
          <h2
            id="siswa-title"
            className="mt-2 text-2xl md:text-3xl font-extrabold text-navy"
          >
            Profil Siswa
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-foreground/75 leading-relaxed">
            Data siswa aktif semester 2026/2027 Gasal — {total} siswa dalam{" "}
            {students.rombel ?? 0} rombongan belajar (rasio {students.rasioKelas ?? 0}{" "}
            siswa per kelas).
          </p>
        </div>

        {/* Komposisi gender — bar proporsi, bukan pie chart generik. */}
        <div className="mt-8 max-w-2xl">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-navy">
              {lakiLaki} siswa putra ({pctL}%)
            </span>
            <span className="text-primary">
              {perempuan} siswa putri ({pctP}%)
            </span>
          </div>
          <div
            className="mt-2 h-4 rounded-full overflow-hidden flex"
            role="img"
            aria-label={`Proporsi siswa: ${pctL}% putra, ${pctP}% putri`}
          >
            <span className="bg-navy" style={{ width: `${pctL}%` }} />
            <span className="bg-primary" style={{ width: `${pctP}%` }} />
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[3fr_2fr] items-start">
          {/* Tabel rombongan belajar */}
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" aria-hidden />
              <h3 className="text-sm font-bold text-navy uppercase tracking-wide">
                Rombongan Belajar
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Kelas</TableHead>
                  <TableHead>Jumlah Siswa</TableHead>
                  <TableHead className="hidden sm:table-cell">Wali Kelas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kelas.length > 0 ? (
                  kelas.map((k) => (
                    <TableRow key={k.kelas}>
                      <TableCell className="font-extrabold text-navy">
                        {k.kelas}
                      </TableCell>
                      <TableCell>{k.jumlah} siswa</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {k.waliKelas || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Data rombel belum diisi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Fasilitas belajar */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" aria-hidden />
              <h3 className="text-sm font-bold text-navy uppercase tracking-wide">
                Fasilitas Belajar
              </h3>
            </div>
            <ul className="mt-4 space-y-3">
              {fasilitas.map((f) => (
                <li
                  key={f.nama}
                  className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2.5 last:pb-0"
                >
                  <span className="text-foreground/80">{f.nama}</span>
                  <span className="font-bold text-navy">{f.jumlah}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {students.catatan && (
          <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground max-w-3xl">
            <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            {students.catatan}
          </p>
        )}
      </div>
    </section>
  );
}
