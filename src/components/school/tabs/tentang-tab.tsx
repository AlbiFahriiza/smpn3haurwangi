"use client";

import type { SiteContent } from "@/lib/content";
import { SejarahSection } from "../tentang/sejarah-section";
import { VisiMisiSection } from "../tentang/visi-misi-section";
import { GuruSection } from "../tentang/guru-section";
import { SiswaSection } from "../tentang/siswa-section";

export function TentangTab({ content }: { content: Partial<SiteContent> }) {
  return (
    <>
      <SejarahSection about={content.about} identity={content.identity} />
      <VisiMisiSection vision={content.vision} />
      <GuruSection teachers={content.teachers} />
      <SiswaSection students={content.students} />
    </>
  );
}
