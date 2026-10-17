import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { breadcrumbJsonLd, buildPageMetadata, contactPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/school/json-ld";
import { SiteShell } from "@/components/school/site-shell";
import { KontakTab } from "@/components/school/tabs/kontak-tab";

export const metadata: Metadata = buildPageMetadata(ROUTES.kontak);
export const revalidate = 60;

export default async function KontakPage() {
  const content = await getSiteContent();

  return (
    <SiteShell content={content}>
      <JsonLd
        data={[
          contactPageJsonLd(ROUTES.kontak, { contact: content.contact, identity: content.identity }),
          breadcrumbJsonLd(ROUTES.kontak),
        ]}
      />
      <KontakTab content={content} />
    </SiteShell>
  );
}
