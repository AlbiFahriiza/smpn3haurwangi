import { cookies } from "next/headers";
import { getStore } from "@/lib/store";
import { newSessionToken } from "@/lib/password";
import { SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/store/types";

export interface AdminSession {
  username: string;
  name: string;
  role: string;
}

/** Buat sesi admin baru (token acak 256-bit, cookie HttpOnly 24 jam). */
export async function createSession(username: string): Promise<void> {
  const store = await getStore();
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await store.createSession({ token, userId: username, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/",
  });
}

/** Hapus sesi aktif (logout). */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const store = await getStore();
    await store.deleteSession(token).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

/** Validasi sesi dari cookie untuk request berjalan; null bila tidak sah. */
export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const store = await getStore();
  const session = await store.getSession(token);
  if (!session) return null;
  const user = await store.getAdminUser(session.userId);
  if (!user) return null;
  return { username: user.username, name: user.name, role: user.role };
}
