"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Identity } from "@/lib/content";
import { NAV_ORDER, ROUTES } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";

/** Menu utama diambil dari definisi rute agar label dan path selalu sinkron. */
const NAV = NAV_ORDER.map((key) => ROUTES[key]);

export function SiteHeader({
  identity,
  onAdmin,
}: {
  identity?: Identity;
  onAdmin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const nama = identity?.nama ?? "SMP Negeri 3 Haurwangi";
  const npsn = identity?.npsn ?? "20252209";
  const akreditasi = identity?.akreditasi ?? "Terakreditasi B";

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-40">
      {/* Bar identitas: informasi resmi sekolah, bukan dekorasi */}
      <div className="bg-abyss text-white/85">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-8 text-[11px] md:text-xs font-medium tracking-wide">
          <p className="truncate">
            NPSN {npsn}
            <span className="mx-2 text-white/40" aria-hidden>
              |
            </span>
            {akreditasi}
          </p>
          <p className="hidden sm:block truncate">
            {identity?.penyelenggaraan ?? "Sekolah Sehari Penuh, Senin sampai Jumat"}
          </p>
        </div>
      </div>

      {/* Navigasi utama */}
      <div className="bg-white/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-3 h-16 md:h-[68px]">
            <Link
              href="/"
              className="flex items-center gap-3 text-left rounded-md focus-visible:outline-2 focus-visible:outline-marine min-w-0"
              aria-label={`${nama}, kembali ke beranda`}
            >
              <span className="shrink-0 grid place-items-center w-11 h-11 rounded-lg bg-sky">
                <Image
                  src="/images/logo.png"
                  alt={`Logo ${nama}`}
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                  priority
                />
              </span>
              <span className="min-w-0 hidden sm:block">
                <span className="block font-extrabold text-abyss text-sm md:text-base leading-tight tracking-tight truncate">
                  {nama}
                </span>
                <span className="block text-[11px] md:text-xs text-slate-ink truncate">
                  {identity?.kabupaten ?? "Kabupaten Cianjur"}
                  {identity?.provinsi
                    ? `, ${identity.provinsi.replace("Provinsi ", "")}`
                    : ", Jawa Barat"}
                </span>
              </span>
            </Link>

            <nav aria-label="Navigasi utama" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        aria-current={active ? "page" : undefined}
                        className={`relative inline-block px-3 lg:px-4 py-2 text-sm font-semibold rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-marine ${
                          active
                            ? "text-marine bg-sky"
                            : "text-ink/75 hover:text-marine hover:bg-sky/60"
                        }`}
                      >
                        {item.label}
                        {active && (
                          <span
                            aria-hidden
                            className="absolute left-3 right-3 -bottom-[9px] h-0.5 bg-marine rounded-full"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-marine hover:bg-marine-hover text-white font-semibold"
              >
                <Link href={ROUTES.kontak.path}>Hubungi Sekolah</Link>
              </Button>
              <button
                onClick={onAdmin}
                className="hidden md:grid place-items-center w-9 h-9 rounded-md text-slate-ink hover:text-marine hover:bg-sky/60 transition-colors focus-visible:outline-2 focus-visible:outline-marine"
                aria-label="Masuk panel admin sekolah"
              >
                <LogIn className="w-4 h-4" aria-hidden />
              </button>
              <button
                className="md:hidden grid place-items-center w-10 h-10 rounded-md text-abyss hover:bg-sky/60 transition-colors focus-visible:outline-2 focus-visible:outline-marine"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden border-b border-line bg-white"
        >
          <ul className="mx-auto max-w-6xl px-4 py-3 space-y-1">
            {NAV.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className={`block w-full px-4 py-3 rounded-md font-semibold ${
                    isActive(item.path)
                      ? "text-marine bg-sky"
                      : "text-ink/80 hover:bg-sky/60"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-line">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onAdmin();
                }}
                className="w-full text-left px-4 py-3 rounded-md font-semibold text-slate-ink hover:bg-sky/60 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" aria-hidden />
                Login Admin
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
