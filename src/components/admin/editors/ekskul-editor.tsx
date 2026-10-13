"use client";

import { useState } from "react";
import type { EkskulSection } from "@/lib/content";
import { TextField, TextAreaField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

const IKON_OPSI = ["tent", "flag", "zap", "circle-dot", "star", "cross"];

export function EkskulEditor({
  data,
  onSave,
}: {
  data?: EkskulSection;
  onSave: (json: EkskulSection) => void;
}) {
  const [form, setForm] = useState<EkskulSection>(
    data ?? { title: "", description: "", items: [] }
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
      </section>

      <section className="space-y-3">
        {form.items.map((e, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-4 space-y-3">
            <ItemHeader
              judul={e.nama || `Ekstrakurikuler ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))
              }
              onNaik={i > 0 ? () => pindah(i, -1) : undefined}
              onTurun={i < form.items.length - 1 ? () => pindah(i, 1) : undefined}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label="Nama"
                value={e.nama}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, nama: v } : x)),
                  }))
                }
              />
              <TextField
                label="Jadwal"
                value={e.jadwal}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, jadwal: v } : x)),
                  }))
                }
              />
              <TextField
                label="Pembina"
                value={e.pembina}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, pembina: v } : x)),
                  }))
                }
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Warna Kartu</label>
                <input
                  type="color"
                  value={e.warna || "#0078C0"}
                  onChange={(ev) =>
                    setForm((f) => ({
                      ...f,
                      items: f.items.map((x, j) => (j === i ? { ...x, warna: ev.target.value } : x)),
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input cursor-pointer bg-white p-1"
                  aria-label="Warna kartu ekstrakurikuler"
                />
              </div>
            </div>
            <TextAreaField
              label="Deskripsi"
              rows={2}
              value={e.deskripsi}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((x, j) => (j === i ? { ...x, deskripsi: v } : x)),
                }))
              }
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ikon</label>
              <select
                value={e.ikon}
                onChange={(ev) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, ikon: ev.target.value } : x)),
                  }))
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {IKON_OPSI.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Ekstrakurikuler"
          onClick={() =>
            setForm((f) => ({
              ...f,
              items: [
                ...f.items,
                { nama: "", jadwal: "", pembina: "", deskripsi: "", ikon: "star", warna: "#0078C0" },
              ],
            }))
          }
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Ekstrakurikuler
      </Button>
    </form>
  );
}
