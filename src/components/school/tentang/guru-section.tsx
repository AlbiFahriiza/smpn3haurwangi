"use client";

import Image from "next/image";
import type { TeachersSection } from "@/lib/content";
import { GraduationCap, Info } from "lucide-react";

export function GuruSection({ teachers }: { teachers?: TeachersSection }) {
  if (!teachers) return null;
  const items = teachers.items ?? [];
  const statistik = teachers.statistik ?? [];

  return (
    <section
      aria-labelledby="guru-title"
      className="py-14 md:py-20 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Tenaga Pendidik
          </p>
          <h2
            id="guru-title"
            className="mt-2 text-2xl md:text-3xl font-extrabold text-navy"
          >
            Profil Guru & Staf
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-foreground/75 leading-relaxed">
            Guru dan tenaga kependidikan yang mendampingi 382 siswa belajar setiap hari.
          </p>
        </div>

        {statistik.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {statistik.map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-secondary px-4 py-3.5 border border-border"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="mt-1 text-xl md:text-2xl font-extrabold text-navy">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g) => (
              <li key={g.nama}>
                <article className="h-full rounded-xl border border-border bg-white p-5 flex gap-4 hover:border-primary/40 transition-colors">
                  {g.foto ? (
                    <Image
                      src={g.foto}
                      alt={`Foto ${g.nama}`}
                      width={76}
                      height={76}
                      className="w-[76px] h-[76px] rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid place-items-center w-[76px] h-[76px] rounded-lg bg-navy text-gold text-xl font-extrabold shrink-0"
                    >
                      {g.nama
                        .replace(/,.*$/, "")
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy leading-snug">{g.nama}</h3>
                    <p className="mt-0.5 text-xs font-semibold text-primary">
                      {g.jabatan}
                      {g.mapel && g.mapel !== "—" && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · {g.mapel}
                        </span>
                      )}
                    </p>
                    {g.deskripsi && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {g.deskripsi}
                      </p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <GraduationCap className="mx-auto w-8 h-8 mb-3" aria-hidden />
            <p className="text-sm">Data guru belum tersedia.</p>
          </div>
        )}

        {teachers.catatan && (
          <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground max-w-3xl">
            <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            {teachers.catatan}
          </p>
        )}
      </div>
    </section>
  );
}
