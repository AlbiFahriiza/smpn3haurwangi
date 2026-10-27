"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ContactSection, Identity } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { useChapterTheme, type Field, type NavTheme } from "@/components/motion/chapter-theme";

gsap.registerPlugin(ScrollTrigger);

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

/* Soft Round (DESIGN.md): tombol rounded-lg, blok hover rounded-md,
   ditekan turun 1px (antisipasi). */
const LUNAK = "rounded-lg active:translate-y-px transition-transform duration-150";

/** Garis rambut kotak tombol menu seluler: satu kelas per tema batang. */
const MENU: Record<NavTheme, string> = {
  light: "outline-line",
  dark: "outline-white/40",
};

export function SiteHeader({
  identity,
  contact,
  onAdmin,
}: {
  identity?: Identity;
  contact?: ContactSection;
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
  const progressRef = useRef<HTMLDivElement>(null);

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

  // Garis tipis di kaki batang menunjukkan sejauh mana halaman sudah dibaca.
  // Digerakkan oleh guliran sendiri (scrub), jadi aman untuk pengguna yang
  // meminta gerak minimal: ia tidak pernah bergerak sendiri.
  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;
    const tween = gsap.fromTo(
      progress,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

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
        {/* Tinggi penuh band diwariskan ke baris isi lewat kelas h-full ini;
            tanpa itu baris hanya setinggi isinya dan menempel di atas band,
            sehingga isi batang tampak naik dan tidak terpusat. */}
        <div className="chapter-inner h-full">
          <div className="flex h-full items-center justify-between gap-2 md:gap-4">
            <Link
              ref={markRef}
              href="/"
              aria-label={nama}
              className="origin-left flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              {/* Logo sekolah tampil mentah: berkas PNG-nya memang berlatar
                  transparan, jadi tidak dibungkus kotak apa pun — warna azure
                  dan elemen terangnya tetap terbaca di bidang bab terang
                  maupun gelap. */}
              <Image
                src="/images/logo.png"
                alt=""
                width={44}
                height={44}
                className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10 lg:h-11 lg:w-11"
              />
              <span className="min-w-0 whitespace-nowrap text-[clamp(0.9375rem,1.6vw,1.75rem)] font-extrabold tracking-tight">
                {/* Dua tingkat nama: "SMPN 3 Haurwangi" di semua layar
                    sempit sampai di bawah lg, nama resmi penuh mulai lg.
                    Tidak ada lagi versi terpendek "SMPN 3" — identitas
                    sekolah tetap utuh di ponsel, dan ruangnya cukup karena
                    tombol Hubungi hanya tampil mulai sm. Nama penuh juga
                    hadir di panel menu, footer, dan metadata halaman. */}
                <span className="lg:hidden">SMPN 3 Haurwangi</span>
                <span className="hidden lg:inline">{nama}</span>
              </span>
            </Link>

            {/* Grup kanan: tautan bab dan aksi berkumpul di satu sisi
                (DESIGN.md: logo kiri, menu + CTA kanan) supaya tidak ada
                ruang kosong mengambang di antara nama panjang dan menu di
                tengah batang. */}
            <div className="flex shrink-0 items-center gap-3 md:gap-5">
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
                  className={`pointer-events-none absolute left-0 top-1/2 h-8 w-0 rounded-md opacity-0 transition-colors duration-200 ${
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
                      className={`t-small relative z-10 whitespace-nowrap px-4 py-2 font-semibold lg:px-5 ${
                        tersorot ? BLOCK[ink].tinta : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  ref={aksiRef}
                  href={ROUTES.kontak.path}
                  className={`t-small hidden px-3.5 py-3 font-semibold transition-colors sm:block md:px-4 lg:px-5 ${ACTION[ink]} ${LUNAK}`}
                >
                  <span className="lg:hidden">Hubungi</span>
                  <span className="hidden lg:inline">Hubungi sekolah</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-expanded={menuOpen}
                  aria-controls="menu-seluler"
                  className={`t-small rounded-lg px-3 py-3 font-semibold outline outline-1 -outline-offset-1 transition-transform duration-150 active:translate-y-px md:hidden ${
                    menuOpen ? "bg-white text-ink" : MENU[ink]
                  }`}
                >
                  {menuOpen ? "Tutup" : "Menu"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Garis kemajuan baca; warnanya ikut bidang bab (lihat globals.css). */}
        <div ref={progressRef} aria-hidden className="nav-progress" />
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
            <span className="flex min-w-0 items-center gap-3">
              <Image
                src="/images/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span
                data-menu-item
                className="whitespace-nowrap text-[clamp(0.9375rem,1.6vw,1.75rem)] font-extrabold tracking-tight"
              >
                {nama}
              </span>
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
                  className={`t-statement flex items-baseline justify-between gap-4 py-3 font-semibold transition-opacity hover:opacity-80 ${
                    isActive(item.path) ? "" : "opacity-90"
                  }`}
                >
                  {item.label}
                  <span aria-hidden className="t-body opacity-60">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Fakta layanan di dasar panel supaya panel seluler bukan sekadar
            daftar tautan: pengunjung ponsel paling sering mencari dua hal ini. */}
        <div className="chapter-inner pb-8">
          <div data-menu-item className="t-small space-y-1 opacity-80">
            <p className="font-semibold">{contact?.jamLayanan ?? "Senin-Jumat, 07.00-15.30 WIB"}</p>
            <p className="opacity-90">{contact?.alamat ?? identity?.alamat ?? "Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi, Kab. Cianjur"}</p>
          </div>
          <button
            type="button"
            data-menu-item
            onClick={() => {
              setMenuOpen(false);
              onAdmin();
            }}
            className="t-small mt-6 font-semibold opacity-90 underline underline-offset-4"
          >
            Masuk pengelola sekolah
          </button>
        </div>
      </div>
    </header>
  );
}
