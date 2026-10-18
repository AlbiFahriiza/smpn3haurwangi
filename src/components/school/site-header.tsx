"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import type { Identity } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { useChapterTheme, type Field, type NavTheme } from "@/components/motion/chapter-theme";

/** Tautan teks di batang navigasi; beranda diwakili nama sekolah di kiri. */
const LINKS = [ROUTES.tentang, ROUTES.ekskul, ROUTES.galeri];

/** Tinta batang navigasi selalu sama dengan warna bab yang sedang lewat. */
const INK: Record<Field, string> = {
  foam: "text-ink",
  sky: "text-ink",
  marine: "text-white",
  ink: "text-white",
  abyss: "text-white",
  deep: "text-white",
};

/**
 * Blok penanda tautan: satu-satunya benda yang bergerak di dalam batang. Saat
 * kursor berhenti di atas sebuah tautan blok ini memekat dan warna tinta
 * tautannya berbalik; kalau tidak, ia hanya selubung tipis di bawah halaman
 * yang sedang dibuka.
 */
const BLOCK: Record<NavTheme, { dasar: string; sorot: string; tinta: string }> = {
  light: { dasar: "bg-ink/12", sorot: "bg-marine", tinta: "text-white" },
  dark: { dasar: "bg-white/18", sorot: "bg-foam", tinta: "text-ink" },
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
  const [condensed, setCondensed] = useState(false);
  const [hoverPath, setHoverPath] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [tanpaGerak, setTanpaGerak] = useState(false);
  const { ink, field } = useChapterTheme();
  const pathname = usePathname();
  const nama = identity?.nama ?? "SMP Negeri 3 Haurwangi";

  const barRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLAnchorElement>(null);
  const aksiRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const blockRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Keadaan gulir dibaca sekali per bingkai saja supaya gulir tetap mulus.
  useEffect(() => {
    let raf = 0;
    const periksa = () => {
      raf = 0;
      setCondensed(window.scrollY > 14);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(periksa);
    };
    periksa();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Magnet hanya untuk penunjuk presisi; sentuhan cukup tanpa ikutan kursor.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pasang = () => setCanHover(mq.matches);
    pasang();
    mq.addEventListener("change", pasang);
    return () => mq.removeEventListener("change", pasang);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pasang = () => setTanpaGerak(mq.matches);
    pasang();
    mq.addEventListener("change", pasang);
    return () => mq.removeEventListener("change", pasang);
  }, []);

  // Tinggi bidang warna batang menyusut saat digulir, tetapi tinggi yang
  // dipesan batang di dalam halaman (--nav-h) tidak pernah ikut berubah, jadi
  // tata letak halaman tidak pernah bergeser di tengah gulir.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const lebar = window.matchMedia("(min-width: 768px)").matches;
    const susut = condensed && lebar;
    const durasi = tanpaGerak ? 0 : 0.7;
    gsap.to(bar, {
      "--nav-band": susut ? "3.5rem" : "4.5rem",
      duration: durasi,
      ease: "expo.out",
      overwrite: "auto",
    });
    if (markRef.current) {
      gsap.to(markRef.current, {
        scale: susut ? 0.9 : 1,
        duration: durasi,
        ease: "expo.out",
        overwrite: "auto",
      });
    }
    if (aksiRef.current) {
      gsap.to(aksiRef.current, {
        scale: susut ? 0.94 : 1,
        duration: durasi,
        delay: tanpaGerak ? 0 : 0.05,
        ease: "expo.out",
        overwrite: "auto",
      });
    }
  }, [condensed, tanpaGerak]);

  // Panel seluler turun seperti tirai yang terkuak, lalu isinya menyusul satu
  // per satu. Saat ditutup ia mengerut kembali dengan cepat.
  useEffect(() => {
    const panel = menuRef.current;
    if (!panel) return;
    const isi = panel.querySelectorAll("[data-menu-item]");
    if (!menuOpen) {
      if (tanpaGerak) {
        gsap.set(panel, { autoAlpha: 0 });
        return;
      }
      gsap.to(panel, {
        autoAlpha: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.32,
        ease: "power2.in",
        overwrite: "auto",
      });
      return;
    }
    if (tanpaGerak) {
      gsap.set(panel, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }
    const garis = gsap.timeline();
    garis
      .set(panel, { visibility: "visible", clipPath: "inset(0% 0% 100% 0%)" })
      .to(panel, {
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.6,
        ease: "expo.out",
      })
      .from(
        isi,
        { autoAlpha: 0, y: 28, duration: 0.55, stagger: 0.055, ease: "expo.out" },
        0.1,
      );
    return () => {
      garis.kill();
    };
  }, [menuOpen, tanpaGerak]);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  // Halaman aktif yang punya tautan sendiri di batang; halaman lain (misalnya
  // /kontak) tidak memarkir blok penanda di mana pun.
  const activePath = useMemo(
    () => LINKS.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.path ?? null,
    [pathname],
  );

  const blockPath = hoverPath ?? activePath;

  /**
   * Satu tempat yang menggerakkan blok; magnetnya hanya menumpang di atas.
   * Saat kursor masuk blok bergerak lebih gesit supaya label yang tintanya
   * berbalik tidak sempat terbaca di atas bidang yang salah.
   */
  const letakkanBlok = useCallback(
    (path: string | null, geser: number, langsung: boolean, gesit = false) => {
      const block = blockRef.current;
      if (!block) return;
      const index = LINKS.findIndex((item) => item.path === path);
      const target = index >= 0 ? linkRefs.current[index] : null;
      if (!target) {
        gsap.to(block, { autoAlpha: 0, duration: langsung ? 0 : 0.26, overwrite: "auto" });
        return;
      }
      gsap.to(block, {
        x: target.offsetLeft + geser,
        yPercent: -50,
        width: target.offsetWidth,
        height: target.offsetHeight,
        autoAlpha: 1,
        duration: langsung ? 0 : gesit ? 0.34 : 0.55,
        ease: "expo.out",
        overwrite: "auto",
      });
    },
    [],
  );

  // Ukuran tautan bergeser setelah font selesai dimuat dan setelah jendela
  // berubah lebar, jadi blok diukur ulang pada dua kejadian itu.
  useEffect(() => {
    letakkanBlok(blockPath, 0, tanpaGerak, Boolean(hoverPath));
    const ukurUlang = () => letakkanBlok(blockPath, 0, true);
    window.addEventListener("resize", ukurUlang);
    let batal = false;
    void document.fonts?.ready.then(() => {
      if (!batal) ukurUlang();
    });
    return () => {
      batal = true;
      window.removeEventListener("resize", ukurUlang);
    };
  }, [blockPath, field, tanpaGerak, hoverPath, letakkanBlok]);

  const ikutiKursor = (event: React.PointerEvent<HTMLElement>) => {
    if (!canHover || tanpaGerak) return;
    const link = (event.target as HTMLElement).closest("a");
    if (!link) return;
    const index = linkRefs.current.findIndex((el) => el === link);
    if (index < 0) return;
    const kotak = link.getBoundingClientRect();
    const tengah = kotak.left + kotak.width / 2;
    letakkanBlok(
      LINKS[index].path,
      Math.max(-8, Math.min(8, (event.clientX - tengah) * 0.1)),
      false,
      true,
    );
  };

  return (
    <header
      ref={barRef}
      data-nav-bar
      data-nav-field={field}
      data-condensed={condensed ? "true" : "false"}
      className={`sticky top-0 z-40 h-[var(--nav-h)] ${INK[field]}`}
    >
      {/* Bidang warna batang: sewarna bab yang sedang lewat, dan saat halaman
          digulir ia menyusut lalu jadi kaca — tembus pandang dan mengaburkan
          isi halaman di belakangnya. Ia juga yang memegang isi batang, jadi
          warna bacaannya tetap terukur. */}
      <div className="nav-band relative h-[var(--nav-band)]">
        <div className="chapter-inner">
          <div className="flex h-full items-center justify-between gap-2 md:gap-4">
            <Link
              ref={markRef}
              href="/"
              className="origin-left whitespace-nowrap text-[clamp(0.9375rem,1.6vw,1.75rem)] font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              {/* Di layar ponsel nama panjang dipendekkan supaya baris navigasi
                  tetap satu baris bersama tautan aksi. Nama resminya penuh di
                  judul beranda, di footer, dan di metadata halaman. */}
              <span className="sm:hidden">SMPN 3 Haurwangi</span>
              <span className="hidden sm:inline">{nama}</span>
            </Link>

            <nav
              ref={navRef}
              aria-label="Navigasi utama"
              onPointerLeave={() => setHoverPath(null)}
              onPointerMove={ikutiKursor}
              className="relative hidden items-center gap-1 md:flex"
            >
              <span
                ref={blockRef}
                aria-hidden
                className={`pointer-events-none absolute left-0 top-1/2 h-8 w-0 opacity-0 transition-colors duration-200 ${
                  hoverPath ? BLOCK[ink].sorot : BLOCK[ink].dasar
                }`}
              />
              {LINKS.map((item, index) => {
                const tersorot = canHover && hoverPath === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    ref={(el) => {
                      linkRefs.current[index] = el;
                    }}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    onPointerEnter={() => {
                      if (canHover) setHoverPath(item.path);
                    }}
                    className={`t-small relative z-10 px-4 py-2 font-semibold ${
                      tersorot ? BLOCK[ink].tinta : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <Link
                ref={aksiRef}
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
      </div>

      {/* Panel seluler selalu ada di dalam dokumen supaya bisa dianimasikan
          keluar; saat tertutup ia disembunyikan dengan visibility, jadi tidak
          ikut terjangkau papan tombol. */}
      <div
        id="menu-seluler"
        ref={menuRef}
        aria-hidden={!menuOpen}
        className={`invisible fixed inset-0 z-50 flex flex-col bg-[var(--nav-solid)] opacity-0 md:hidden ${INK[field]}`}
      >
        <div className="chapter-inner">
          <div className="flex h-[var(--nav-h)] items-center justify-between gap-3">
            <span
              data-menu-item
              className="whitespace-nowrap text-[clamp(0.9375rem,1.6vw,1.75rem)] font-extrabold tracking-tight"
            >
              {nama}
            </span>
            <button
              type="button"
              data-menu-item
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
              <li key={item.path} data-menu-item>
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
    </header>
  );
}
