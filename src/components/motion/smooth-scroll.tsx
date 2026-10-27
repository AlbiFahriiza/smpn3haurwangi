"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    /** Instansi Lenis aktif (null bila gulir halus tidak dinyalakan). Dipakai
     * tombol "kembali ke atas" supaya gulirannya tetap lewat Lenis, bukan
     * bergulat dengan gulir bawaan peramban. */
    __lenis?: Lenis | null;
  }
}

/**
 * Menyatukan Lenis dan ScrollTrigger pada satu jam (ticker GSAP).
 *
 * Gulir halus hanya dinyalakan di perangkat berpenunjuk presisi dengan lebar
 * layar besar dan ketika pengguna tidak meminta gerak minimal. Di ponsel,
 * gulir bawaan browser justru lebih enak dan lebih hemat baterai.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const query = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    let lenis: Lenis | null = null;
    let update: ((time: number) => void) | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ duration: 1.05, wheelMultiplier: 0.9 });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      update = (time: number) => {
        // Ticker GSAP menghitung detik, Lenis mengharapkan milidetik.
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
    };

    const stop = () => {
      if (update) gsap.ticker.remove(update);
      lenis?.destroy();
      lenis = null;
      window.__lenis = null;
      update = null;
      gsap.ticker.lagSmoothing(500, 33);
    };

    if (query.matches) start();

    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) start();
      else stop();
    };
    query.addEventListener("change", onChange);

    // Tinggi halaman berubah setelah gambar dan font selesai dimuat; posisi
    // trigger harus dihitung ulang supaya animasi tidak meleset.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      query.removeEventListener("change", onChange);
      window.removeEventListener("load", refresh);
      stop();
    };
  }, []);

  return <>{children}</>;
}
