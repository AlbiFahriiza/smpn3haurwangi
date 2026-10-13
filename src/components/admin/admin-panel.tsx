"use client";

import { useEffect, useState, useCallback } from "react";
import type { SiteContent, SectionKey } from "@/lib/content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IdentityEditor } from "./editors/identity-editor";
import { HomeEditor } from "./editors/home-editor";
import { DenahEditor } from "./editors/denah-editor";
import { RoutinesEditor } from "./editors/routines-editor";
import { AboutEditor } from "./editors/about-editor";
import { VisionEditor } from "./editors/vision-editor";
import { TeachersEditor } from "./editors/teachers-editor";
import { StudentsEditor } from "./editors/students-editor";
import { EkskulEditor } from "./editors/ekskul-editor";
import { GalleryEditor } from "./editors/gallery-editor";
import { ContactEditor } from "./editors/contact-editor";
import { FooterEditor } from "./editors/footer-editor";
import { PasswordEditor } from "./editors/password-editor";

interface AdminUser {
  username: string;
  name: string;
  role: string;
}

const SECTIONS: { key: SectionKey | "keamanan"; label: string; grup: string }[] = [
  { key: "identity", label: "Identitas Sekolah", grup: "Data Pokok" },
  { key: "home", label: "Beranda", grup: "Data Pokok" },
  { key: "denah", label: "Denah Sekolah", grup: "Data Pokok" },
  { key: "routines", label: "Rutinitas Sekolah", grup: "Data Pokok" },
  { key: "about", label: "Sejarah Sekolah", grup: "Tentang" },
  { key: "vision", label: "Visi & Misi", grup: "Tentang" },
  { key: "teachers", label: "Profil Guru & Staf", grup: "Tentang" },
  { key: "students", label: "Profil Siswa", grup: "Tentang" },
  { key: "ekskul", label: "Ekstrakurikuler", grup: "Konten" },
  { key: "gallery", label: "Galeri Foto", grup: "Konten" },
  { key: "contact", label: "Kontak", grup: "Konten" },
  { key: "footer", label: "Footer", grup: "Konten" },
  { key: "keamanan", label: "Ganti Kata Sandi", grup: "Keamanan" },
];

