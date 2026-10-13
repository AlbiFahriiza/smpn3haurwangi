"use client";

import { useState } from "react";
import type { AboutSection } from "@/lib/content";
import { TextAreaField, TextField, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function AboutEditor({
  data,
  onSave,
}: {
  data?: AboutSection;
  onSave: (json: AboutSection) => void;
}) {
  const [form, setForm] = useState<AboutSection>(
    data ?? { sejarah: [], sambutanTeks: "" }
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
      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Paragraf Sejarah
        </h3>
        {form.sejarah.map((t, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              <TextAreaField
                label={`Paragraf ${i + 1}`}
                value={t}
                rows={4}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    sejarah: f.sejarah.map((x, j) => (j === i ? v : x)),
                  }))
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-6 text-destructive"
              aria-label={`Hapus paragraf ${i + 1}`}
              onClick={() =>
                setForm((f) => ({ ...f, sejarah: f.sejarah.filter((_, j) => j !== i) }))
              }
            >
              ✕
            </Button>
          </div>
        ))}
        <TambahButton
          label="Tambah Paragraf"
          onClick={() => setForm((f) => ({ ...f, sejarah: [...f.sejarah, ""] }))}
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <TextField
          label="Kutipan Penutup (opsional)"
          value={form.sambutanTeks}
          onChange={(v) => setForm((f) => ({ ...f, sambutanTeks: v }))}
          hint="Tampil sebagai kutipan di akhir cerita sejarah."
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Sejarah
      </Button>
    </form>
  );
}
