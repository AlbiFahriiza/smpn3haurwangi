"use client";

import { useState } from "react";
import type { VisionSection } from "@/lib/content";
import { TextAreaField, TextField, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function VisionEditor({
  data,
  onSave,
}: {
  data?: VisionSection;
  onSave: (json: VisionSection) => void;
}) {
  const [form, setForm] = useState<VisionSection>(
    data ?? { catatan: "", visi: "", misi: [], tujuan: [], motto: "" }
  );
  const [menyimpan, setMenyimpan] = useState(false);

  const listEditor = (
    label: string,
    key: "misi" | "tujuan",
    rows: number
  ) => (
    <section className="rounded-lg border border-border bg-white p-5 space-y-2">
      <h3 className="font-bold text-abyss text-sm uppercase tracking-wide">{label}</h3>
      {form[key].map((t, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1">
            <TextAreaField
              label={`${label} ${i + 1}`}
              value={t}
              rows={rows}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  [key]: f[key].map((x, j) => (j === i ? v : x)),
                }) as VisionSection)
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6 text-destructive"
            aria-label={`Hapus ${label} ${i + 1}`}
            onClick={() =>
              setForm((f) => ({
                ...f,
                [key]: f[key].filter((_, j) => j !== i),
              }) as VisionSection)
            }
          >
            ✕
          </Button>
        </div>
      ))}
      <TambahButton
        label={`Tambah ${label}`}
        onClick={() => setForm((f) => ({ ...f, [key]: [...f[key], ""] }) as VisionSection)}
      />
    </section>
  );

  return (
    <form
      className="space-y-6 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        setMenyimpan(true);
        onSave(form);
        setMenyimpan(false);
      }}
    >
      <section className="rounded-lg border border-border bg-white p-5 space-y-4">
        <TextAreaField
          label="Visi"
          rows={3}
          value={form.visi}
          onChange={(v) => setForm((f) => ({ ...f, visi: v }))}
        />
        <TextField
          label="Motto / Tagline"
          value={form.motto}
          onChange={(v) => setForm((f) => ({ ...f, motto: v }))}
        />
        <TextAreaField
          label="Catatan (tampil kecil untuk pengunjung)"
          rows={2}
          value={form.catatan}
          onChange={(v) => setForm((f) => ({ ...f, catatan: v }))}
          hint="mis. sumber dokumen visi misi atau status verifikasi."
        />
      </section>

      {listEditor("Misi", "misi", 2)}
      {listEditor("Tujuan", "tujuan", 2)}

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Visi & Misi
      </Button>
    </form>
  );
}
