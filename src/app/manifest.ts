import type { MetadataRoute } from "next";
import { ROUTES, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ROUTES.beranda.title,
    short_name: "SMPN 3 Haurwangi",
    description:
      "Website resmi SMP Negeri 3 Haurwangi, Kabupaten Cianjur. Profil sekolah, guru, siswa, ekstrakurikuler, galeri, dan kontak.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b2e52",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
