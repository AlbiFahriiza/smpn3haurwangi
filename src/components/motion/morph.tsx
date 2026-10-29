"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

/* ============================================================================
 * Inti "shared element" situs ini (DESIGN.md Motion v2).
 *
 * Semua morph elemen bersama di seluruh halaman wajib lewat modul ini supaya
 * durasi, easing, dan cara interupsinya satu bahasa — prinsip "Consistency
 * compounds" (ios-animation-design): satu set parameter dipakai di semua
 * tempat, situs terasa utuh.
 *
 * Dua alat utama:
 * 1. flipBetween()  — morph antara DUA elemen berbeda yang sama-sama ada di
 *    dokumen (logo batang -> logo panel menu, thumbnail galeri -> lightbox,
 *    kartu ekskul -> panel detail). Elemen tujuan dianimasikan dari kotak
 *    asal menuju tempatnya sendiri: itulah FLIP (First-Last-Invert-Play).
 * 2. useSharedNode() — kontinuitas elemen yang lepas-pasang dari dokumen
 *    (buka/tutup accordion, pindah halaman): kotak terakhir dicatat saat elemen
 *    lepas, dan saat elemen dengan id sama dipasang lagi ia "tumbuh" dari
 *    kotak itu, bukan muncul dari kosong.
 * ========================================================================== */

/** Kecepatan & easing resmi — jangan tulis angka sendiri di komponen lain. */
export const GERAK = {
  /** Umpan balik mikro (tekan, sorot): pendek, hampir seketika. */
  mikro: 0.18,
  /** Transisi standar (panel, tab, kartu). */
  sedang: 0.4,
  /** Morph elemen bersama (hero/logo/lightbox): satu tarikan penuh. */
  panjang: 0.55,
  /** Settle utama: deselerasi panjang tanpa pantulan, khas tampilan tenang. */
  ease: "expo.out",
  /** Settle sekunder untuk gerak kecil. */
  lembut: "power2.out",
  /** Pantulan kecil khusus gerak yang memang boleh "hidup" (checklist, chip). */
  hidup: "back.out(1.4)",
} as const;

/** Benar kalau pengunjung meminta gerak dikurangkan. */
export function tanpaGerak(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Hook status "reduced motion"; ikut berganti saat pengguna mengubahnya di
 * tengah kunjungan. SSR aman (nilai awal false, diperbaiki di efek).
 */
export function useTanpaGerak(): boolean {
  const [nilai, setNilai] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pasang = () => setNilai(mq.matches);
    pasang();
    mq.addEventListener("change", pasang);
    return () => mq.removeEventListener("change", pasang);
  }, []);
  return nilai;
}

/* ---------------------------------------------------------------- flipBetween */

export interface OpsiFlip {
  /** Durasi morph; default GERAK.panjang. */
  durasi?: number;
  /** Easing; default GERAK.ease. */
  ease?: string;
  /** "seragam": skala x=y (logo, foto) supaya isi tidak terdistorsi.
   *  "bebas": skala x dan y dihitung sendiri (kartu yang rasionya berubah). */
  skala?: "seragam" | "bebas";
  /** Jeda sebelum morph jalan (menunggu penutup/panel siap). */
  jeda?: number;
  /** Callback setelah morph selesai. */
  selesai?: () => void;
}

/**
 * Morph elemen `tujuan` agar terasa keluar dari posisi `asal` (FLIP manual:
 * ukur dua kotak, pasang transform pembalik, animasikan ke identitas).
 * Bisa dicegat di bingkai mana pun — GSAP `overwrite: "auto"` membaca nilai
 * tampilan terkini, jadi morph yang sedang jalan tidak "menabrak dinding"
 * kalau pengguna berubah pikiran di tengahnya (prinsip animasi terputus-kan).
 *
 * Mengembalikan tween (atau null kalau morph dilewati/mustahil), supaya
 * pemanggil bisa membunuhnya saat komponen lepas.
 */
