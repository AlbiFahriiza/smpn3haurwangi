"use client";

import type { EkskulSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";
import { Reveal } from "@/components/motion/reveal";

/**
 * Daftar ekstrakurikuler versi lengkap. Tiap kegiatan punya warna sendiri di
 * berkas sekolah; warna itu dipakai sebagai penanda kecil di samping nama,
 * bukan sebagai latar besar, supaya palet halaman tetap tenang.
 *
 * Jadwal ditampilkan apa adanya seperti tertulis di berkas — "Jumat sore",
 * "Sabtu", "Latihan mingguan" — bukan diseragamkan menjadi jam yang tidak
 * pernah dicatat sekolah.
 */
export function EkskulDaftarChapter({ ekskul }: { ekskul?: EkskulSection }) {
  const items = ekskul?.items ?? [];

  if (items.length === 0) return null;

  const pembinaKosong = items.every((item) => !item.pembina || item.pembina === "-");

  return (
    <Chapter field="foam" nav="light" pad="tall" id="daftar-ekskul">
      <Inner>
        <Reveal stagger={0.08}>
          <h2 data-reveal-item className="t-head">
            Enam kegiatan
          </h2>
          <p data-reveal-item className="t-body field-soft mt-7 max-w-[56ch]">
            Semuanya berjalan di luar jam pelajaran. Pramuka wajib bagi seluruh siswa;
            selebihnya dipilih sesuai minat.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-x-16 gap-y-14 md:grid-cols-2">
          {items.map((item) => {
            const wajib = /wajib/i.test(`${item.deskripsi} ${item.jadwal}`);
            return (
              <li key={item.nama} data-reveal-item className="flex gap-5">
                <span
                  aria-hidden
                  className="mt-2.5 h-3 w-3 shrink-0"
                  style={{ background: item.warna }}
                />
                <div className="min-w-0">
                  <h3 className="t-statement">{item.nama}</h3>
                  <p className="t-small field-soft mt-1">
                    {item.jadwal}
                    {wajib ? " · wajib" : ""}
                    {item.pembina && item.pembina !== "-" ? ` · Pembina ${item.pembina}` : ""}
                  </p>
                  <p className="t-body mt-4 max-w-[46ch]">{item.deskripsi}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {pembinaKosong ? (
          <p className="t-small field-soft mt-16 max-w-[70ch]">
            Nama pembina tiap kegiatan belum tercatat pada berkas resmi sekolah, jadi tidak
            dicantumkan di sini.
          </p>
        ) : null}
      </Inner>
    </Chapter>
  );
}
