"use client";

import { useState } from "react";
import type { HomeSection } from "@/lib/content";
import { TextField, TextAreaField, ImageField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

const BADGE_ICONS = ["badge", "building", "calendar"];

export function HomeEditor({
  data,
  onSave,
}: {
  data?: HomeSection;
  onSave: (json: HomeSection) => void;
}) {
  const [form, setForm] = useState<HomeSection>(
    data ?? {
      hero: { title: "", subtitle: "", image: "", badges: [] },
      stats: [],
      sambutan: { title: "", nama: "", jabatan: "", foto: "", teks: [] },
      berita: [],
    }
  );
  const [menyimpan, setMenyimpan] = useState(false);

  return (
    <form
      className="space-y-8 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        setMenyimpan(true);
        onSave(form);
        setMenyimpan(false);
      }}
    >
      {/* Hero */}
      <section className="rounded-lg border border-border bg-white p-5 space-y-4">
        <h3 className="font-bold text-abyss text-sm uppercase tracking-wide">Hero Beranda</h3>
        <TextField
          label="Judul Utama"
          value={form.hero.title}
          onChange={(v) => setForm((f) => ({ ...f, hero: { ...f.hero, title: v } }))}
        />
        <TextAreaField
          label="Kalimat Sambutan"
          value={form.hero.subtitle}
          onChange={(v) => setForm((f) => ({ ...f, hero: { ...f.hero, subtitle: v } }))}
        />
        <ImageField
          label="Foto Header"
          value={form.hero.image}
          onChange={(v) => setForm((f) => ({ ...f, hero: { ...f.hero, image: v } }))}
          hint="Foto gerbang/gedung sekolah, unggah atau tempel path gambar."
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Lencana (badge)</p>
          {form.hero.badges.map((b, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <ItemHeader
                judul={b.label || `Lencana ${i + 1}`}
                onHapus={() =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, badges: f.hero.badges.filter((_, j) => j !== i) },
                  }))
                }
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField
                  label="Teks"
                  value={b.label}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      hero: {
                        ...f.hero,
                        badges: f.hero.badges.map((x, j) => (j === i ? { ...x, label: v } : x)),
                      },
                    }))
                  }
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ikon</label>
                  <select
                    value={b.icon}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        hero: {
                          ...f.hero,
                          badges: f.hero.badges.map((x, j) =>
                            j === i ? { ...x, icon: e.target.value } : x
                          ),
                        },
                      }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {BADGE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <TambahButton
            label="Tambah Lencana"
            onClick={() =>
              setForm((f) => ({
                ...f,
                hero: { ...f.hero, badges: [...f.hero.badges, { label: "", icon: "badge" }] },
              }))
            }
          />
        </div>
      </section>

      {/* Statistik */}
      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-abyss text-sm uppercase tracking-wide">
          Pita Statistik
        </h3>
        {form.stats.map((s, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={s.label || `Statistik ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, stats: f.stats.filter((_, j) => j !== i) }))
              }
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <TextField
                label="Label"
                value={s.label}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    stats: f.stats.map((x, j) => (j === i ? { ...x, label: v } : x)),
                  }))
                }
              />
              <TextField
                label="Nilai"
                value={s.value}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    stats: f.stats.map((x, j) => (j === i ? { ...x, value: v } : x)),
                  }))
                }
              />
              <TextField
                label="Keterangan"
                value={s.sub}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    stats: f.stats.map((x, j) => (j === i ? { ...x, sub: v } : x)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Statistik"
          onClick={() =>
            setForm((f) => ({ ...f, stats: [...f.stats, { label: "", value: "", sub: "" }] }))
          }
        />
      </section>

      {/* Sambutan */}
      <section className="rounded-lg border border-border bg-white p-5 space-y-4">
        <h3 className="font-bold text-abyss text-sm uppercase tracking-wide">
          Sambutan Kepala Sekolah
        </h3>
        <TextField
          label="Judul"
          value={form.sambutan.title}
          onChange={(v) =>
            setForm((f) => ({ ...f, sambutan: { ...f.sambutan, title: v } }))
          }
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField
            label="Nama"
            value={form.sambutan.nama}
            onChange={(v) =>
              setForm((f) => ({ ...f, sambutan: { ...f.sambutan, nama: v } }))
            }
          />
          <TextField
            label="Jabatan"
            value={form.sambutan.jabatan}
            onChange={(v) =>
              setForm((f) => ({ ...f, sambutan: { ...f.sambutan, jabatan: v } }))
            }
          />
        </div>
        <ImageField
          label="Foto (opsional)"
          value={form.sambutan.foto}
          onChange={(v) => setForm((f) => ({ ...f, sambutan: { ...f.sambutan, foto: v } }))}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Paragraf Sambutan</p>
          {form.sambutan.teks.map((t, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1">
                <TextAreaField
                  label={`Paragraf ${i + 1}`}
                  value={t}
                  rows={3}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      sambutan: { ...f.sambutan, teks: f.sambutan.teks.map((x, j) => (j === i ? v : x)) },
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
                  setForm((f) => ({
                    ...f,
                    sambutan: { ...f.sambutan, teks: f.sambutan.teks.filter((_, j) => j !== i) },
                  }))
                }
              >
                ✕
              </Button>
            </div>
          ))}
          <TambahButton
            label="Tambah Paragraf"
            onClick={() =>
              setForm((f) => ({
                ...f,
                sambutan: { ...f.sambutan, teks: [...f.sambutan.teks, ""] },
              }))
            }
          />
        </div>
      </section>

      {/* Berita */}
      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-abyss text-sm uppercase tracking-wide">Berita</h3>
        {form.berita.map((b, i) => (
          <div key={i} className="rounded-md border border-border p-3 space-y-3">
            <ItemHeader
              judul={b.title || `Berita ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, berita: f.berita.filter((_, j) => j !== i) }))
              }
            />
            <TextField
              label="Judul"
              value={b.title}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  berita: f.berita.map((x, j) => (j === i ? { ...x, title: v } : x)),
                }))
              }
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label="Tanggal"
                value={b.date}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    berita: f.berita.map((x, j) => (j === i ? { ...x, date: v } : x)),
                  }))
                }
              />
            </div>
            <TextAreaField
              label="Ringkasan"
              value={b.excerpt}
              rows={2}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  berita: f.berita.map((x, j) => (j === i ? { ...x, excerpt: v } : x)),
                }))
              }
            />
            <ImageField
              label="Foto"
              value={b.image}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  berita: f.berita.map((x, j) => (j === i ? { ...x, image: v } : x)),
                }))
              }
            />
          </div>
        ))}
        <TambahButton
          label="Tambah Berita"
          onClick={() =>
            setForm((f) => ({
              ...f,
              berita: [...f.berita, { title: "", date: "", excerpt: "", image: "" }],
            }))
          }
        />
      </section>

      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Beranda
      </Button>
    </form>
  );
}
