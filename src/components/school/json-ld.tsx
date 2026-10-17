/**
 * Menyisipkan data terstruktur JSON-LD ke dalam dokumen.
 * Karakter "<" di-escape agar isi tidak bisa menutup tag <script>.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
