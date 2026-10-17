"use client";

import Image from "next/image";
import Link from "next/link";
import type { ContactSection, FooterSection, Identity } from "@/lib/content";
import { TAB_TO_PATH } from "@/lib/site";
import { Chapter, Inner } from "./chapters/chapter";

/**
 * Penutup halaman: nama sekolah kembali sebesar di pembuka, lalu satu baris
 * fakta resmi dan tautan. Bukan daftar isi, tapi tanda tangan.
 */
export function SiteFooter({
  footer,
  identity,
  contact,
  onAdmin,
}: {
  footer?: FooterSection;
  identity?: Identity;
  contact?: ContactSection;
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

  const [barisPertama, ...rest] = nama.split(" ");
  const barisKedua = rest.join(" ");

  return (
    <Chapter field="deep" nav="dark" pad="normal" className="pb-10">
      <Inner>
        {/* Tanda tangan halaman. Ukurannya menyusut di layar sempit supaya nama
            sekolah tetap utuh dalam dua baris, tidak pecah jadi tiga. */}
        <h2 className="text-[clamp(2rem,7.6vw,9.375rem)] font-extrabold leading-[0.86] tracking-[-0.05em] [font-kerning:none]">
          {barisPertama}{" "}
          <br />
          {barisKedua}
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="t-small field-soft">Identitas</p>
            <ul className="t-small mt-3 space-y-2">
              <li>NPSN {npsn}</li>
              <li>{identity?.status ?? "Negeri"} · {footer?.akreditasi ?? "Akreditasi B"}</li>
              <li>{footer?.berdiri ?? "Berdiri 26 April 2006"}</li>
              <li>{identity?.kurikulum ?? "Kurikulum Merdeka"}</li>
            </ul>
            <Image
              src="/images/logo.png"
              alt={`Logo ${nama}`}
              width={64}
              height={64}
              className="mt-6 h-14 w-14 object-contain"
            />
          </div>

          <nav aria-label="Navigasi footer">
            <p className="t-small field-soft">Halaman</p>
            <ul className="t-small mt-3 space-y-2">
              {tautan.map((item) => (
                <li key={item.tab}>
                  <Link
                    href={TAB_TO_PATH[item.tab] ?? "/"}
                    className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="t-small field-soft">Kontak</p>
            <ul className="t-small mt-3 space-y-2">
              <li>{alamat}</li>
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="break-words underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                  >
                    {email}
                  </a>
                </li>
              )}
              <li>{contact?.jamLayanan ?? "Senin-Jumat, 07.00-15.30 WIB"}</li>
            </ul>
          </div>

          <div>
            <p className="t-small field-soft">Sumber resmi</p>
            <ul className="t-small mt-3 space-y-2">
              <li>
                <a
                  href="https://sekolah.data.kemendikdasmen.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                >
                  Sekolah Kita, Kemendikdasmen
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@Smpn3haurwangiofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                >
                  Kanal YouTube sekolah
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onAdmin}
                  className="text-left underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                >
                  Masuk pengelola sekolah
                </button>
              </li>
            </ul>
          </div>
        </div>

        <p className="t-small mt-14 max-w-[62ch] opacity-70">
          © {new Date().getFullYear()} {nama}. {footer?.credit ?? "Dikelola Tim Media Sekolah"}.
          Data sinkron Dapodik semester 2026/2027.
        </p>
      </Inner>
    </Chapter>
  );
}
