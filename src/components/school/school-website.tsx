"use client";

import { useState, useCallback, useEffect } from "react";
import type { SiteContent } from "@/lib/content";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { BerandaTab } from "./tabs/beranda-tab";
import { TentangTab } from "./tabs/tentang-tab";
import { EkskulTab } from "./tabs/ekskul-tab";
import { GaleriTab } from "./tabs/galeri-tab";
import { KontakTab } from "./tabs/kontak-tab";
import { AdminPanel } from "@/components/admin/admin-panel";

export type TabKey = "beranda" | "tentang" | "ekskul" | "galeri" | "kontak";

const TAB_LABELS: Record<TabKey, string> = {
  beranda: "Beranda",
  tentang: "Tentang Sekolah",
  ekskul: "Ekstrakurikuler",
  galeri: "Galeri",
  kontak: "Kontak",
};

export function SchoolWebsite({
  initialContent,
}: {
  initialContent: Partial<SiteContent>;
}) {
  const [content, setContent] = useState<Partial<SiteContent>>(initialContent);
  const [tab, setTab] = useState<TabKey>("beranda");
  const [adminOpen, setAdminOpen] = useState(false);

  const gotoTab = useCallback((next: string) => {
    if (next in TAB_LABELS) {
      setTab(next as TabKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Dukungan tautan dalam (mis. footer) berbentuk #tab=<nama>.
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("tab=")) {
        gotoTab(hash.slice(4));
      } else if (hash === "admin") {
        setAdminOpen(true);
      }
    };
    handler();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [gotoTab]);

  const refreshContent = useCallback(async () => {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (res.ok) {
      setContent(await res.json());
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader
        identity={content.identity}
        tab={tab}
        onTab={gotoTab}
        onAdmin={() => setAdminOpen(true)}
      />

      <main id="konten-utama" className="flex-1">
        {tab === "beranda" && (
          <BerandaTab content={content} onTab={gotoTab} />
        )}
        {tab === "tentang" && <TentangTab content={content} />}
        {tab === "ekskul" && <EkskulTab content={content} />}
        {tab === "galeri" && <GaleriTab content={content} />}
        {tab === "kontak" && <KontakTab content={content} />}
      </main>

      <SiteFooter
        footer={content.footer}
        identity={content.identity}
        contact={content.contact}
        onTab={gotoTab}
        onAdmin={() => setAdminOpen(true)}
      />

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        content={content}
        onSaved={refreshContent}
      />
    </div>
  );
}
