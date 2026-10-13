import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

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

  const store = await getStore();
  const user = await store.getAdminUser(session.username);
  if (!user || !verifyPassword(passwordLama, user.passwordHash)) {
    return NextResponse.json(
      { error: "Kata sandi lama salah." },
      { status: 400 }
    );
  }

  await store.putAdminUser({ ...user, passwordHash: hashPassword(passwordBaru) });

  return NextResponse.json({ ok: true });
}
