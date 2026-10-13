"use client";

import Image from "next/image";
import type { FooterSection, Identity, ContactSection } from "@/lib/content";
import { MapPin, Mail, Clock, LogIn, BadgeCheck, Landmark, Youtube } from "lucide-react";

export function SiteFooter({
  footer,
  identity,
  contact,
  onTab,
  onAdmin,
}: {
  footer?: FooterSection;
  identity?: Identity;
  contact?: ContactSection;
  onTab: (key: string) => void;
  onAdmin: () => void;
}) {
  const nama = footer?.nama ?? identity?.nama ?? "SMP Negeri 3 Haurwangi";
  const npsn = footer?.npsn ?? identity?.npsn ?? "20252209";
  const alamat = footer?.alamat ?? contact?.alamat ?? identity?.alamat ?? "";
  const email = footer?.email ?? contact?.email ?? identity?.email ?? "";
  const tautan = footer?.tautan ?? [
    { label: "Beranda", tab: "beranda" },
    { label: "Tentang Sekolah", tab: "tentang" },
    { label: "Ekstrakurikuler", tab: "ekskul" },
    { label: "Galeri", tab: "galeri" },
    { label: "Kontak", tab: "kontak" },
  ];

  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Profil singkat */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt={`Logo ${nama}`}
                width={52}
                height={52}
                className="w-12 h-12"
              />
              <div>
                <p className="font-extrabold text-base leading-tight">{nama}</p>
                <p className="text-xs text-white/70">NPSN {npsn}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              {footer?.tagline ?? "Unggul dalam prestasi, santun dalam perilaku."}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-start gap-2 text-white/80">
                <BadgeCheck className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                {footer?.akreditasi ?? "Akreditasi B"}
              </p>
              <p className="flex items-start gap-2 text-white/80">
                <Landmark className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                {footer?.berdiri ?? "Berdiri 26 April 2006"}
              </p>
            </div>
          </div>

          {/* Navigasi */}
          <nav aria-label="Navigasi footer">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gold">
              Menu
            </h2>
            <ul className="mt-4 space-y-2.5">
              {tautan.map((t) => (
                <li key={t.tab}>
                  <button
                    onClick={() => onTab(t.tab)}
                    className="text-sm text-white/75 hover:text-gold transition-colors"
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gold">
              Kontak
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                <span>{alamat}</span>
              </li>
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-start gap-2 hover:text-gold transition-colors"
                  >
                    <Mail className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                    {email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                {contact?.jamLayanan ?? "Senin–Jumat, 07.00–15.30 WIB"}
              </li>
            </ul>
          </div>

          {/* Tautan resmi */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gold">
              Tautan Resmi
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://sekolah.data.kemendikdasmen.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 hover:text-gold transition-colors"
                >
                  Sekolah Kita — Kemendikdasmen
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@Smpn3haurwangiofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/75 hover:text-gold transition-colors"
                >
                  <Youtube className="w-4 h-4" aria-hidden />
                  YouTube Sekolah
                </a>
              </li>
              <li>
                <button
                  onClick={onAdmin}
                  className="inline-flex items-center gap-2 text-white/60 hover:text-gold transition-colors"
                >
                  <LogIn className="w-4 h-4" aria-hidden />
                  Login Admin (Guru)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {nama} · {footer?.credit ?? "Dikelola Tim Media Sekolah"}
          </p>
          <p>
            {(identity?.kabupaten ?? "Kab. Cianjur")},{" "}
            {identity?.provinsi ?? "Jawa Barat"} — sinkron data Dapodik semester 2026/2027
          </p>
        </div>
      </div>
    </footer>
  );
}
