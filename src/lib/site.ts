/**
 * Sumber kebenaran tunggal untuk rute publik dan metadata SEO situs.
 *
 * URL kanonik diambil dari NEXT_PUBLIC_SITE_URL (isi setelah domain final
 * ditentukan, mis. https://smpn3haurwangi.sch.id). Kalau tidak diisi, dipakai
 * domain produksi Vercel yang stabil, lalu domain deployment, lalu localhost.
 */
const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const vercelDeployment = process.env.VERCEL_URL;

export const SITE_URL = (
  explicitUrl ??
  (vercelProduction
    ? `https://${vercelProduction}`
    : vercelDeployment
      ? `https://${vercelDeployment}`
      : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE_NAME = "SMP Negeri 3 Haurwangi";
export const SITE_LOCALE = "id_ID";
export const SITE_LANGUAGE = "id-ID";

export interface SiteRoute {
  /** Path absolut halaman. */
  path: string;
  /** Label navigasi singkat. */
  label: string;
  /** Judul dokumen; template layout menambahkan nama situs. */
  title: string;
  /** Meta description, maksimal ~155 karakter. */
  description: string;
  /** Gambar pratinjau sosial (1200x630) di /public. */
  ogImage: string;
}

export const ROUTES = {
  beranda: {
    path: "/",
    label: "Beranda",
    title: "Website Resmi SMP Negeri 3 Haurwangi, Cianjur",
    description:
      "Website resmi SMP Negeri 3 Haurwangi, Kabupaten Cianjur (NPSN 20252209). Profil sekolah, guru, siswa, ekstrakurikuler, galeri, dan denah.",
    ogImage: "/og/beranda.jpg",
  },
  tentang: {
    path: "/tentang",
    label: "Tentang Sekolah",
    title: "Tentang Sekolah",
    description:
      "Sejarah, identitas resmi, visi misi, profil guru, dan data siswa SMP Negeri 3 Haurwangi, Cianjur. Berdiri 26 April 2006, terakreditasi B.",
    ogImage: "/og/tentang.jpg",
  },
  ekskul: {
    path: "/ekstrakurikuler",
    label: "Ekstrakurikuler",
    title: "Ekstrakurikuler",
    description:
      "Pramuka, Paskibra, bulu tangkis, bola voli, seni tari, dan PMR di SMP Negeri 3 Haurwangi beserta jadwal dan pembinanya.",
    ogImage: "/og/ekstrakurikuler.jpg",
  },
  galeri: {
    path: "/galeri",
    label: "Galeri",
    title: "Galeri Kegiatan",
    description:
      "Galeri foto kegiatan belajar, upacara bendera, keagamaan, dan pentas seni SMP Negeri 3 Haurwangi, Kabupaten Cianjur.",
    ogImage: "/og/galeri.jpg",
  },
  kontak: {
    path: "/kontak",
    label: "Kontak",
    title: "Kontak dan Lokasi",
    description:
      "Alamat, surel resmi, jam layanan, dan peta lokasi SMP Negeri 3 Haurwangi di Jalan Buniayu, Desa Kertamukti, Kecamatan Haurwangi, Cianjur.",
    ogImage: "/og/kontak.jpg",
  },
} as const satisfies Record<string, SiteRoute>;

export type RouteKey = keyof typeof ROUTES;

/** Urutan menu/navigasi situs. */
export const NAV_ORDER: RouteKey[] = ["beranda", "tentang", "ekskul", "galeri", "kontak"];

/** Peta kunci tab lama (footer JSON / tautan #tab=) ke path rute baru. */
export const TAB_TO_PATH: Record<string, string> = {
  beranda: ROUTES.beranda.path,
  tentang: ROUTES.tentang.path,
  ekskul: ROUTES.ekskul.path,
  galeri: ROUTES.galeri.path,
  kontak: ROUTES.kontak.path,
};

export function routeByPath(pathname: string): SiteRoute | undefined {
  const clean = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  return Object.values(ROUTES).find((route) => route.path === clean);
}

/** URL absolut untuk path internal. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
