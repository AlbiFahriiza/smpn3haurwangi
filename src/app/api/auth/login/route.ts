import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCK_MS = 5 * 60 * 1000; // 5 menit

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const username = (body.username ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Nama pengguna dan kata sandi wajib diisi." },
      { status: 400 }
    );
  }

  // Throttle per username: cegah brute force tanpa membebani penyimpanan.
  const now = Date.now();
  const record = attempts.get(username);
  if (record && record.until > now && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 5 menit." },
      { status: 429 }
    );
  }

  const store = await getStore();
  const user = await store.getAdminUser(username);
  // Pesan seragam agar tidak membocorkan keberadaan akun.
  const invalid = NextResponse.json(
    { error: "Nama pengguna atau kata sandi salah." },
    { status: 401 }
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    const next = record && record.until > now ? record.count + 1 : 1;
    attempts.set(username, { count: next, until: now + LOCK_MS });
    return invalid;
  }

  attempts.delete(username);
  await createSession(user.username);
  return NextResponse.json({
    user: { username: user.username, name: user.name, role: user.role },
  });
}