export function AdminPanel({
  open,
  onClose,
  content,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  content: Partial<SiteContent>;
  onSaved: () => void;
}) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [cekSesi, setCekSesi] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sedangLogin, setSedangLogin] = useState(false);
  const [galatLogin, setGalatLogin] = useState<string | null>(null);
  const [seksi, setSeksi] = useState<SectionKey | "keamanan">("identity");
  const [dirty, setDirty] = useState(false);
  const { toast } = useToast();

  // Cek sesi yang masih aktif setiap kali panel dibuka.
  useEffect(() => {
    if (!open) return;
    setCekSesi(true);
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setCekSesi(false));
  }, [open]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setSedangLogin(true);
    setGalatLogin(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login gagal.");
      setUser(data.user);
      setPassword("");
      toast({
        title: "Berhasil masuk",
        description: `Selamat datang, ${data.user.name}.`,
      });
    } catch (err) {
      setGalatLogin(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setSedangLogin(false);
    }
  };

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setDirty(false);
    toast({ title: "Keluar panel admin", description: "Sesi Anda telah diakhiri." });
  }, [toast]);

  /** Simpan satu seksi: kirim JSON ke API lalu muat ulang konten publik. */
  const simpan = useCallback(
    async (key: SectionKey, json: unknown) => {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, json }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Gagal menyimpan",
          description: data.error ?? "Coba lagi.",
          variant: "destructive",
        });
        return;
      }
      onSaved();
      toast({ title: "Tersimpan", description: `Seksi ${key} berhasil diperbarui.` });
    },
    [onSaved, toast]
  );

  const grupList = Array.from(new Set(SECTIONS.map((s) => s.grup)));
  const seksiAktif = SECTIONS.find((s) => s.key === seksi);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-5xl h-[92vh] p-0 overflow-hidden gap-0 flex flex-col [&>button]:z-20"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          Panel Admin — mengelola konten website sekolah
        </DialogTitle>
        {cekSesi ? (
          <div className="h-full grid place-items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Memuat" />
          </div>
        ) : !user ? (
          /* ---------- FORMULIR LOGIN ---------- */
          <div className="h-full grid place-items-center bg-secondary/40 p-6">
            <form
              onSubmit={login}
              className="w-full max-w-sm rounded-xl bg-white border border-border p-6 space-y-5 shadow-sm"
            >
              <div className="text-center">
                <span className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-navy text-gold">
                  <Lock className="w-5 h-5" aria-hidden />
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-navy">
                  Panel Admin Sekolah
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hanya guru dan tenaga kependidikan yang berwenang mengubah konten.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-username">Nama Pengguna</Label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Nama pengguna"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Kata Sandi</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Kata sandi"
                />
              </div>
              {galatLogin && (
                <p className="text-sm text-destructive" role="alert">
                  {galatLogin}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={sedangLogin}>
                {sedangLogin && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
                Masuk
              </Button>
            </form>
          </div>
        ) : (
          /* ---------- DASBOR ADMIN ---------- */
          <div className="h-full flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <aside className="md:w-64 shrink-0 bg-navy text-white flex flex-col max-h-[30vh] md:max-h-none">
              <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-gold shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">Panel Admin</p>
                  <p className="text-[11px] text-white/60 truncate">
                    {user.name} · {user.role.replace("_", " ")}
                  </p>
                </div>
              </div>
              <nav
                aria-label="Navigasi seksi konten"
                className="flex-1 overflow-y-auto p-3"
              >
                {grupList.map((grup) => (
                  <div key={grup} className="mb-3">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {grup}
                    </p>
                    <ul>
                      {SECTIONS.filter((s) => s.grup === grup).map((s) => (
                        <li key={s.key}>
                          <button
                            onClick={() => setSeksi(s.key)}
                            aria-current={seksi === s.key ? "true" : undefined}
                            className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                              seksi === s.key
                                ? "bg-primary text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
              <div className="p-3 border-t border-white/10 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClose()}
                  className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                  Kembali
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="w-4 h-4" aria-hidden />
                  Keluar
                </Button>
              </div>
            </aside>

            {/* Area editor seksi */}
            <div className="flex-1 overflow-y-auto bg-secondary/40">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-border px-5 py-3.5 flex items-center justify-between">
                <h2 className="font-bold text-navy">
                  {seksiAktif?.label ?? "Editor"}
                </h2>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Perubahan tersimpan saat Anda menekan tombol Simpan.
                </p>
              </div>
              <div className="p-5">
                {seksi === "identity" && (
                  <IdentityEditor
                    data={content.identity}
                    onSave={(json) => simpan("identity", json)}
                  />
                )}
                {seksi === "home" && (
                  <HomeEditor data={content.home} onSave={(json) => simpan("home", json)} />
                )}
                {seksi === "denah" && (
                  <DenahEditor data={content.denah} onSave={(json) => simpan("denah", json)} />
                )}
                {seksi === "routines" && (
                  <RoutinesEditor
                    data={content.routines}
                    onSave={(json) => simpan("routines", json)}
                  />
                )}
                {seksi === "about" && (
                  <AboutEditor data={content.about} onSave={(json) => simpan("about", json)} />
                )}
                {seksi === "vision" && (
                  <VisionEditor
                    data={content.vision}
                    onSave={(json) => simpan("vision", json)}
                  />
                )}
                {seksi === "teachers" && (
                  <TeachersEditor
                    data={content.teachers}
                    onSave={(json) => simpan("teachers", json)}
                  />
                )}
                {seksi === "students" && (
                  <StudentsEditor
                    data={content.students}
                    onSave={(json) => simpan("students", json)}
                  />
                )}
                {seksi === "ekskul" && (
                  <EkskulEditor
                    data={content.ekskul}
                    onSave={(json) => simpan("ekskul", json)}
                  />
                )}
                {seksi === "gallery" && (
                  <GalleryEditor
                    data={content.gallery}
                    onSave={(json) => simpan("gallery", json)}
                  />
                )}
                {seksi === "contact" && (
                  <ContactEditor
                    data={content.contact}
                    onSave={(json) => simpan("contact", json)}
                  />
                )}
                {seksi === "footer" && (
                  <FooterEditor
                    data={content.footer}
                    onSave={(json) => simpan("footer", json)}
                  />
                )}
                {seksi === "keamanan" && <PasswordEditor />}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
