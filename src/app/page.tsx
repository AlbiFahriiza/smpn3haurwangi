import { getSiteContent } from "@/lib/content";
import { SchoolWebsite } from "@/components/school/school-website";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getSiteContent();
  return <SchoolWebsite initialContent={content} />;
}
