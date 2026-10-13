"use client";

import Image from "next/image";
import type { HomeSection, Identity } from "@/lib/content";
import { Quote } from "lucide-react";

export function SambutanSection({
  sambutan,
  identity,
}: {
  sambutan?: HomeSection["sambutan"];
  identity?: Identity;
}) {
  const nama = sambutan?.nama ?? identity?.kepalaSekolah ?? "Agus Solihin";
  const jabatan =
    sambutan?.jabatan ?? `Kepala ${identity?.nama ?? "SMP Negeri 3 Haurwangi"}`;
  const teks = sambutan?.teks ?? [];

  if (teks.length === 0) return null;

  return (
    <section aria-labelledby="sambutan-title" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-14">
          <div className="md:sticky md:top-32 self-start">
            <Quote className="w-9 h-9 text-marine" aria-hidden strokeWidth={1.5} />
            <h2
              id="sambutan-title"
              className="mt-3 text-xl md:text-2xl font-extrabold text-abyss tracking-tight"
            >
              {sambutan?.title ?? "Sambutan Kepala Sekolah"}
            </h2>
            <div className="mt-6 flex items-center gap-3">
              {sambutan?.foto ? (
                <Image
                  src={sambutan.foto}
                  alt={`Foto ${nama}`}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-sky"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid place-items-center w-14 h-14 rounded-full bg-sky text-abyss font-extrabold text-lg ring-2 ring-white"
                >
                  {nama
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
              )}
              <div>
                <p className="font-bold text-abyss text-sm">{nama}</p>
                <p className="text-xs text-slate-ink">{jabatan}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 text-sm md:text-[15px] leading-[1.85] text-ink/90 max-w-3xl">
            {teks.map((paragraf, i) =>
              i === 0 ? (
                <p key={i}>
                  <span className="font-serif italic text-lg md:text-xl text-abyss">
                    {paragraf}
                  </span>
                </p>
              ) : (
                <p key={i}>{paragraf}</p>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
