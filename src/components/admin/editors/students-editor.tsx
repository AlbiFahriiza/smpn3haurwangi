"use client";

import { useState } from "react";
import type { StudentsSection } from "@/lib/content";
import { TextField, TextAreaField, ItemHeader, TambahButton } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function StudentsEditor({
  data,
  onSave,
}: {
  data?: StudentsSection;
  onSave: (json: StudentsSection) => void;
}) {
  const [form, setForm] = useState<StudentsSection>(
    data ?? {
      catatan: "",
      total: 0,
      lakiLaki: 0,
      perempuan: 0,
      rombel: 0,
      rasioKelas: 0,
      kelas: [],
      fasilitasBelajar: [],
    }
  );
  const [menyimpan, setMenyimpan] = useState(false);

  const angka = (k: keyof StudentsSection) => (v: string) =>
    setForm((f) => ({ ...f, [k]: Math.max(0, Number(v) || 0) }));

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
      <section className="rounded-lg border border-border bg-white p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <TextField
          label="Total Siswa"
          type="number"
          value={String(form.total)}
          onChange={angka("total")}
        />
        <TextField
          label="Siswa Putra"
          type="number"
          value={String(form.lakiLaki)}
          onChange={angka("lakiLaki")}
        />
        <TextField
          label="Siswa Putri"
          type="number"
          value={String(form.perempuan)}
          onChange={angka("perempuan")}
        />
        <TextField
          label="Jumlah Rombel"
          type="number"
          value={String(form.rombel)}
          onChange={angka("rombel")}
        />
        <TextField
          label="Rasio Siswa/Kelas"
          type="number"
          value={String(form.rasioKelas)}
          onChange={angka("rasioKelas")}
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Rombongan Belajar
        </h3>
        {form.kelas.map((k, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={k.kelas || `Kelas ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({ ...f, kelas: f.kelas.filter((_, j) => j !== i) }))
              }
            />
            <div className="grid grid-cols-[90px_110px_1fr] gap-3">
              <TextField
                label="Kelas"
                value={k.kelas}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    kelas: f.kelas.map((x, j) => (j === i ? { ...x, kelas: v } : x)),
                  }))
                }
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Jumlah</label>
                <input
                  type="number"
                  min={0}
                  value={k.jumlah}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      kelas: f.kelas.map((x, j) =>
                        j === i ? { ...x, jumlah: Math.max(0, Number(e.target.value) || 0) } : x
                      ),
                    }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                />
              </div>
              <TextField
                label="Wali Kelas"
                value={k.waliKelas}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    kelas: f.kelas.map((x, j) => (j === i ? { ...x, waliKelas: v } : x)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Kelas"
          onClick={() =>
            setForm((f) => ({ ...f, kelas: [...f.kelas, { kelas: "", jumlah: 0, waliKelas: "" }] }))
          }
        />
      </section>

      <section className="rounded-lg border border-border bg-white p-5 space-y-3">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
          Fasilitas Belajar
        </h3>
        {form.fasilitasBelajar.map((fa, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <ItemHeader
              judul={fa.nama || `Fasilitas ${i + 1}`}
              onHapus={() =>
                setForm((f) => ({
                  ...f,
                  fasilitasBelajar: f.fasilitasBelajar.filter((_, j) => j !== i),
                }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Nama"
                value={fa.nama}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    fasilitasBelajar: f.fasilitasBelajar.map((x, j) =>
                      j === i ? { ...x, nama: v } : x
                    ),
                  }))
                }
              />
              <TextField
                label="Jumlah"
                value={fa.jumlah}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    fasilitasBelajar: f.fasilitasBelajar.map((x, j) =>
                      j === i ? { ...x, jumlah: v } : x
                    ),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <TambahButton
          label="Tambah Fasilitas"
          onClick={() =>
            setForm((f) => ({
              ...f,
              fasilitasBelajar: [...f.fasilitasBelajar, { nama: "", jumlah: "" }],
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
        Simpan Profil Siswa
      </Button>
    </form>
  );
}
