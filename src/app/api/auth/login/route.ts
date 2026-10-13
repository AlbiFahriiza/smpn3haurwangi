import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

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

  const user = await db.adminUser.findUnique({ where: { username } });
  // Pesan seragam agar tidak membocorkan keberadaan akun.
  const invalid = NextResponse.json(
    { error: "Nama pengguna atau kata sandi salah." },
    { status: 401 }
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return invalid;
  }

  await createSession(user.id);
  return NextResponse.json({
    user: { username: user.username, name: user.name, role: user.role },
  });
}
