"use client";

import Image from "next/image";
import type { Field, NavTheme } from "@/components/motion/chapter-theme";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

/**
 * Pembuka halaman selain beranda: satu bidang warna datar, judul besar, satu
 * paragraf pengantar, lalu satu foto sekolah selebar halaman. Bentuknya sama
 * dengan bab pembuka beranda — judul yang memimpin, bukan kartu — dan fotonya
 * memberi layar pertama satu hal yang benar-benar milik sekolah ini.
 */
export function OpenerChapter({
  id,
  field,
  nav,
  judul,
  pengantar,
  keterangan,
  gambar,
  pad = "tall",
  children,
}: {
  id?: string;
  field: Field;
  nav: NavTheme;
  judul: string;
  pengantar?: string;
  keterangan?: React.ReactNode;
  gambar?: { src: string; alt: string };
  pad?: "tight" | "normal" | "tall";
  children?: React.ReactNode;
}) {
  return (
    <Chapter id={id} field={field} nav={nav} pad={pad}>
      <Inner>
        <Reveal stagger={0.09}>
          <h1 data-reveal-item className="t-head max-w-[20ch]">
            {judul}
          </h1>
          {pengantar ? (
            <p data-reveal-item className="t-body field-soft mt-7 max-w-[62ch]">
              {pengantar}
            </p>
          ) : null}
          {keterangan ? (
            <div data-reveal-item className="mt-8 max-w-[62ch]">
              {keterangan}
            </div>
          ) : null}
        </Reveal>
        {children}
      </Inner>

      {gambar ? (
        <div className="relative mt-14 aspect-[4/3] w-full overflow-hidden bg-abyss md:mt-20 md:aspect-[2/1]">
          <Image
            src={gambar.src}
            alt={gambar.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </Chapter>
  );
}