export function flipBetween(
  asal: HTMLElement | null,
  tujuan: HTMLElement | null,
  opsi: OpsiFlip = {},
): gsap.core.Tween | null {
  if (!asal || !tujuan) return null;
  if (tanpaGerak()) {
    gsap.set(tujuan, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
    opsi.selesai?.();
    return null;
  }

  const a = asal.getBoundingClientRect();
  const b = tujuan.getBoundingClientRect();
  // Kotak sama persis: tidak ada yang perlu dimainkan, cukup pastikan bersih.
  if (Math.abs(a.left - b.left) < 0.5 && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.width - b.width) < 0.5) {
    gsap.set(tujuan, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
    opsi.selesai?.();
    return null;
  }

  const skalaX = a.width / b.width;
  const skalaY = a.height / b.height;
  const seragam = (skalaX + skalaY) / 2;
  const sx = opsi.skala === "bebas" ? skalaX : seragam;
  const sy = opsi.skala === "bebas" ? skalaY : seragam;

  // Skala seragam dipusatkan pada titik tengah supaya morph terasa "angkat
  // dan taruh", bukan regang dari sudut. Titik asal 0 0 hanya untuk bebas.
  const transformOrigin = opsi.skala === "bebas" ? "0 0" : "50% 50%";
  // Untuk skala seragam, geser dihitung dari pusat kotak, bukan sudut kiri.
  const pusatAsalX = a.left + a.width / 2;
  const pusatAsalY = a.top + a.height / 2;
  const pusatTujuanX = b.left + b.width / 2;
  const pusatTujuanY = b.top + b.height / 2;
  const dx = pusatAsalX - pusatTujuanX;
  const dy = pusatAsalY - pusatTujuanY;

  return gsap.fromTo(
    tujuan,
    { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin },
    {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: opsi.durasi ?? GERAK.panjang,
      delay: opsi.jeda ?? 0,
      ease: opsi.ease ?? GERAK.ease,
      overwrite: "auto",
      onComplete: opsi.selesai,
    },
  );
}

/* -------------------------------------------------------------- useSharedNode */

type JejakKotak = { rect: DOMRect; ms: number };

/**
 * Jejak elemen bersama berdasarkan id, bertahan antar pemasangan (termasuk
 * pindah rute Next.js). Hanya satu jejak per id; jejak lebih tua dari
 * 2.5 detik dianggap basi dan diabaikan supaya morph tidak "melompat" dari
 * tempat yang sudah tidak relevan.
 */
const jejak = new Map<string, JejakKotak>();
const BASI_MS = 2500;

export interface HasilSharedNode<T extends HTMLElement> {
  /** Ref elemen yang dilacak. */
  ref: React.RefObject<T | null>;
  /** Id sama seperti argumen; untuk kenyamanan pemanggil. */
  id: string;
}

/**
 * Kontinuitas satu elemen lintas lepas-pasang. Saat elemen lepas, kotak
 * terakhirnya dicatat; saat dipasang lagi (di halaman/posisi mana pun),
 * ia dimainkan dari kotak itu menuju posisi barunya — elemen yang "pindah",
 * bukan yang muncul dari kosong.
 *
 * Cocok untuk elemen yang benar-benar sama (logo, panel yang pindah halaman).
 * Untuk dua elemen BERBEDA yang saling mewakili (thumbnail -> lightbox),
 * pakai flipBetween().
 */
export function useSharedNode<T extends HTMLElement>(id: string): HasilSharedNode<T> {
  const ref = useRef<T | null>(null);
  const pasang = useCallback(
    (el: T | null) => {
      ref.current = el;
      if (!el) return;
      const catatan = jejak.get(id);
      const segar = catatan && performance.now() - catatan.ms < BASI_MS;
      if (catatan && segar && !tanpaGerak()) {
        const a = catatan.rect;
        const b = el.getBoundingClientRect();
        const dx = a.left + a.width / 2 - (b.left + b.width / 2);
        const dy = a.top + a.height / 2 - (b.top + b.height / 2);
        gsap.fromTo(
          el,
          { x: dx, y: dy, autoAlpha: 0.6 },
          { x: 0, y: 0, autoAlpha: 1, duration: GERAK.sedang, ease: GERAK.ease, overwrite: "auto" },
        );
      }
    },
    [id],
  );

  // Catat kotak terakhir SEBELUM elemen benar-benar lepas dari dokumen.
  useEffect(() => {
    const el = ref.current;
    if (el) jejak.set(id, { rect: el.getBoundingClientRect(), ms: performance.now() });
    return () => {
      const el2 = ref.current;
      if (el2) jejak.set(id, { rect: el2.getBoundingClientRect(), ms: performance.now() });
    };
  }, [id]);

  return { ref, id };
}
