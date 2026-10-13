"use client";

import type { HomeStat } from "@/lib/content";

/**
 * Pita statistik — angka besar di atas latar navy,
 * dipisah garis emas; bukan deretan kartu seragam.
 */
export function StatsBand({ stats }: { stats?: HomeStat[] }) {
  const items =
    stats ?? [
      { label: "Siswa Aktif", value: "382", sub: "199 putra · 183 putri" },
      { label: "Guru & Tenaga Pendidik", value: "16", sub: "93,75% bersertifikasi" },
      { label: "Rombongan Belajar", value: "12", sub: "Kelas 7–9" },
      { label: "Luas Lahan", value: "6.138 m²", sub: "Lapang upacara & badminton" },
    ];

  return (
    <section
      id="statistik-sekolah"
      aria-label="Statistik sekolah"
      className="bg-navy text-white border-y border-gold/30"
    >
      <div className="mx-auto max-w-6xl px-4">
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {items.map((s, i) => (
            <div
              key={s.label}
              className={`py-6 md:py-8 px-4 md:px-6 ${i >= 2 ? "border-t border-white/10 lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-white/10 lg:border-l-0" : ""}`}
            >
              <dt className="text-[11px] md:text-xs uppercase font-semibold tracking-wide text-white/60">
                {s.label}
              </dt>
              <dd className="mt-1 text-2xl md:text-3xl font-extrabold text-gold">
                {s.value}
              </dd>
              <dd className="mt-1 text-xs md:text-sm text-white/70">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
