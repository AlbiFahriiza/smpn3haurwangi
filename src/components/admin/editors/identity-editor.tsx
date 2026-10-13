"use client";

import { useState } from "react";
import type { Identity } from "@/lib/content";
import { TextField, TextAreaField, ImageField } from "../fields";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function IdentityEditor({
  data,
  onSave,
}: {
  data?: Identity;
  onSave: (json: Identity) => void;
}) {
  const [form, setForm] = useState<Identity>(
    data ?? {
      nama: "",
      npsn: "",
      status: "Negeri",
      bentuk: "SMP",
      alamat: "",
      kabupaten: "",
      provinsi: "",
      kodePos: "",
      telepon: "",
      email: "",
      berdiri: "",
      skPendirian: "",
      akreditasi: "",
      skAkreditasi: "",
      kepalaSekolah: "",
      operator: "",
      luasTanah: "",
      kurikulum: "",
      penyelenggaraan: "",
      lat: -6.8005,
      lng: 107.3064,
    }
  );
  const [menyimpan, setMenyimpan] = useState(false);
  const set = (k: keyof Identity) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="space-y-4 max-w-2xl"
      onSubmit={async (e) => {
        e.preventDefault();
        setMenyimpan(true);
        onSave({ ...form, lat: Number(form.lat), lng: Number(form.lng) });
        setMenyimpan(false);
      }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Nama Sekolah" value={form.nama} onChange={set("nama")} />
        <TextField label="NPSN" value={form.npsn} onChange={set("npsn")} />
        <TextAreaField label="Alamat" value={form.alamat} onChange={set("alamat")} rows={2} />
        <div className="space-y-4">
          <TextField label="Kabupaten" value={form.kabupaten} onChange={set("kabupaten")} />
          <TextField label="Provinsi" value={form.provinsi} onChange={set("provinsi")} />
        </div>
        <TextField label="Kode Pos" value={form.kodePos} onChange={set("kodePos")} />
        <TextField label="Status" value={form.status} onChange={set("status")} />
        <TextField label="Telepon" value={form.telepon} onChange={set("telepon")} />
        <TextField label="Surel (Email)" type="email" value={form.email} onChange={set("email")} />
        <TextField label="Tanggal Berdiri" value={form.berdiri} onChange={set("berdiri")} />
        <TextField label="SK Pendirian" value={form.skPendirian} onChange={set("skPendirian")} />
        <TextField label="Akreditasi" value={form.akreditasi} onChange={set("akreditasi")} />
        <TextField label="SK Akreditasi" value={form.skAkreditasi} onChange={set("skAkreditasi")} />
        <TextField label="Kepala Sekolah" value={form.kepalaSekolah} onChange={set("kepalaSekolah")} />
        <TextField label="Operator" value={form.operator} onChange={set("operator")} />
        <TextField label="Luas Tanah" value={form.luasTanah} onChange={set("luasTanah")} />
        <TextField label="Kurikulum" value={form.kurikulum} onChange={set("kurikulum")} />
        <TextField
          label="Penyelenggaraan"
          value={form.penyelenggaraan}
          onChange={set("penyelenggaraan")}
        />
        <TextField
          label="Lintang (Latitude)"
          value={String(form.lat)}
          onChange={(v) => setForm((f) => ({ ...f, lat: Number(v) || 0 }))}
          type="number"
          hint="Koordinat peta, mis. -6.8005"
        />
        <TextField
          label="Bujur (Longitude)"
          value={String(form.lng)}
          onChange={(v) => setForm((f) => ({ ...f, lng: Number(v) || 0 }))}
          type="number"
          hint="Koordinat peta, mis. 107.3064"
        />
      </div>
      <Button type="submit" disabled={menyimpan} className="gap-2">
        {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
        Simpan Identitas
      </Button>
    </form>
  );
}
