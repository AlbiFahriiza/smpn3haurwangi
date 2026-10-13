"use client";

import type { ContactSection } from "@/lib/content";
import { MapPin, Mail, Phone, Clock, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function KontakTab({ content }: { content: Partial<KontakTabContent> }) {
  const contact = content.contact;
  const [terkirim, setTerkirim] = useState(false);
  const { toast } = useToast();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Formulir pesan tamu: sekolah belum punya backend email,
    // arahkan pengiriman ke alamat email resmi lewat mailto.
    const form = e.currentTarget;
    const data = new FormData(form);
    const nama = String(data.get("nama") ?? "");
    const pesan = String(data.get("pesan") ?? "");
    const email = contact?.email ?? "smpn3_haurwangi@yahoo.com";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Pesan dari ${nama} melalui website sekolah`
    )}&body=${encodeURIComponent(pesan)}`;
    setTerkirim(true);
    toast({
      title: "Aplikasi surel dibuka",
      description: "Lanjutkan pengiriman pesan dari aplikasi surel Anda.",
    });
  };

  return (
    <section aria-labelledby="kontak-title" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h1
          id="kontak-title"
          className="text-3xl md:text-4xl font-extrabold text-abyss tracking-tight"
        >
          Kontak
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[5fr_7fr] items-start">
          {/* Info kontak */}
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-foam p-5">
              <h2 className="text-sm font-bold text-abyss flex items-center gap-2">
                <MapPin className="w-4 h-4 text-marine" aria-hidden />
                Alamat
              </h2>
              <p className="mt-2.5 text-sm text-ink/85 leading-relaxed">
                {contact?.alamat ??
                  "Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi, Kab. Cianjur, Jawa Barat 43282"}
              </p>
              {contact?.mapsLink && (
                <a
                  href={contact.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-marine hover:underline focus-visible:outline-2 focus-visible:outline-marine rounded-sm"
                >
                  Buka di Google Maps
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                </a>
              )}
            </div>

            <ul className="rounded-lg border border-line bg-foam divide-y divide-line">
              {[
                {
                  ikon: Mail,
                  label: "Surel",
                  nilai: contact?.email ?? "smpn3_haurwangi@yahoo.com",
                  href: `mailto:${contact?.email ?? "smpn3_haurwangi@yahoo.com"}`,
                },
                {
                  ikon: Phone,
                  label: "Telepon",
                  nilai: contact?.telepon || "Belum tersedia",
                },
                {
                  ikon: Clock,
                  label: "Jam Layanan",
                  nilai: contact?.jamLayanan ?? "Senin-Jumat, 07.00-15.30 WIB",
                },
              ].map((row) => (
                <li key={row.label} className="flex items-start gap-3 p-5">
                  <row.ikon className="w-4 h-4 mt-0.5 text-marine shrink-0" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-ink">
                      {row.label}
                    </p>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="mt-0.5 block text-sm font-semibold text-abyss hover:text-marine transition-colors"
                      >
                        {row.nilai}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-abyss">{row.nilai}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Formulir pesan */}
            <form
              onSubmit={submit}
              className="rounded-lg border border-line bg-foam p-5 space-y-4"
            >
              <h2 className="text-sm font-bold text-abyss">Kirim Pesan</h2>
              <div className="space-y-1.5">
                <Label htmlFor="pesan-nama">Nama</Label>
                <Input
                  id="pesan-nama"
                  name="nama"
                  required
                  placeholder="Nama lengkap Anda"
                  autoComplete="name"
                  className="bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pesan-isi">Pesan</Label>
                <Textarea
                  id="pesan-isi"
                  name="pesan"
                  required
                  rows={4}
                  placeholder="Tulis pertanyaan, saran, atau masukan Anda"
                  className="bg-white resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2 bg-marine hover:bg-marine-hover text-white font-semibold"
              >
                <Send className="w-4 h-4" aria-hidden />
                {terkirim ? "Buka Aplikasi Surel" : "Kirim Pesan"}
              </Button>
              <p className="text-[11px] text-slate-ink">
                Pesan akan diteruskan ke surel resmi sekolah{" "}
                ({contact?.email ?? "smpn3_haurwangi@yahoo.com"}).
              </p>
            </form>
          </div>

          {/* Peta lokasi */}
          <div className="rounded-lg overflow-hidden border border-line bg-white lg:sticky lg:top-32">
            <iframe
              src={
                contact?.mapsEmbed ??
                "https://www.google.com/maps?q=-6.8005,107.3064&z=16&output=embed"
              }
              title="Peta lokasi SMP Negeri 3 Haurwangi"
              className="w-full h-[380px] md:h-[480px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <p className="flex items-center gap-2 px-4 py-3 text-xs text-slate-ink border-t border-line">
              <MapPin className="w-4 h-4 text-marine shrink-0" aria-hidden />
              Koordinat -6.8005, 107.3064, Desa Kertamukti, Kec. Haurwangi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type KontakTabContent = {
  contact: ContactSection;
};
