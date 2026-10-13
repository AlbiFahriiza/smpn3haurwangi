"use client";

import type { HomeStat } from "@/lib/content";

/**
 * Pita statistik, angka tabular besar putih di atas abyss,
 * dipisah garis tipis; bukan deretan kartu seragam.
 */
export function StatsBand({ stats }: { stats?: HomeStat[] }) {
  const items =
    stats ?? [
      { label: "Siswa Aktif", value: "382", sub: "199 putra, 183 putri" },
      { label: "Guru & Tenaga Pendidik", value: "16", sub: "93,75% bersertifikasi" },
      { label: "Rombongan Belajar", value: "12", sub: "Kelas 7-9" },
      { label: "Luas Lahan", value: "6.138 m²", sub: "Lapang upacara & badminton" },
    ];

  return (
    <section
      id="statistik-sekolah"
      aria-label="Statistik sekolah"
      className="bg-abyss text-white"
    >
      <div className="mx-auto max-w-6xl px-4">
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-white/10 lg:divide-x">
          {items.map((s, i) => (
            <div
              key={s.label}
              className={`py-6 md:py-9 px-4 md:px-6 ${i >= 2 ? "border-t border-white/10 lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-white/10 lg:border-l-0" : ""}`}
            >
              <dt className="text-[11px] md:text-xs font-semibold tracking-wide text-white/75">
                {s.label}
              </dt>
              <dd className="tabular mt-1.5 text-2xl md:text-3xl font-extrabold text-white">
                {s.value}
              </dd>
              <dd className="mt-1 text-xs md:text-sm text-white/85">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
