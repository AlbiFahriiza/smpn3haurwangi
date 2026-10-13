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
    <section aria-labelledby="sambutan-title" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-12">
          <div className="md:sticky md:top-28 self-start">
            <Quote
              className="w-10 h-10 text-gold"
              aria-hidden
              strokeWidth={1.5}
            />
            <h2
              id="sambutan-title"
              className="mt-3 text-xl md:text-2xl font-extrabold text-navy"
            >
              {sambutan?.title ?? "Sambutan Kepala Sekolah"}
            </h2>
            <div className="mt-5 flex items-center gap-3">
              {sambutan?.foto ? (
                <Image
                  src={sambutan.foto}
                  alt={`Foto ${nama}`}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gold"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid place-items-center w-14 h-14 rounded-full bg-secondary text-navy font-extrabold text-lg border-2 border-gold"
                >
                  {nama
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
              )}
              <div>
                <p className="font-bold text-navy text-sm">{nama}</p>
                <p className="text-xs text-muted-foreground">{jabatan}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-foreground/85 max-w-3xl">
            {teks.map((paragraf, i) => (
              <p key={i} className={i === 0 ? "first-letter:text-gold first-letter:text-4xl first-letter:font-extrabold first-letter:float-left first-letter:mr-2 first-letter:leading-[0.9]" : ""}>
                {paragraf}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
