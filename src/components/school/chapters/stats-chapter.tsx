"use client";

import type { HomeStat } from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const FALLBACK: HomeStat[] = [
  { label: "Siswa aktif", value: "382", sub: "199 putra, 183 putri" },
  { label: "Guru & tenaga kependidikan", value: "16", sub: "93,75% bersertifikasi" },
  { label: "Rombongan belajar", value: "12", sub: "Kelas 7 sampai 9" },
];

function Tile({
  stat,
  tint,
  className = "",
}: {
  stat: HomeStat;
  tint: string;
  className?: string;
}) {
  return (
    <div
      data-reveal-item
      className={`flex flex-col justify-center gap-3 p-7 md:justify-between md:gap-0 md:p-8 ${tint} ${className}`}
    >
      <p className="t-hero tabular-nums">{stat.value}</p>
      <p className="t-small">
        <span className="block font-semibold">{stat.label}</span>
        <span className="field-soft block">{stat.sub}</span>
      </p>
    </div>
  );
}

/**
 * Bab statistik: tiga petak berundak dengan tinggi berbeda, bukan deretan kartu
 * seragam. Satu petak memakai warna aksen penuh, dua lainnya menaik satu nada.
 */
export function StatsChapter({ stats }: { stats?: HomeStat[] }) {
  const items = (stats && stats.length >= 3 ? stats : FALLBACK).slice(0, 3);

  return (
    <Chapter field="deep" nav="dark" pad="tall" id="statistik-sekolah">
      <Inner>
        <Reveal y={44} stagger={0.12} start="top 86%">
          <div className="grid gap-2 md:grid-cols-12">
            <h2
              data-reveal-item
              className="t-head order-first mb-6 md:order-none md:col-span-6 md:col-start-7 md:row-start-1 md:mb-8 md:mt-[14vh]"
            >
              Sekolah dalam angka
            </h2>

            <div className="md:col-span-6 md:col-start-1 md:row-span-2 md:row-start-1">
              <Tile
                stat={items[0]}
                tint="bg-marine text-white"
                className="min-h-[38vh] md:h-full md:min-h-[70vh]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 md:col-span-6 md:col-start-7 md:row-start-2">
              <Tile
                stat={items[1]}
                tint="bg-ink text-white"
                className="min-h-[26vh] md:min-h-[44vh]"
              />
              <Tile
                stat={items[2]}
                tint="bg-abyss text-white"
                className="min-h-[20vh] md:mt-[12vh] md:min-h-[34vh]"
              />
            </div>
          </div>
        </Reveal>
      </Inner>
    </Chapter>
  );
}
