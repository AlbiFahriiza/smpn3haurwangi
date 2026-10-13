"use client";

import Image from "next/image";
import type { TeachersSection } from "@/lib/content";
import { GraduationCap, Info } from "lucide-react";

export function GuruSection({ teachers }: { teachers?: TeachersSection }) {
  if (!teachers) return null;
  const items = teachers.items ?? [];
  const statistik = teachers.statistik ?? [];

  return (
    <section aria-labelledby="guru-title" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2
            id="guru-title"
            className="text-2xl md:text-3xl font-extrabold text-abyss tracking-tight"
          >
            Profil Guru & Staf
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-slate-ink leading-relaxed">
            Guru dan tenaga kependidikan yang mendampingi 382 siswa belajar setiap hari.
          </p>
        </div>

        {statistik.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 rounded-lg border border-line bg-foam divide-line md:divide-x">
            {statistik.map((s, i) => (
              <div
                key={s.label}
                className={`px-4 py-3.5 ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-line md:border-l-0" : ""}`}
              >
                <dt className="text-[11px] font-semibold tracking-wide text-slate-ink">
                  {s.label}
                </dt>
                <dd className="tabular mt-1 text-xl md:text-2xl font-extrabold text-marine">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-x-10 gap-y-0 sm:grid-cols-2">
            {items.map((g) => (
              <li
                key={g.nama}
                className="flex gap-4 py-5 border-b border-line last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
              >
                {g.foto ? (
                  <Image
                    src={g.foto}
                    alt={`Foto ${g.nama}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover ring-1 ring-line shrink-0"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="grid place-items-center w-16 h-16 rounded-lg bg-sky text-abyss text-lg font-extrabold shrink-0"
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
                  <h3 className="font-bold text-abyss leading-snug">{g.nama}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-marine">
                    {g.jabatan}
                    {g.mapel && g.mapel !== "-" && (
                      <span className="text-slate-ink font-normal">
                        {" "}
                        ({g.mapel})
                      </span>
                    )}
                  </p>
                  {g.deskripsi && (
                    <p className="mt-1.5 text-xs text-ink/70 leading-relaxed line-clamp-3">
                      {g.deskripsi}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-line p-10 text-center text-slate-ink">
            <GraduationCap className="mx-auto w-8 h-8 mb-3" aria-hidden />
            <p className="text-sm">Data guru belum tersedia.</p>
          </div>
        )}

        {teachers.catatan && (
          <p className="mt-6 flex items-start gap-2 text-xs text-slate-ink max-w-3xl">
            <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            {teachers.catatan}
          </p>
        )}
      </div>
    </section>
  );
}
