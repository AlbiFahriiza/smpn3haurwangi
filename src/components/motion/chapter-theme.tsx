"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Tinta yang dipakai navigasi: "light" untuk bab terang, "dark" untuk bab gelap. */
export type NavTheme = "light" | "dark";

/** Bidang warna bab; sama dengan atribut data-field pada tiap bab. */
export type Field = "foam" | "sky" | "marine" | "ink" | "abyss" | "deep";

type ChapterThemeValue = {
  ink: NavTheme;
  field: Field;
  setChapter: (ink: NavTheme, field: Field) => void;
};

const ChapterThemeContext = createContext<ChapterThemeValue>({
  ink: "light",
  field: "foam",
  setChapter: () => {},
});

export function useChapterTheme() {
  return useContext(ChapterThemeContext);
}

export function ChapterThemeProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  /**
   * Warna bab pembuka halaman. Dipasang sebagai keadaan awal (ikut dirender di
   * server) supaya batang navigasi tidak pernah tampil dengan warna bidang yang
   * salah sebelum JavaScript berjalan.
   */
  initial?: { ink?: NavTheme; field?: Field };
}) {
  const [ink, setInk] = useState<NavTheme>(initial?.ink ?? "light");
  const [field, setField] = useState<Field>(initial?.field ?? "foam");

  // Identitas fungsi harus tetap supaya efek di watcher tidak dibuat ulang
  // setiap kali warna bab berganti.
  const setChapter = useCallback((nextInk: NavTheme, nextField: Field) => {
    setInk(nextInk);
    setField(nextField);
  }, []);

  const value = useMemo<ChapterThemeValue>(
    () => ({ ink, field, setChapter }),
    [ink, field, setChapter],
  );

  return <ChapterThemeContext.Provider value={value}>{children}</ChapterThemeContext.Provider>;
}

function readChapter(element: HTMLElement): { ink: NavTheme; field: Field } {
  return {
    ink: (element.dataset.nav as NavTheme) ?? "light",
    field: (element.dataset.field as Field) ?? "foam",
  };
}

/**
 * Membaca bab mana yang sedang melewati garis navigasi, lalu memberi tahu
 * navigasi warna bidang dan warna tinta yang harus dipakainya. Inilah gerak
 * "warna per bab": begitu bidang berikutnya lewat di bawah navigasi, warnanya
 * berpindah.
 */
export function ChapterThemeWatcher() {
  const { setChapter } = useChapterTheme();
  const pathname = usePathname();

  useEffect(() => {
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));

    if (chapters.length === 0) {
      setChapter("light", "foam");
      return;
    }

    const first = readChapter(chapters[0]);
    setChapter(first.ink, first.field);

    const triggers = chapters.map((element) => {
      const own = readChapter(element);
      return ScrollTrigger.create({
        trigger: element,
        start: "top 56px",
        end: "bottom 56px",
        onToggle: (self) => {
          if (self.isActive) setChapter(own.ink, own.field);
        },
      });
    });

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [pathname, setChapter]);

  return null;
}
