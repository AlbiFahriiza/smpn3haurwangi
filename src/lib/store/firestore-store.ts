import { promises as fs } from "fs";
import path from "path";
import type { AdminUserRecord, ContentStore, SessionRecord } from "./types";

/**
 * FirestoreStore — backend cloud untuk mekanisme data fleksibel.
 *
 * Terhubung memakai service account Firebase (file JSON, LOKASINYA dari env
 * FIREBASE_SERVICE_ACCOUNT; isi file tidak pernah dicetak ke log mana pun).
 * firebase-admin di-import secara dinamis agar modul ini aman dipakai di
 * lingkungan tanpa credentials (fallback LocalJsonStore yang akan aktif).
 *
 * Koleksi:
 * - content/{key}            : dokumen JSON per seksi (field `data` + `updatedAt`)
 * - admin_users/{username}   : record admin (name, role, passwordHash)
 * - sessions/{token}         : sesi login admin
 */

type FirestoreLike = {
  collection: (name: string) => {
    doc: (id: string) => {
      get: () => Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined }>;
      set: (data: Record<string, unknown>) => Promise<unknown>;
      delete: () => Promise<unknown>;
    };
    limit: (n: number) => { get: () => Promise<{ empty: boolean }> };
  };
};

export function resolveServiceAccountPath(): string | null {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT,
    path.join(process.cwd(), "secrets", "firebase-service-account.json"),
  ].filter(Boolean) as string[];
  return candidates[0] ?? null;
}

async function loadAdmin() {
  // Dynamic import: firebase-admin tidak boleh membebani build tanpa credentials.
  const admin = await import("firebase-admin");
  const { getFirestore } = await import("firebase-admin/firestore");
  return { admin, getFirestore };
}

export class FirestoreStore implements ContentStore {
  readonly kind = "firestore" as const;
  private db: FirestoreLike;

  constructor(db: FirestoreLike) {
    this.db = db;
  }

  /**
   * Coba menyiapkan FirestoreStore. Mengembalikan null (bukan melempar error)
   * kalau credentials tidak ada, API belum diaktifkan, atau jaringan gagal;
   * pemanggil wajib fallback ke LocalJsonStore.
   */
  static async connect(timeoutMs = 4000): Promise<FirestoreStore | null> {
    const keyPath = resolveServiceAccountPath();
    if (!keyPath) return null;

    let serviceAccount: Record<string, unknown>;
    try {
      serviceAccount = JSON.parse(await fs.readFile(keyPath, "utf8"));
    } catch {
      return null;
    }

    try {
      const { admin, getFirestore } = await loadAdmin();
      const appName = "smpn3h-store";
      const app =
        admin.getApps().find((a) => a.name === appName) ??
        admin.initializeApp({ credential: admin.cert(serviceAccount as never) }, appName);
      const db = getFirestore(app as never) as unknown as FirestoreLike;

      // Health check: API Firestore disabled akan melempar PERMISSION_DENIED
      // di sini; balikkan null agar fallback lokal aktif.
      await withTimeout(
        db.collection("content").limit(1).get(),
        timeoutMs,
        "firestore health check timeout"
      );
      return new FirestoreStore(db);
    } catch {
      return null;
    }
  }

  async getContentSections(keys: readonly string[]): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    await Promise.all(
      keys.map(async (key) => {
        const safeKey = key.replace(/[^a-z0-9_-]/gi, "");
        if (!safeKey) return;
        try {
          const snap = await this.db.collection("content").doc(safeKey).get();
          if (snap.exists) {
            const data = snap.data();
            out[safeKey] = data?.["data"];
          }
        } catch {
          // Seksi gagal dibaca → biarkan null; komponen menampilkan fallback.
        }
      })
    );
    return out;
  }

  async updateContentSection(key: string, data: unknown): Promise<void> {
    const safeKey = key.replace(/[^a-z0-9_-]/gi, "");
    if (!safeKey) throw new Error("Kunci seksi tidak valid");
    await this.db.collection("content").doc(safeKey).set({
      data,
      updatedAt: new Date().toISOString(),
    });
  }

  async getAdminUser(username: string): Promise<AdminUserRecord | null> {
    try {
      const snap = await this.db.collection("admin_users").doc(username).get();
      if (!snap.exists) return null;
      const d = snap.data();
      return {
        username,
        name: String(d?.["name"] ?? ""),
        role: String(d?.["role"] ?? "admin"),
        passwordHash: String(d?.["passwordHash"] ?? ""),
      };
    } catch {
      return null;
    }
  }

  async putAdminUser(record: AdminUserRecord): Promise<void> {
    await this.db.collection("admin_users").doc(record.username).set({
      name: record.name,
      role: record.role,
      passwordHash: record.passwordHash,
      updatedAt: new Date().toISOString(),
    });
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.db.collection("sessions").doc(record.token).set({ ...record });
  }

  async getSession(token: string): Promise<SessionRecord | null> {
    try {
      const snap = await this.db.collection("sessions").doc(token).get();
      if (!snap.exists) return null;
      const d = snap.data();
      const expiresAt = String(d?.["expiresAt"] ?? "");
      if (new Date(expiresAt).getTime() < Date.now()) {
        await this.deleteSession(token);
        return null;
      }
      return { token, userId: String(d?.["userId"] ?? ""), expiresAt };
    } catch {
      return null;
    }
  }

  async deleteSession(token: string): Promise<void> {
    await this.db.collection("sessions").doc(token).delete();
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}
