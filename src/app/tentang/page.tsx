import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { aboutPageJsonLd, breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/school/json-ld";
import { SiteShell } from "@/components/school/site-shell";
import { TentangTab } from "@/components/school/tabs/tentang-tab";

export const metadata: Metadata = buildPageMetadata(ROUTES.tentang);
export const revalidate = 60;

export default async function TentangPage() {
  const content = await getSiteContent();

  return (
    <SiteShell content={content}>
      <JsonLd
        data={[aboutPageJsonLd(ROUTES.tentang, content.teachers), breadcrumbJsonLd(ROUTES.tentang)]}
      />
      <TentangTab content={content} />
    </SiteShell>
  );
}
