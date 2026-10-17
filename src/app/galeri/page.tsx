import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { ROUTES } from "@/lib/site";
import { breadcrumbJsonLd, buildPageMetadata, imageGalleryJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/school/json-ld";
import { SiteShell } from "@/components/school/site-shell";
import { GaleriTab } from "@/components/school/tabs/galeri-tab";

export const metadata: Metadata = buildPageMetadata(ROUTES.galeri);
export const revalidate = 60;

export default async function GaleriPage() {
  const content = await getSiteContent();

  return (
    <SiteShell content={content}>
      <JsonLd
        data={[imageGalleryJsonLd(ROUTES.galeri, content.gallery), breadcrumbJsonLd(ROUTES.galeri)]}
      />
      <GaleriTab content={content} />
    </SiteShell>
  );
}
