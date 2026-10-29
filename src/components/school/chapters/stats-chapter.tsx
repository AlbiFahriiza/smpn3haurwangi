"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { HomeStat } from "@/lib/content";
import { GERAK } from "@/components/motion/morph";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

const FALLBACK: HomeStat[] = [
  { label: "Siswa aktif", value: "382", sub: "199 putra, 183 putri" },
  { label: "Guru & tenaga kependidikan", value: "16", sub: "93,75% bersertifikasi" },
  { label: "Rombongan belajar", value: "12", sub: "Kelas 7 sampai 9" },
];

/** Angka murni (tanpa satuan/koma) bisa dihitung naik; selain itu ditampilkan apa adanya. */
function angkaMurni(nilai: string): number | null {
  return /^\d+$/.test(nilai.trim()) ? Number(nilai) : null;
}

function Tile({
  stat,
  tint,
  className = "",
}: {
  stat: HomeStat;
  tint: string;
  className?: string;
}) {
  const hitung = angkaMurni(stat.value);
  return (
    <div
      data-reveal-item
      className={`flex flex-col justify-center gap-3 p-7 md:justify-between md:gap-0 md:p-8 ${tint} ${className}`}
    >
      {/* Angka berangkat dari balik tepi bawah topengnya (roll digit) sambil
          dihitung naik; angka resminya tetap tercetak di dokumen apa adanya. */}
      <p className="t-hero tabular-nums">
        <span className="block overflow-hidden pb-[0.06em]">
          <span data-digit-roll data-count={hitung ?? undefined} className="block">
            {stat.value}
          </span>
        </span>
      </p>
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
 * Angkanya dihitung naik saat masuk layan (hanya bila pengguna mengizinkan gerak).
 */
export function StatsChapter({ stats }: { stats?: HomeStat[] }) {
  const scope = useRef<HTMLDivElement>(null);
  const items = (stats && stats.length >= 3 ? stats : FALLBACK).slice(0, 3);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        scope.current?.querySelectorAll<HTMLElement>("[data-digit-roll]").forEach((el) => {
          // Roll digit: angka terangkat dari balik topengnya sendiri, satu
          // tarikan panjang, sekali saja saat masuk layar.
          gsap.from(el, {
            yPercent: 112,
            duration: GERAK.panjang,
            ease: GERAK.ease,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });

          const target = Number(el.dataset.count);
          if (!Number.isFinite(target) || target <= 0) return;
          const hitung = { v: 0 };
          gsap.to(hitung, {
            v: target,
            duration: 1.2,
            ease: GERAK.ease,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(hitung.v).toLocaleString("id-ID");
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <Chapter field="deep" nav="dark" pad="tall" id="statistik-sekolah">
      <div ref={scope}>
      <Inner>
        {/* Stagger 0,08 detik: petak kedua mulai saat petak pertama baru
            sebagian jalan, jadi masuknya menumpang, tidak bergiliran penuh. */}
        <Reveal y={44} stagger={0.08} start="top 86%">
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
      </div>
    </Chapter>
  );
}
