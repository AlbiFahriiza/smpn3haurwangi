/**
 * ContentStore — kontrak penyimpanan data fleksibel SMPN 3 Haurwangi.
 *
 * Dua implementasi:
 * - FirestoreStore: cloud, aktif otomatis saat API Firestore project aktif
 *   (mekanisme fleksibel via service account Firebase, tanpa credentials di repo).
 * - LocalJsonStore: fallback file JSON lokal (data/content/*.json) supaya situs
 *   selalu jalan; juga sumber seed saat Firestore pertama kali tersambung.
 *
 * Pemilihan backend dilakukan SEKALI per proses di getStore() (src/lib/store/index.ts).
 */

export interface AdminUserRecord {
  username: string;
  name: string;
  role: string;
  passwordHash: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: string; // ISO
}

export interface ContentStore {
  readonly kind: "firestore" | "local";

  /** Baca beberapa seksi konten sekaligus; seksi hilang → tidak ada di hasil. */
  getContentSections(keys: readonly string[]): Promise<Record<string, unknown>>;

  /** Tulis satu seksi konten (payload JSON sudah tervalidasi ukurannya). */
  updateContentSection(key: string, data: unknown): Promise<void>;

  getAdminUser(username: string): Promise<AdminUserRecord | null>;

  /** Simpan ulang seluruh record admin (termasuk hash kata sandi baru). */
  putAdminUser(record: AdminUserRecord): Promise<void>;

  createSession(record: SessionRecord): Promise<void>;
  getSession(token: string): Promise<SessionRecord | null>;
  deleteSession(token: string): Promise<void>;
}

export const SESSION_COOKIE = "smpn3h_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 jam
export const CONTENT_PAYLOAD_LIMIT = 256 * 1024; // 256 KB per seksi
