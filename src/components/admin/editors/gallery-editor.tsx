"use client";

import { useState } from "react";
import type { GallerySection } from "@/lib/content";
import { TextField, ImageField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function GalleryEditor({
  data,
  onSave,
}: {
  data?: GallerySection;
  onSave: (json: GallerySection) => void;
}) {
  const [form, setForm] = useState<GallerySection>(
    data ?? { title: "", description: "", kategori: ["Semua"], items: [] }
  );
  const [menyimpan, setMenyimpan] = useState(false);
  const [kategoriBaru, setKategoriBaru] = useState("");

  return (
    <form
      className="space-y-6 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
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
        <TextField
          label="Deskripsi"
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Kategori Filter</p>
          <div className="flex flex-wrap gap-2">
            {form.kategori.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs font-semibold"
              >
                {k}
                {k !== "Semua" && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        kategori: f.kategori.filter((_, j) => j !== i),
                      }))
                    }
                    aria-label={`Hapus kategori ${k}`}
                    className="text-destructive"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={kategoriBaru}
              onChange={(e) => setKategoriBaru(e.target.value)}
              placeholder="Nama kategori baru"
              className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              aria-label="Nama kategori baru"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const k = kategoriBaru.trim();
                if (k && !form.kategori.includes(k)) {
                  setForm((f) => ({ ...f, kategori: [...f.kategori, k] }));
                }
                setKategoriBaru("");
              }}
            >
              Tambah
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {form.items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-4 space-y-3">
            <ItemHeader
              judul={item.judul || `Foto ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))
              }
            />
            <TextField
              label="Judul Foto"
              value={item.judul}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((x, j) => (j === i ? { ...x, judul: v } : x)),
                }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kategori</label>
                <select
                  value={item.kategori}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      items: f.items.map((x, j) =>
                        j === i ? { ...x, kategori: e.target.value } : x
                      ),
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {form.kategori
                    .filter((k) => k !== "Semua")
                    .map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                </select>
              </div>
              <TextField
                label="Tanggal"
                value={item.tanggal}
                placeholder="mis. Juni 2025"
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    items: f.items.map((x, j) => (j === i ? { ...x, tanggal: v } : x)),
                  }))
                }
              />
            </div>
            <ImageField
              label="Foto"
              value={item.src}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((x, j) => (j === i ? { ...x, src: v } : x)),
                }))
              }
            />
          </div>
        ))}
        <TambahButton
          label="Tambah Foto"
          onClick={() =>
            setForm((f) => ({
              ...f,
              items: [
                ...f.items,
                { src: "", judul: "", kategori: f.kategori[1] ?? "Lainnya", tanggal: "" },
              ],
            }))
          }
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Galeri
      </Button>
    </form>
  );
}
