import { promises as fs } from "fs";
import path from "path";
import { LocalJsonStore } from "./local-json-store";
import { FirestoreStore } from "./firestore-store";
import { hashPassword } from "@/lib/password";
import type { ContentStore } from "./types";

/**
 * Pemilih backend penyimpanan (SEKALI per proses):
 * 1. Coba Firestore via service account (mekanisme fleksibel cloud).
 * 2. Gagal / belum diaktifkan → LocalJsonStore (file JSON lokal).
 * 3. Saat Firestore AKTIF tapi masih kosong → auto-seed dari data/content/*.json
 *    sehingga konten riset terverifikasi ikut naik ke cloud tanpa kerja manual.
 *
 * Hasil pilihan di-cache di globalThis agar stabil saat hot-reload dev server.
 */

interface StoreCache {
  store?: Promise<ContentStore>;
}

const g = globalThis as unknown as { __smpn3hStore?: StoreCache };
const cache: StoreCache = (g.__smpn3hStore ??= {});

const CONTENT_DIR = path.join(process.cwd(), "data", "content");

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "smpn3haurwangi2026"; // wajib dig guru setelah login pertama

async function bootstrapAdmin(store: ContentStore): Promise<void> {
  try {
    const existing = await store.getAdminUser(DEFAULT_ADMIN_USERNAME);
    if (existing) return;
    await store.putAdminUser({
      username: DEFAULT_ADMIN_USERNAME,
      name: "Administrator Sekolah",
      role: "admin",
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    });
  } catch (error) {
    // Di lingkungan dengan berkas hanya-baca (mis. serverless), pembuatan akun
    // awal gagal. Situs tetap harus bisa dibaca; kelola admin lewat Firestore.
    console.warn("[store] Gagal menyiapkan akun admin awal:", error);
  }
}

async function seedFirestoreFromLocal(store: ContentStore): Promise<void> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    for (const file of jsonFiles) {
      const key = file.replace(/\.json$/, "");
      const existing = await store.getContentSections([key]);
      if (existing[key] === undefined) {
        const data = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, file), "utf8"));
        await store.updateContentSection(key, data);
      }
    }
  } catch {
    // Seed bersifat best-effort; jangan gagalkan proses utama.
  }
}

async function selectStore(): Promise<ContentStore> {
  const firestore = await FirestoreStore.connect();
  if (firestore) {
    console.log("[store] Firestore aktif (mode cloud)");
    await seedFirestoreFromLocal(firestore);
    await bootstrapAdmin(firestore);
    return firestore;
  }
  console.log("[store] Firestore belum tersedia, memakai JSON lokal (fallback)");
  const local = new LocalJsonStore();
  await bootstrapAdmin(local);
  return local;
}

/** Ambil singleton ContentStore untuk proses ini. */
export function getStore(): Promise<ContentStore> {
  cache.store ??= selectStore();
  return cache.store;
}

export type { ContentStore } from "./types";
