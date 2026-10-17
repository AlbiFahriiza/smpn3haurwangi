import type { MetadataRoute } from "next";
import { absoluteUrl, NAV_ORDER, ROUTES } from "@/lib/site";

/** Ambil tanggal modifikasi konten terbaru dari berkas seed data/content. */
async function lastContentUpdate(): Promise<Date> {
  try {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "data", "content");
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    const times = await Promise.all(
      files.map(async (f) => (await fs.stat(path.join(dir, f))).mtime),
    );
    if (times.length) return new Date(Math.max(...times.map((t) => t.getTime())));
  } catch {
    // Berkas data tidak terbaca (mis. runtime tanpa folder data) → pakai waktu build.
  }
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await lastContentUpdate();

  const priority: Record<string, number> = {
    [ROUTES.beranda.path]: 1,
    [ROUTES.tentang.path]: 0.8,
    [ROUTES.galeri.path]: 0.7,
    [ROUTES.ekskul.path]: 0.6,
    [ROUTES.kontak.path]: 0.6,
  };

  const changeFrequency: Record<string, "weekly" | "monthly"> = {
    [ROUTES.beranda.path]: "weekly",
    [ROUTES.galeri.path]: "weekly",
    [ROUTES.tentang.path]: "monthly",
    [ROUTES.ekskul.path]: "monthly",
    [ROUTES.kontak.path]: "monthly",
  };

  return NAV_ORDER.map((key) => {
    const route = ROUTES[key];
    return {
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: changeFrequency[route.path] ?? "monthly",
      priority: priority[route.path] ?? 0.5,
    };
  });
}
