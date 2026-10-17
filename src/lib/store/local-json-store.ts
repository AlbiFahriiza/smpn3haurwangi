import { promises as fs } from "fs";
import path from "path";
import { Mutex } from "./mutex";
import type { AdminUserRecord, ContentStore, SessionRecord } from "./types";

/**
 * LocalJsonStore — backend berkas untuk mekanisme data fleksibel.
 *
 * Dipakai saat Firestore belum tersedia (tanpa service account / API belum
 * diaktifkan) sehingga situs tetap bisa dibaca dan diedit secara lokal.
 * Juga menjadi sumber seed saat Firestore pertama kali tersambung
 * (lihat seedFirestoreFromLocal di src/lib/store/index.ts).
 *
 * Berkas:
 * - data/content/{key}.json : satu berkas JSON per seksi konten
 * - data/admin.json        : map username -> AdminUserRecord
 * - data/sessions.json     : map token -> SessionRecord
 */

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_DIR = path.join(DATA_DIR, "content");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

/** Kunci seksi dipakai sebagai nama berkas; samakan dengan FirestoreStore. */
function safeKey(key: string): string {
  return key.replace(/[^a-z0-9_-]/gi, "");
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    // Berkas belum ada atau rusak → pakai nilai awal, jangan gagalkan request.
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  // Tulis ke berkas sementara lalu rename agar pembaca tidak melihat isi separuh.
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export class LocalJsonStore implements ContentStore {
  readonly kind = "local" as const;
  private mutex = new Mutex();

  async getContentSections(keys: readonly string[]): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    await Promise.all(
      keys.map(async (key) => {
        const slug = safeKey(key);
        if (!slug) return;
        const data = await readJson<unknown>(path.join(CONTENT_DIR, `${slug}.json`), undefined);
        if (data !== undefined) out[slug] = data;
      })
    );
    return out;
  }

  async updateContentSection(key: string, data: unknown): Promise<void> {
    const slug = safeKey(key);
    if (!slug) throw new Error("Kunci seksi tidak valid");
    await this.mutex.run(() => writeJson(path.join(CONTENT_DIR, `${slug}.json`), data));
  }

  async getAdminUser(username: string): Promise<AdminUserRecord | null> {
    const users = await readJson<Record<string, AdminUserRecord>>(ADMIN_FILE, {});
    return users[username] ?? null;
  }

  async putAdminUser(record: AdminUserRecord): Promise<void> {
    await this.mutex.run(async () => {
      const users = await readJson<Record<string, AdminUserRecord>>(ADMIN_FILE, {});
      users[record.username] = { ...record };
      await writeJson(ADMIN_FILE, users);
    });
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.mutex.run(async () => {
      const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
      sessions[record.token] = record;
      await writeJson(SESSIONS_FILE, sessions);
    });
  }

  async getSession(token: string): Promise<SessionRecord | null> {
    const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
    const session = sessions[token];
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await this.deleteSession(token);
      return null;
    }
    return session;
  }

  async deleteSession(token: string): Promise<void> {
    await this.mutex.run(async () => {
      const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
      if (!(token in sessions)) return;
      delete sessions[token];
      await writeJson(SESSIONS_FILE, sessions);
    });
  }
}
