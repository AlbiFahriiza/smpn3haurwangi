"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Identity } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { useChapterTheme, type Field, type NavTheme } from "@/components/motion/chapter-theme";

/** Tautan teks di batang navigasi; beranda diwakili nama sekolah di kiri. */
const LINKS = [ROUTES.tentang, ROUTES.ekskul, ROUTES.galeri];

/** Warna batang navigasi selalu sama dengan warna bab yang sedang lewat. */
const BAR: Record<Field, string> = {
  foam: "bg-foam text-ink",
  sky: "bg-sky text-ink",
  marine: "bg-marine text-white",
  ink: "bg-ink text-white",
  abyss: "bg-abyss text-white",
  deep: "bg-deep text-white",
};

const ACTION: Record<NavTheme, string> = {
  light: "bg-marine text-white hover:bg-marine-hover",
  dark: "bg-foam text-ink hover:bg-white",
};

export function SiteHeader({
  identity,
  onAdmin,
}: {
  identity?: Identity;
  onAdmin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { ink, field } = useChapterTheme();
  const pathname = usePathname();
  const nama = identity?.nama ?? "SMP Negeri 3 Haurwangi";

  // Panel seluler menutupi seluruh layar: kunci gulir latar dan izinkan tutup
  // dengan Escape supaya pengguna papan tombol tidak terjebak di dalamnya.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const gulirSebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = gulirSebelumnya;
    };
  }, [menuOpen]);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${BAR[field]}`}
    >
      <div className="chapter-inner">
        <div className="flex h-[var(--nav-h)] items-center justify-between gap-2 md:gap-4">
          <Link
            href="/"
            className="whitespace-nowrap text-[clamp(0.9375rem,1.6vw,1.75rem)] font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            {/* Di layar ponsel nama panjang dipendekkan supaya baris navigasi
                tetap satu baris bersama tautan aksi. Nama resminya penuh di
                judul beranda, di footer, dan di metadata halaman. */}
            <span className="sm:hidden">SMPN 3 Haurwangi</span>
            <span className="hidden sm:inline">{nama}</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
            {LINKS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={`t-small font-semibold transition-opacity hover:opacity-100 hover:underline hover:underline-offset-4 ${
                  isActive(item.path) ? "opacity-100" : "opacity-90"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <Link
              href={ROUTES.kontak.path}
              className={`t-small max-[359px]:hidden px-3.5 py-3 font-semibold transition-colors md:px-5 ${ACTION[ink]}`}
            >
              <span className="md:hidden">Hubungi</span>
              <span className="hidden md:inline">Hubungi sekolah</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="menu-seluler"
              className={`t-small px-3 py-3 font-semibold md:hidden ${
                menuOpen ? "bg-white text-ink" : ""
              }`}
            >
              {menuOpen ? "Tutup" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          id="menu-seluler"
          className={`fixed inset-0 z-50 flex flex-col md:hidden ${BAR[field]}`}
        >
          <div className="chapter-inner">
            <div className="flex h-[var(--nav-h)] items-center justify-between gap-3">
              <span className="whitespace-nowrap text-[clamp(0.9375rem,1.6vw,1.75rem)] font-extrabold tracking-tight">
                {nama}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="t-small bg-white px-3 py-3 font-semibold text-ink"
              >
                Tutup
              </button>
            </div>
          </div>

          <nav aria-label="Navigasi seluler" className="chapter-inner mt-6 flex-1">
            <ul className="space-y-1">
              {[...LINKS, ROUTES.kontak].map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    className={`t-statement block py-3 font-semibold ${
                      isActive(item.path) ? "" : "opacity-90"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="chapter-inner pb-8">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onAdmin();
              }}
              className="t-small font-semibold opacity-90 underline underline-offset-4"
            >
              Masuk pengelola sekolah
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
