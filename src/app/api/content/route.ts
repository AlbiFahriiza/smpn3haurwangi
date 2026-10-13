import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSiteContent, SECTION_KEYS, type SectionKey } from "@/lib/content";

/** GET /api/content — konten publik seluruh seksi. */
export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

/**
 * PUT /api/content — perbarui satu seksi (hanya admin yang login).
 * Body: { key: string, json: unknown }
 */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Anda harus login untuk mengubah konten." },
      { status: 401 }
    );
  }

  let body: { key?: string; json?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const key = body.key as SectionKey | undefined;
  if (!key || !SECTION_KEYS.includes(key)) {
    return NextResponse.json({ error: "Kunci seksi tidak dikenal." }, { status: 400 });
  }

  // Validasi dasar: json harus objek yang bisa diserialisasi.
  if (body.json === null || typeof body.json !== "object" || Array.isArray(body.json)) {
    return NextResponse.json(
      { error: "Konten harus berupa objek JSON." },
      { status: 400 }
    );
  }

  const json = JSON.stringify(body.json, null, 2);

  // Batas ukuran wajar untuk satu seksi konten (foto disimpan sebagai path/URL).
  if (json.length > 512_000) {
    return NextResponse.json(
      { error: "Konten terlalu besar (maksimum sekitar 500 KB)." },
      { status: 413 }
    );
  }

  await db.contentSection.upsert({
    where: { key },
    update: { json },
    create: { key, json },
  });

  return NextResponse.json({ ok: true, key });
}
