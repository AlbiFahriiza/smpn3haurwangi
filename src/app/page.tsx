import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/school/json-ld";
import { SiteShell } from "@/components/school/site-shell";
import { BerandaTab } from "@/components/school/tabs/beranda-tab";

export const metadata: Metadata = buildPageMetadata(ROUTES.beranda);

// Konten beranda disajikan statis lalu disegarkan berkala; panel admin juga
// memanggil revalidatePath setelah menyimpan perubahan.
export const revalidate = 60;

export default async function BerandaPage() {
  const content = await getSiteContent();

  return (
    <SiteShell content={content}>
      <JsonLd data={webPageJsonLd(ROUTES.beranda)} />
      <BerandaTab content={content} />
    </SiteShell>
  );
}
