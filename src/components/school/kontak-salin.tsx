"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Copy } from "lucide-react";
import { useTekan } from "./kontak-tekan";

gsap.registerPlugin(useGSAP);

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/** Lama keadaan "Tersalin" ditahan sebelum kembali menampilkan nilai. */
const TAHAN_SALIN = 1600;
/** Versi lebih panjang untuk keadaan gagal supaya pesannya sempat terbaca. */
const TAHAN_GAGAL = 2600;

/**
 * Menyalin teks ke papan klip. navigator.clipboard hanya ada pada konteks aman
 * (https atau localhost); pada http atau peramban lama jatuh ke cadangan
 * textarea + execCommand supaya penyalinan tetap berfungsi, dan tidak pernah
 * melempar galat keluar.
 */
async function salinKePapan(nilai: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(nilai);
      return true;
    }
  } catch {
    // Izin ditolak atau konteks tidak aman: coba cadangan di bawah.
  }
  try {
    const papan = document.createElement("textarea");
    papan.value = nilai;
    papan.setAttribute("readonly", "");
    papan.style.position = "fixed";
    papan.style.opacity = "0";
    document.body.appendChild(papan);
    papan.select();
    papan.setSelectionRange(0, nilai.length);
    const jadi = document.execCommand("copy");
    papan.remove();
    return jadi;
  } catch {
    return false;
  }
}

type Keadaan = "nilai" | "tersalin" | "gagal";

/**
 * Satu fakta kontak (alamat, surel) yang bisa disalin dengan sekali sentuh.
 * Saat disentuh, nilai memudar singkat dan keadaan "Tersalin" masuk pada kotak
 * yang sama (tumpukan grid, ukuran tidak pernah bergeser) dengan settle pegas
 * kecil dan centang yang tergambar, lalu kembali dengan crossfade lembut.
 * Kondisi awal jawab disembunyikan lewat gaya inline supaya tanpa JavaScript
 * nilai tetap terbaca; pengumuman pembaca layar lewat wilayah aria-live sopan.
 */
export function KontakSalin({ label, nilai }: { label: string; nilai: string }) {
  const [keadaan, setKeadaan] = useState<Keadaan>("nilai");
  const lingkup = useRef<HTMLButtonElement>(null);
  const tahanRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pernahRef = useRef(false);
  const tekan = useTekan();

  useEffect(
    () => () => {
      if (tahanRef.current) clearTimeout(tahanRef.current);
    },
    [],
  );

  // Salin dengan umpan balik optimis: "Tersalin" tampil pada sentuhan yang
  // sama, lalu dikoreksi menjadi keadaan gagal bila penyalinan sebenarnya
  // ditolak peramban.
  const salin = async () => {
    if (tahanRef.current) clearTimeout(tahanRef.current);
    setKeadaan("tersalin");
    const jadi = await salinKePapan(nilai);
    if (!jadi) setKeadaan("gagal");
    tahanRef.current = setTimeout(
      () => setKeadaan("nilai"),
      jadi ? TAHAN_SALIN : TAHAN_GAGAL,
    );
  };

  useGSAP(
    () => {
      const tampil = keadaan !== "nilai";
      // Pemasangan awal: nilai tampil apa adanya, belum ada gerak.
      if (!tampil && !pernahRef.current) return;
      pernahRef.current = true;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        if (tampil) {
          gsap.to("[data-salin-nilai]", {
            opacity: 0,
            duration: 0.15,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.fromTo(
            "[data-salin-jawab]",
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1, duration: 0.34, ease: "back.out(1.8)", overwrite: "auto" },
          );
          gsap.fromTo(
            "[data-salin-cek]",
            { strokeDashoffset: 22 },
            { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", delay: 0.06, overwrite: "auto" },
          );
        } else {
          gsap.to("[data-salin-jawab]", {
            opacity: 0,
            scale: 0.92,
            duration: 0.15,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.fromTo(
            "[data-salin-nilai]",
            { opacity: 0 },
            { opacity: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" },
          );
        }
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-salin-nilai]", { opacity: tampil ? 0 : 1 });
        gsap.set("[data-salin-jawab]", { opacity: tampil ? 1 : 0, scale: 1 });
      });
      return () => mm.revert();
    },
    { scope: lingkup, dependencies: [keadaan] },
  );

  return (
    <>
      <button
        ref={lingkup}
        type="button"
        onClick={salin}
        aria-label={`Salin ${label.toLowerCase()}: ${nilai}`}
        {...tekan}
        className="group grid w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
      >
        <span data-salin-nilai className="col-start-1 row-start-1 break-words">
          <span className="underline decoration-slate-ink/60 decoration-dotted underline-offset-[5px] transition-colors duration-200 group-hover:decoration-marine group-focus-visible:decoration-marine">
            {nilai}
          </span>
          <Copy
            aria-hidden
            className="ml-1.5 inline-block size-3.5 align-[-0.125em] text-slate-ink opacity-45 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </span>
        <span
          data-salin-jawab
          style={{ opacity: 0 }}
          className="col-start-1 row-start-1 inline-flex items-center gap-1.5 self-center justify-self-start font-semibold text-marine"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path
              data-salin-cek
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={22}
              strokeDashoffset={0}
            />
          </svg>
          <span>{keadaan === "gagal" ? "Tidak dapat disalin" : "Tersalin"}</span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {keadaan === "tersalin"
          ? `${label} tersalin ke papan klip.`
          : keadaan === "gagal"
            ? `${label} tidak dapat disalin otomatis.`
            : ""}
      </span>
    </>
  );
}
