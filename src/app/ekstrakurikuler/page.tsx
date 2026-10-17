import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { breadcrumbJsonLd, buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/school/json-ld";
import { SiteShell } from "@/components/school/site-shell";
import { EkskulTab } from "@/components/school/tabs/ekskul-tab";

export const metadata: Metadata = buildPageMetadata(ROUTES.ekskul);
export const revalidate = 60;

export default async function EkstrakurikulerPage() {
  const content = await getSiteContent();

  return (
    <SiteShell content={content}>
      <JsonLd
        data={[webPageJsonLd(ROUTES.ekskul), breadcrumbJsonLd(ROUTES.ekskul)]}
      />
      <EkskulTab content={content} />
    </SiteShell>
  );
}
