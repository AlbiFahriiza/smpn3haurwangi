"use client";

import { useState } from "react";
import Image from "next/image";
import type { DenahSection as DenahData } from "@/lib/content";
import { MapPin, Compass, Dumbbell, Trophy, Construction } from "lucide-react";

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

  return (
    <section
      aria-labelledby="denah-title"
      className="py-14 md:py-20 bg-secondary/50 border-y border-border"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Tata Letak Sekolah
          </p>
          <h2
            id="denah-title"
            className="mt-2 text-2xl md:text-3xl font-extrabold text-navy"
          >
            {denah.title ?? "Denah Sekolah"}
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-foreground/75 leading-relaxed">
            {denah.description}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr] items-start">
          <figure className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
            <Image
              src={denah.image || "/images/denah-sekolah.jpg"}
              alt="Denah lokasi (site plan) SMP Negeri 3 Haurwangi beserta penempatan ruangan"
              width={1600}
              height={1200}
              className="w-full h-auto"
              sizes="(min-width: 1024px) 640px, 100vw"
            />
            <figcaption className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground border-t border-border">
              <Compass className="w-4 h-4 text-primary" aria-hidden />
              Site plan resmi SMP Negeri 3 Haurwangi — arah utara mengikuti penanda pada denah.
            </figcaption>
          </figure>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-navy">
              Keterangan Ruang
            </h3>
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
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white text-foreground/80 hover:bg-secondary border border-border"
                      }`}
                      aria-label={`Ruang ${k.kode}: ${k.nama}`}
                    >
                      <span
                        className={`grid place-items-center w-7 h-7 rounded-full text-xs font-extrabold shrink-0 ${
                          active ? "bg-gold text-navy" : "bg-navy text-gold"
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
                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-navy">
                  Area Terbuka
                </h3>
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
                        className="flex items-start gap-3 rounded-lg bg-white border border-border px-3 py-2.5"
                      >
                        <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-navy">{f.nama}</p>
                          <p className="text-xs text-muted-foreground">{f.detail}</p>
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
