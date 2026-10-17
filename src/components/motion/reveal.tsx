"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Nilai awal animasi sengaja dipasang GSAP, bukan CSS: kalau JavaScript gagal
 * atau diblokir, seluruh isi halaman tetap terlihat utuh tanpa transisi.
 */
const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/**
 * Memunculkan isi saat masuk layar. Semua anak bertanda `data-reveal-item`
 * dianimasikan berurutan supaya geraknya satu tarikan, bukan satu-satu.
 */
export function Reveal({
  children,
  className,
  y = 28,
  stagger = 0.08,
  duration = 0.9,
  start = "top 82%",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  start?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const marked = root.querySelectorAll("[data-reveal-item]");
      const targets: gsap.TweenTarget = marked.length ? marked : root;

      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from(targets, {
          y,
          opacity: 0,
          duration,
          stagger,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start, once: true },
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

/**
 * Judul yang "mengupas" naik dari balik topengnya, baris demi baris.
 * Baris ditulis eksplisit supaya pemenggalannya tidak bergantung pada ukuran
 * layar saat font belum termuat.
 */
export function PeelText({
  lines,
  className,
  delay = 0,
  duration = 1.1,
  stagger = 0.09,
  start = "top 84%",
}: {
  lines: React.ReactNode[];
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const inner = root.querySelectorAll("[data-peel]");
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.from(inner, {
          yPercent: 112,
          duration,
          delay,
          stagger,
          ease: "expo.out",
          scrollTrigger: { trigger: root, start, once: true },
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <span ref={scope} className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.06em]">
          <span data-peel className="block">
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
