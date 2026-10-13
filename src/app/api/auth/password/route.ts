import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 401 });
  }

  let body: { passwordLama?: string; passwordBaru?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const passwordLama = body.passwordLama ?? "";
  const passwordBaru = body.passwordBaru ?? "";

  if (passwordBaru.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi baru minimal 8 karakter." },
      { status: 400 }
    );
  }

  const user = await db.adminUser.findUnique({
    where: { username: session.username },
  });
  if (!user || !verifyPassword(passwordLama, user.passwordHash)) {
    return NextResponse.json(
      { error: "Kata sandi lama salah." },
      { status: 400 }
    );
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(passwordBaru) },
  });

  return NextResponse.json({ ok: true });
}
