"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Identity, RoutinesSection } from "@/lib/content";
import { Chapter, Inner } from "./chapter";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
type Day = (typeof DAYS)[number];

const NO_REDUCE = "(prefers-reduced-motion: no-preference)";

/**
 * Hari-hari yang tercakup oleh sebuah baris rutinitas, dibaca apa adanya dari
 * kolom waktu pada data resmi sekolah. Tidak ada hari yang dikarang: kalau
 * waktunya tidak menyebut hari, baris itu tidak muncul di tab hari mana pun.
 */
function daysFor(waktu: string): Day[] {
  const text = waktu.toLowerCase();
  if (text.includes("akhir tahun")) return [];
  if (/senin\s*[-–]\s*jumat/.test(text)) return DAYS.slice(0, 5) as Day[];
  if (text.includes("setiap hari")) return DAYS.slice(0, 5) as Day[];
  return DAYS.filter((day) => text.includes(day.toLowerCase()));
}

function clock(waktu: string): string {
  const match = waktu.match(/\d{2}\.\d{2}(?:\s*-\s*\d{2}\.\d{2})?/);
  return match ? match[0].replace(/\s/g, "") : "";
}

/**
 * Bab rutinitas: tab hari di atas, agenda hari itu turun sebagai linimasa
 * pita bergantian nada dengan penanda jam di kepalanya. Inilah satu hal yang
 * benar-benar bisa dimainkan pengunjung, dan isinya seluruhnya jadwal resmi
 * sekolah.
 */
export function RutinitasChapter({
  routines,
  identity,
}: {
  routines?: RoutinesSection;
  identity?: Identity;
}) {
  const [day, setDay] = useState<Day>("Senin");
  const scope = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const items = routines?.items ?? [];
  const daily = items.filter((item) => daysFor(item.waktu).includes(day));
  const annual = items.filter((item) => daysFor(item.waktu).length === 0);
  const jamSekolah = clock(items.find((item) => item.waktu.includes("Senin-Jumat"))?.waktu ?? "");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        // Baris agenda masuk menumpang (stagger 0,055 detik) dan menetap
        // dengan ease expo.out, bukan berhenti kaku.
        gsap.from("[data-band]", {
          y: 14,
          opacity: 0,
          duration: 0.6,
          stagger: 0.055,
          ease: "expo.out",
        });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [day], revertOnUpdate: true },
  );

  const moveFocus = (index: number, direction: number) => {
    const next = (index + direction + DAYS.length) % DAYS.length;
    setDay(DAYS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <Chapter field="marine" nav="dark" pad="tall" id="rutinitas-sekolah">
      <Inner>
        <div ref={scope}>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <h2 className="t-head">{routines?.title ?? "Rutinitas Sekolah"}</h2>
            </div>
            <p className="t-body text-white/90 md:col-span-5">
              {routines?.description ??
                "Kegiatan rutin mingguan yang membentuk kedisiplinan dan karakter siswa."}
            </p>
          </div>

          {jamSekolah ? (
            <p className="t-small mt-6 text-white/90">
              {jamSekolah} WIB, lima hari sepekan, {identity?.penyelenggaraan ?? "Sehari Penuh / 5 Hari"}.
            </p>
          ) : null}

          {/* Tab hari */}
          <div
            role="tablist"
            aria-label="Pilih hari"
            className="mt-10 flex flex-wrap gap-2"
          >
            {DAYS.map((option, index) => {
              const active = option === day;
              return (
                <button
                  key={option}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  role="tab"
                  id={`hari-${option}`}
                  aria-selected={active}
                  aria-controls={`agenda-${option}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setDay(option)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      moveFocus(index, 1);
                    }
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveFocus(index, -1);
                    }
                  }}
                  className={`t-small rounded-md px-4 py-2.5 font-semibold transition active:translate-y-px ${
                    active
                      ? "bg-white text-marine"
                      : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Agenda hari terpilih */}
          <div
            role="tabpanel"
            id={`agenda-${day}`}
            aria-labelledby={`hari-${day}`}
            className="mt-6"
          >
            {daily.length === 0 ? (
              <p className="t-body text-white/90">
                Tidak ada kegiatan rutin terjadwal pada hari ini.
              </p>
            ) : (
              <ol className="space-y-2">
                {daily.map((item, index) => {
                  const jam = clock(item.waktu);
                  return (
                    <li
                      key={`${day}-${item.nama}`}
                      data-band
                      className={`grid gap-2 rounded-md px-5 py-5 transition-colors hover:bg-white/20 md:grid-cols-12 md:items-baseline md:gap-6 md:px-7 ${
                        index % 2 === 0 ? "bg-white/6" : "bg-white/14"
                      }`}
                    >
                      {/* Penanda jam: titik waktu dalam chip bergaris rambut.
                          Baris tanpa jam tetap memegang kolomnya agar larik
                          sejajar. */}
                      <p className="t-small tabular-nums font-semibold md:col-span-2">
                        {jam ? (
                          <span className="inline-flex rounded-md border border-white/40 bg-white/10 px-3 py-1.5">
                            {jam}
                          </span>
                        ) : null}
                      </p>
                      <p className="t-statement md:col-span-4">{item.nama}</p>
                      <p className="t-body text-white md:col-span-6">{item.deskripsi}</p>
                    </li>
                  );
                })}
              </ol>
            )}

            {annual.length > 0 && (
              <div className="mt-8 space-y-3">
                {annual.map((item) => (
                  <p key={item.nama} className="t-small text-white/90">
                    <span className="font-semibold text-white">Sekali setahun.</span>{" "}
                    {item.nama}. {item.deskripsi}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Inner>
    </Chapter>
  );
}
