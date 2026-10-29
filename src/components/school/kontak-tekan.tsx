"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Benar kalau pengunjung meminta gerak dikurangkan; umpan balik tekan dilewati. */
function tanpaGerak(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export type PenanganTekan = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  onKeyUp: (event: React.KeyboardEvent<HTMLElement>) => void;
};

/**
 * Umpan balik tekan ala iOS: elemen memberi reaksi seketika saat pointer
 * menyentuhnya (kejadian pointer-down, bukan menunggu klik), turun 1px dan
 * mengecil sedikit, lalu kembali dengan pegas kecil saat dilepas. Papan ketik
 * mendapat reaksi yang sama lewat Enter dan Spasi supaya pengguna fokus
 * melihat umpan balik yang sama dengan pengguna pointer.
 *
 * Mode "halus" untuk tautan di dalam kalimat: skala tidak berlaku pada elemen
 * inline, jadi cukup meredup sekejap seperti sorot sentuhan di iOS.
 */
export function useTekan(mode: "padat" | "halus" = "padat"): PenanganTekan {
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const ditekanRef = useRef(false);

  // Tween yang masih berjalan dicabut bila komponen lepas dari halaman.
  useEffect(
    () => () => {
      tweenRef.current?.kill();
    },
    [],
  );

  const tekan = (elemen: HTMLElement) => {
    if (tanpaGerak()) return;
    ditekanRef.current = true;
    tweenRef.current?.kill();
    tweenRef.current =
      mode === "padat"
        ? gsap.to(elemen, {
            scale: 0.97,
            y: 1,
            duration: 0.1,
            ease: "power2.out",
            overwrite: "auto",
          })
        : gsap.to(elemen, {
            opacity: 0.6,
            duration: 0.08,
            ease: "power2.out",
            overwrite: "auto",
          });
  };

  const lepas = (elemen: HTMLElement) => {
    if (!ditekanRef.current) return;
    ditekanRef.current = false;
    tweenRef.current?.kill();
    tweenRef.current =
      mode === "padat"
        ? gsap.to(elemen, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "back.out(1.4)",
            overwrite: "auto",
          })
        : gsap.to(elemen, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto",
          });
  };

  return {
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      tekan(event.currentTarget);
    },
    onPointerUp: (event) => lepas(event.currentTarget),
    onPointerCancel: (event) => lepas(event.currentTarget),
    onPointerLeave: (event) => lepas(event.currentTarget),
    onKeyDown: (event) => {
      if (event.repeat) return;
      if (event.key === "Enter" || event.key === " ") tekan(event.currentTarget);
    },
    onKeyUp: (event) => {
      if (event.key === "Enter" || event.key === " ") lepas(event.currentTarget);
    },
  };
}
