"use client";

import { useState } from "react";
import type { FooterSection } from "@/lib/content";
import { TextField } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

const TAB_OPSI = ["beranda", "tentang", "ekskul", "galeri", "kontak"];

export function FooterEditor({
  data,
  onSave,
}: {
  data?: FooterSection;
  onSave: (json: FooterSection) => void;
}) {
  const [form, setForm] = useState<FooterSection>(
    data ?? {
      nama: "",
      tagline: "",
      npsn: "",
      alamat: "",
      email: "",
      akreditasi: "",
      berdiri: "",
      tautan: [],
      credit: "",
    }
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
      <section className="rounded-lg border border-border bg-white p-5 grid sm:grid-cols-2 gap-4">
        <TextField
          label="Nama Sekolah"
          value={form.nama}
          onChange={(v) => setForm((f) => ({ ...f, nama: v }))}
        />
        <TextField
          label="NPSN"
          value={form.npsn}
          onChange={(v) => setForm((f) => ({ ...f, npsn: v }))}
        />
        <TextField
          label="Tagline"
          value={form.tagline}
          onChange={(v) => setForm((f) => ({ ...f, tagline: v }))}
        />
        <TextField
          label="Surel"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        />
        <TextField
          label="Teks Akreditasi"
          value={form.akreditasi}
          onChange={(v) => setForm((f) => ({ ...f, akreditasi: v }))}
        />
        <TextField
          label="Teks Berdiri"
          value={form.berdiri}
          onChange={(v) => setForm((f) => ({ ...f, berdiri: v }))}
        />
        <div className="sm:col-span-2">
          <TextField
            label="Alamat"
            value={form.alamat}
            onChange={(v) => setForm((f) => ({ ...f, alamat: v }))}
          />
        </div>
        <div className="sm:col-span-2">
          <TextField
            label="Kredit Pengelola"
            value={form.credit}
            onChange={(v) => setForm((f) => ({ ...f, credit: v }))}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-abyss text-sm uppercase tracking-wide">
          Tautan Menu Footer
        </h3>
        {form.tautan.map((t, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <TextField
                label="Label"
                value={t.label}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    tautan: f.tautan.map((x, j) => (j === i ? { ...x, label: v } : x)),
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Tab Tujuan</label>
              <select
                value={t.tab}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tautan: f.tautan.map((x, j) => (j === i ? { ...x, tab: e.target.value } : x)),
                  }))
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {TAB_OPSI.map((t2) => (
                  <option key={t2} value={t2}>
                    {t2}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={`Hapus tautan ${t.label}`}
              onClick={() =>
                setForm((f) => ({ ...f, tautan: f.tautan.filter((_, j) => j !== i) }))
              }
            >
              ✕
            </Button>
          </div>
        ))}
        <TambahButton2
          onClick={() =>
            setForm((f) => ({ ...f, tautan: [...f.tautan, { label: "", tab: "beranda" }] }))
          }
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Footer
      </Button>
    </form>
  );
}

function TambahButton2({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="w-full border-dashed">
      + Tambah Tautan
    </Button>
  );
}
