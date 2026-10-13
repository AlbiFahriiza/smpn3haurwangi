"use client";

import { useState } from "react";
import type { TeachersSection } from "@/lib/content";
import { TextField, TextAreaField, ImageField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function TeachersEditor({
  data,
  onSave,
}: {
  data?: TeachersSection;
  onSave: (json: TeachersSection) => void;
}) {
  const [form, setForm] = useState<TeachersSection>(
    data ?? { catatan: "", items: [], statistik: [] }
  );
  const [menyimpan, setMenyimpan] = useState(false);

  const pindah = (i: number, arah: -1 | 1) => {
    setForm((f) => {
      const items = [...f.items];
      const j = i + arah;
      if (j < 0 || j >= items.length) return f;
      [items[i], items[j]] = [items[j], items[i]];
      return { ...f, items };
    });
  };

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
      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Statistik Guru
        </h3>
        {form.statistik.map((s, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={s.label || `Statistik ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({
                  ...f,
                  statistik: f.statistik.filter((_, j) => j !== i),
                }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Label"
                value={s.label}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    statistik: f.statistik.map((x, j) => (j === i ? { ...x, label: v } : x)),
                  }))
                }
              />
              <TextField
                label="Nilai"
                value={s.value}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    statistik: f.statistik.map((x, j) => (j === i ? { ...x, value: v } : x)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Statistik"
          onClick={() =>
            setForm((f) => ({ ...f, statistik: [...f.statistik, { label: "", value: "" }] }))
          }
        />
      </section>

      <section className="space-y-3">
        {form.items.map((g, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-4 space-y-3">
            <ItemHeader
              judul={g.nama || `Guru ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))
              }
              onNaik={i > 0 ? () => pindah(i, -1) : undefined}
              onTurun={i < form.items.length - 1 ? () => pindah(i, 1) : undefined}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label="Nama (dengan gelar)"
                value={g.nama}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, nama: v } : x)),
                  }))
                }
              />
              <TextField
                label="Jabatan"
                value={g.jabatan}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, jabatan: v } : x)),
                  }))
                }
              />
            </div>
            <TextField
              label="Mata Pelajaran"
              value={g.mapel}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((x, j) => (j === i ? { ...x, mapel: v } : x)),
                }))
              }
            />
            <TextAreaField
              label="Deskripsi Singkat"
              rows={2}
              value={g.deskripsi}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((x, j) => (j === i ? { ...x, deskripsi: v } : x)),
                }))
              }
            />
            <ImageField
              label="Foto Guru"
              value={g.foto}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((x, j) => (j === i ? { ...x, foto: v } : x)),
                }))
              }
            />
          </div>
        ))}
        <TambahButton
          label="Tambah Guru"
          onClick={() =>
            setForm((f) => ({
              ...f,
              items: [
                ...f.items,
                { nama: "", jabatan: "Guru", mapel: "", foto: "", deskripsi: "" },
              ],
            }))
          }
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <TextAreaField
          label="Catatan (tampil kecil di halaman publik)"
          rows={2}
          value={form.catatan}
          onChange={(v) => setForm((f) => ({ ...f, catatan: v }))}
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Profil Guru
      </Button>
    </form>
  );
}
