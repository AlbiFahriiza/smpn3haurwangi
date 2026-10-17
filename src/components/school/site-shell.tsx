"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/content";
import { TAB_TO_PATH } from "@/lib/site";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import {
  ChapterThemeProvider,
  ChapterThemeWatcher,
} from "@/components/motion/chapter-theme";
import { BIDANG_AWAL_BERANDA, BIDANG_PEMBUKA } from "@/lib/chapter-fields";
import dynamic from "next/dynamic";
// Panel admin hanya dibuka lewat #admin atau tombol footer, jadi tidak perlu
// ikut terunduh di kunjungan biasa: kode panel (beserta Firebase) dimuat saat
// dipakai. Ini memangkas puluhan KB dari halaman publik.
const AdminPanel = dynamic(
  () => import("@/components/admin/admin-panel").then((m) => m.AdminPanel),
  { ssr: false },
);
/**
 * Kerangka tampilan situs: header, konten halaman, footer, dan panel admin.
 *
 * Isi halaman datang dari Server Component (children), sehingga setiap tab
 * punya URL sendiri dan kontennya sudah ada di HTML pertama yang dikirim ke
 * mesin pencari.
 */
export function SiteShell({
  content,
  children,
}: {
  content: Partial<SiteContent>;
  children: React.ReactNode;
}) {
  const [adminOpen, setAdminOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Kompatibilitas tautan lama: #tab=<nama> diarahkan ke rute baru, #admin membuka panel.
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("tab=")) {
        const target = TAB_TO_PATH[hash.slice(4)];
        if (!target) return;
        if (target === pathname) window.scrollTo({ top: 0 });
        else router.push(target);
      } else if (hash === "admin") {
        setAdminOpen(true);
      }
    };
    handler();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [pathname, router]);

  // Warna bab pembuka halaman menentukan warna awal batang navigasi, supaya
  // tidak ada kedipan satu bingkai sebelum JavaScript membaca babnya.
  const bidangAwal = BIDANG_PEMBUKA[pathname] ?? BIDANG_AWAL_BERANDA;

  return (
    <ChapterThemeProvider initial={bidangAwal}>
      <ChapterThemeWatcher />
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader identity={content.identity} onAdmin={() => setAdminOpen(true)} />

        <main id="konten-utama" className="flex-1">
          {children}
        </main>

        <SiteFooter
          footer={content.footer}
          identity={content.identity}
          contact={content.contact}
          onAdmin={() => setAdminOpen(true)}
        />

        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          content={content}
          onSaved={() => router.refresh()}
        />
      </div>
    </ChapterThemeProvider>
  );
}
