import type { Field, NavTheme } from "@/components/motion/chapter-theme";

/**
 * Bidang pembuka tiap halaman dalam. Dipakai dua kali: oleh bab pembuka
 * halaman, dan sebagai warna awal batang navigasi. Kalau keduanya membaca
 * daftar yang sama, navigasi tidak sempat berkedip dengan warna yang salah
 * saat halaman pertama kali dimuat.
 */
export const BIDANG_PEMBUKA: Record<string, { field: Field; ink: NavTheme }> = {
  "/tentang": { field: "abyss", ink: "dark" },
  "/ekstrakurikuler": { field: "deep", ink: "dark" },
  "/galeri": { field: "ink", ink: "dark" },
  "/kontak": { field: "deep", ink: "dark" },
};

/** Warna awal beranda: bab pertamanya terang. */
export const BIDANG_AWAL_BERANDA = { field: "foam" as Field, ink: "light" as NavTheme };
