"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PasswordEditor() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalat(null);
    if (passwordBaru !== konfirmasi) {
      setGalat("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setMenyimpan(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordLama, passwordBaru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengganti kata sandi.");
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasi("");
      toast({
        title: "Kata sandi diganti",
        description: "Gunakan kata sandi baru pada login berikutnya.",
      });
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal mengganti kata sandi.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-sm space-y-4 rounded-lg border border-border bg-white p-5"
    >
      <div className="flex items-center gap-2 text-abyss">
        <KeyRound className="w-5 h-5" aria-hidden />
        <h3 className="font-bold">Ganti Kata Sandi</h3>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pass-lama">Kata Sandi Lama</Label>
        <Input
          id="pass-lama"
          type="password"
          value={passwordLama}
          onChange={(e) => setPasswordLama(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pass-baru">Kata Sandi Baru</Label>
        <Input
          id="pass-baru"
          type="password"
          value={passwordBaru}
          onChange={(e) => setPasswordBaru(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-[11px] text-muted-foreground">Minimal 8 karakter.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pass-konfirmasi">Ulangi Kata Sandi Baru</Label>
        <Input
          id="pass-konfirmasi"
          type="password"
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {galat && (
        <p className="text-sm text-destructive" role="alert">
          {galat}
        </p>
      )}
      <Button type="submit" disabled={menyimpan} className="w-full gap-2">
        {menyimpan && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
        Simpan Kata Sandi
      </Button>
    </form>
  );
}
