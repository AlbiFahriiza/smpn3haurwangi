"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

/** Kotak input teks satu baris dengan label. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Kotak input multi-baris dengan label. */
export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Field gambar: input path/URL + tombol unggah berkas
 * (diunggah ke /uploads lalu path-nya diisikan otomatis).
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [gagal, setGagal] = useState<string | null>(null);

  const unggah = async (file: File) => {
    setMengunggah(true);
    setGagal(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unggah gagal.");
      onChange(data.path);
    } catch (e) {
      setGagal(e instanceof Error ? e.message : "Unggah gagal.");
    } finally {
      setMengunggah(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          placeholder="/images/… atau https://…"
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void unggah(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={mengunggah}
          className="shrink-0"
        >
          {mengunggah ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="w-4 h-4" aria-hidden />
          )}
          Unggah
        </Button>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {gagal && (
        <p className="text-[11px] text-destructive" role="alert">
          {gagal}
        </p>
      )}
      {value && (
        <img
          src={value}
          alt={`Pratinjau ${label}`}
          className="mt-1 h-20 rounded-md border border-border object-cover"
        />
      )}
    </div>
  );
}

/** Header untuk satu item dalam editor daftar. */
export function ItemHeader({
  judul,
  onHapus,
  onNaik,
  onTurun,
}: {
  judul: string;
  onHapus: () => void;
  onNaik?: () => void;
  onTurun?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <p className="text-sm font-bold text-abyss truncate">{judul}</p>
      <div className="flex items-center gap-1 shrink-0">
        {onNaik && (
          <Button type="button" variant="ghost" size="icon" onClick={onNaik} aria-label="Naikkan" className="h-7 w-7">
            ↑
          </Button>
        )}
        {onTurun && (
          <Button type="button" variant="ghost" size="icon" onClick={onTurun} aria-label="Turunkan" className="h-7 w-7">
            ↓
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onHapus}
          aria-label={`Hapus ${judul}`}
          className="h-7 w-7 text-destructive hover:text-destructive"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}

/** Tombol tambah item baru. */
export function TambahButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="w-full border-dashed">
      + {label}
    </Button>
  );
}
