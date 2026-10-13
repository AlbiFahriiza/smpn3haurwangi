"use client";

import { useState } from "react";
import type { DenahSection } from "@/lib/content";
import { TextField, TextAreaField, ImageField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function DenahEditor({
  data,
  onSave,
}: {
  data?: DenahSection;
  onSave: (json: DenahSection) => void;
}) {
  const [form, setForm] = useState<DenahSection>(
    data ?? { title: "", description: "", image: "", keterangan: [], fasilitas: [] }
  );
  const [menyimpan, setMenyimpan] = useState(false);

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
        <TextField
          label="Judul"
          value={form.title}
          onChange={(v) => setForm((f) => ({ ...f, title: v }))}
        />
        <TextAreaField
          label="Deskripsi"
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        />
        <ImageField
          label="Gambar Denah"
          value={form.image}
          onChange={(v) => setForm((f) => ({ ...f, image: v }))}
          hint="Unggah denah terbaru (hasil pindaian/foto site plan)."
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Keterangan Ruang
        </h3>
        {form.keterangan.map((k, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={`${k.kode} — ${k.nama}`}
              onHapus={() =>
                setForm((f) => ({
                  ...f,
                  keterangan: f.keterangan.filter((_, j) => j !== i),
                }))
              }
            />
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <TextField
                label="Kode"
                value={k.kode}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    keterangan: f.keterangan.map((x, j) => (j === i ? { ...x, kode: v } : x)),
                  }))
                }
              />
              <TextField
                label="Nama Ruang"
                value={k.nama}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    keterangan: f.keterangan.map((x, j) => (j === i ? { ...x, nama: v } : x)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Ruang"
          onClick={() =>
            setForm((f) => ({ ...f, keterangan: [...f.keterangan, { kode: "", nama: "" }] }))
          }
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Area Terbuka / Fasilitas
        </h3>
        {form.fasilitas.map((f2, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={f2.nama || `Fasilitas ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, fasilitas: f.fasilitas.filter((_, j) => j !== i) }))
              }
            />
            <div className="space-y-3">
              <TextField
                label="Nama"
                value={f2.nama}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    fasilitas: f.fasilitas.map((x, j) => (j === i ? { ...x, nama: v } : x)),
                  }))
                }
              />
              <TextField
                label="Keterangan"
                value={f2.detail}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    fasilitas: f.fasilitas.map((x, j) => (j === i ? { ...x, detail: v } : x)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Fasilitas"
          onClick={() =>
            setForm((f) => ({ ...f, fasilitas: [...f.fasilitas, { nama: "", detail: "" }] }))
          }
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Denah
      </Button>
    </form>
  );
}
