"use client";

import { useState } from "react";
import type { ContactSection } from "@/lib/content";
import { TextField, TextAreaField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function ContactEditor({
  data,
  onSave,
}: {
  data?: ContactSection;
  onSave: (json: ContactSection) => void;
}) {
  const [form, setForm] = useState<ContactSection>(
    data ?? {
      alamat: "",
      email: "",
      telepon: "",
      jamLayanan: "",
      mapsEmbed: "",
      mapsLink: "",
      sosial: [],
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
      <section className="rounded-lg border border-border bg-white p-5 space-y-4">
        <TextAreaField
          label="Alamat"
          rows={2}
          value={form.alamat}
          onChange={(v) => setForm((f) => ({ ...f, alamat: v }))}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField
            label="Surel (Email)"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          />
          <TextField
            label="Telepon"
            value={form.telepon}
            onChange={(v) => setForm((f) => ({ ...f, telepon: v }))}
          />
        </div>
        <TextField
          label="Jam Layanan"
          value={form.jamLayanan}
          onChange={(v) => setForm((f) => ({ ...f, jamLayanan: v }))}
        />
        <TextField
          label="URL Google Maps Embed"
          value={form.mapsEmbed}
          onChange={(v) => setForm((f) => ({ ...f, mapsEmbed: v }))}
          hint="Format: https://www.google.com/maps?q=LAT,LNG&z=16&output=embed"
        />
        <TextField
          label="Tautan Google Maps"
          value={form.mapsLink}
          onChange={(v) => setForm((f) => ({ ...f, mapsLink: v }))}
          hint="Format: https://www.google.com/maps?q=LAT,LNG"
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Media Sosial
        </h3>
        {form.sosial.map((s, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={s.nama || `Media ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, sosial: f.sosial.filter((_, j) => j !== i) }))
              }
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label="Nama"
                value={s.nama}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    sosial: f.sosial.map((x, j) => (j === i ? { ...x, nama: v } : x)),
                  }))
                }
              />
              <TextField
                label="URL"
                value={s.url}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    sosial: f.sosial.map((x, j) => (j === i ? { ...x, url: v } : x)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Media Sosial"
          onClick={() =>
            setForm((f) => ({ ...f, sosial: [...f.sosial, { nama: "", url: "", ikon: "link" }] }))
          }
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Kontak
      </Button>
    </form>
  );
}
