"use client";

import { useState } from "react";
import Image from "next/image";
import type { Identity } from "@/lib/content";
import type { TabKey } from "./school-website";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";

const NAV: { key: TabKey; label: string }[] = [
  { key: "beranda", label: "Beranda" },
  { key: "tentang", label: "Tentang Sekolah" },
  { key: "ekskul", label: "Ekstrakurikuler" },
  { key: "galeri", label: "Galeri" },
  { key: "kontak", label: "Kontak" },
];

export function SiteHeader({
  identity,
  tab,
  onTab,
  onAdmin,
}: {
  identity?: Identity;
  tab: TabKey;
  onTab: (key: string) => void;
  onAdmin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nama = identity?.nama ?? "SMP Negeri 3 Haurwangi";
  const sub =
    identity?.kabupaten && identity?.provinsi
      ? `${identity.kabupaten} · ${identity.provinsi.replace("Provinsi ", "")}`
      : "Kabupaten Cianjur · Jawa Barat";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between gap-3 h-16 md:h-20">
          <button
            onClick={() => onTab("beranda")}
            className="flex items-center gap-3 text-left rounded-md focus-visible:outline-2 focus-visible:outline-primary min-w-0"
            aria-label={`${nama} — kembali ke beranda`}
          >
            <Image
              src="/images/logo.png"
              alt={`Logo ${nama}`}
              width={44}
              height={44}
              className="shrink-0 w-9 h-9 md:w-11 md:h-11"
              priority
            />
            <span className="min-w-0 hidden sm:block">
              <span className="block font-extrabold text-navy text-sm md:text-base leading-tight truncate">
                {nama}
              </span>
              <span className="block text-[11px] md:text-xs text-muted-foreground truncate">
                NPSN {identity?.npsn ?? "20252209"} · {sub}
              </span>
            </span>
          </button>

          <nav aria-label="Navigasi utama" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = tab === item.key;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => onTab(item.key)}
                      aria-current={active ? "page" : undefined}
                      className={`relative px-3 lg:px-4 py-2 text-sm font-semibold rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                        active
                          ? "text-primary bg-secondary"
                          : "text-foreground/70 hover:text-primary hover:bg-secondary/60"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-gold rounded-full"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAdmin}
              className="hidden md:inline-flex text-muted-foreground"
              aria-label="Masuk panel admin sekolah"
            >
              <LogIn className="w-4 h-4" aria-hidden />
              Admin
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden border-t border-border bg-white"
        >
          <ul className="mx-auto max-w-6xl px-4 py-3 space-y-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    onTab(item.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md font-semibold ${
                    tab === item.key
                      ? "text-primary bg-secondary"
                      : "text-foreground/80 hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onAdmin();
                }}
                className="w-full text-left px-4 py-3 rounded-md font-semibold text-muted-foreground hover:bg-secondary/60 flex items-center gap-2"
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
