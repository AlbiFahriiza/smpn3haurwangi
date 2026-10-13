import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { getSiteContent, SECTION_KEYS, type SectionKey } from "@/lib/content";
import { CONTENT_PAYLOAD_LIMIT } from "@/lib/store/types";

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

  const json = JSON.stringify(body.json);

  // Batas ukuran wajar untuk satu seksi konten (foto disimpan sebagai path/URL).
  if (json.length > CONTENT_PAYLOAD_LIMIT) {
    return NextResponse.json(
      { error: "Konten terlalu besar (maksimum 256 KB per seksi)." },
      { status: 413 }
    );
  }

  const store = await getStore();
  await store.updateContentSection(key, body.json);

  return NextResponse.json({ ok: true, key, backend: store.kind });
}
