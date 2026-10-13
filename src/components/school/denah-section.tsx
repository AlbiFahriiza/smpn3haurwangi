"use client";

import { useState } from "react";
import Image from "next/image";
import type { DenahSection as DenahData } from "@/lib/content";
import { MapPin, Compass, Dumbbell, Trophy, Construction, Check } from "lucide-react";

const FASILITAS_ICONS: Record<string, typeof Trophy> = {
  lapangan: Trophy,
  voli: Trophy,
  upacara: Trophy,
  badminton: Dumbbell,
  lahan: Construction,
};

export function DenahSection({ denah }: { denah?: DenahData }) {
  const [aktif, setAktif] = useState<string | null>(null);
  if (!denah) return null;

  const keterangan = denah.keterangan ?? [];
  const fasilitas = denah.fasilitas ?? [];
  const terpilih = keterangan.find((k) => k.kode === aktif);

  return (
    <section
      aria-labelledby="denah-title"
      className="py-14 md:py-20 bg-sky/40 border-y border-line/60"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2
            id="denah-title"
            className="text-2xl md:text-3xl font-extrabold text-abyss tracking-tight"
          >
            {denah.title ?? "Denah Sekolah"}
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-slate-ink leading-relaxed">
            {denah.description}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[3fr_2fr] items-start">
          <figure className="rounded-lg overflow-hidden border border-line bg-white shadow-[0_14px_36px_-20px_oklch(0.298_0.076_252.5/0.35)]">
            <Image
              src={denah.image || "/images/denah-sekolah.jpg"}
              alt="Denah lokasi (site plan) SMP Negeri 3 Haurwangi beserta penempatan ruangan"
              width={1600}
              height={1200}
              className="w-full h-auto"
              sizes="(min-width: 1024px) 640px, 100vw"
            />
            <figcaption className="flex items-center gap-2 px-4 py-3 text-xs text-slate-ink border-t border-line">
              <Compass className="w-4 h-4 text-marine shrink-0" aria-hidden />
              <span>
                Site plan resmi SMP Negeri 3 Haurwangi, arah utara mengikuti
                penanda pada denah.
              </span>
            </figcaption>
            <div
              aria-live="polite"
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-t transition-colors ${
                terpilih
                  ? "bg-marine text-white border-marine"
                  : "bg-foam text-slate-ink border-line"
              }`}
            >
              {terpilih ? (
                <>
                  <Check className="w-4 h-4 shrink-0" aria-hidden />
                  Ruang {terpilih.kode}: {terpilih.nama}
                </>
              ) : (
                "Pilih kode ruang pada daftar untuk melihat namanya di sini."
              )}
            </div>
          </figure>

          <div>
            <h3 className="text-sm font-bold text-abyss">Keterangan Ruang</h3>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {keterangan.map((k) => {
                const active = aktif === k.kode;
                return (
                  <li key={k.kode}>
                    <button
                      onMouseEnter={() => setAktif(k.kode)}
                      onFocus={() => setAktif(k.kode)}
                      onMouseLeave={() => setAktif(null)}
                      onBlur={() => setAktif(null)}
                      onClick={() => setAktif(k.kode)}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-marine ${
                        active
                          ? "bg-marine text-white"
                          : "bg-white text-ink/85 hover:bg-sky/70 border border-line"
                      }`}
                      aria-label={`Ruang ${k.kode}: ${k.nama}`}
                      aria-pressed={active}
                    >
                      <span
                        className={`grid place-items-center w-7 h-7 rounded-md text-xs font-extrabold shrink-0 ${
                          active ? "bg-white text-marine" : "bg-abyss text-white"
                        }`}
                      >
                        {k.kode}
                      </span>
                      <span className="font-medium">{k.nama}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {fasilitas.length > 0 && (
              <>
                <h3 className="mt-7 text-sm font-bold text-abyss">Area Terbuka</h3>
                <ul className="mt-3 space-y-2">
                  {fasilitas.map((f) => {
                    const key = f.nama.toLowerCase();
                    const Icon =
                      FASILITAS_ICONS[
                        Object.keys(FASILITAS_ICONS).find((k) => key.includes(k)) ?? ""
                      ] ?? MapPin;
                    return (
                      <li
                        key={f.nama}
                        className="flex items-start gap-3 rounded-lg bg-white border border-line px-3 py-2.5"
                      >
                        <Icon className="w-4 h-4 mt-0.5 text-marine shrink-0" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-abyss">{f.nama}</p>
                          <p className="text-xs text-slate-ink">{f.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
