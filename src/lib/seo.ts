import type { Metadata } from "next";
import type {
  ContactSection,
  FooterSection,
  GallerySection,
  Identity,
  TeachersSection,
} from "@/lib/content";
import {
  SITE_LOCALE,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  type SiteRoute,
} from "@/lib/site";

/**
 * Metadata & data terstruktur (JSON-LD) untuk seluruh halaman publik.
 *
 * Nilai identitas yang masuk ke data terstruktur sudah diverifikasi ke sumber
 * resmi Kemendikdasmen (referensi.data.kemendikdasmen.go.id / sekolah.data.
 * kemendikdasmen.go.id, NPSN 20252209): TMT SK operasional 26-04-2006, status
 * negeri, akreditasi B, luas tanah 6.138 m2, koordinat -6.8005/107.3064.
 * Field yang belum ada di data resmi (mis. nomor telepon) sengaja tidak
 * dicantumkan supaya tidak ada data karangan.
 */
const FOUNDING_DATE_ISO = "2006-04-26";

/** Metadata halaman: judul, deskripsi, kanonik, OpenGraph, dan Twitter Card. */
export function buildPageMetadata(route: SiteRoute): Metadata {
  const canonical = absoluteUrl(route.path);
  const image = { url: absoluteUrl(route.ogImage), width: 1200, height: 630, alt: route.label };
  const fullTitle = route.path === "/" ? route.title : `${route.title} | ${SITE_NAME}`;

  return {
    title: route.path === "/" ? { absolute: route.title } : route.title,
    description: route.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: fullTitle,
      description: route.description,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: route.description,
      images: [image.url],
    },
  };
}

function postalAddress(identity?: Identity) {
  return {
    "@type": "PostalAddress",
    streetAddress: "Jalan Buniayu",
    addressLocality: "Desa Kertamukti, Kecamatan Haurwangi",
    addressRegion: identity?.provinsi?.replace("Provinsi ", "") ?? "Jawa Barat",
    postalCode: identity?.kodePos ?? "43282",
    addressCountry: "ID",
  };
}

/** Profil sekolah resmi sebagai entitas organisasi pendidikan. */
export function organizationJsonLd({
  identity,
  contact,
  footer,
}: {
  identity?: Identity;
  contact?: ContactSection;
  footer?: FooterSection;
}) {
  const email = contact?.email ?? footer?.email ?? identity?.email;
  const sameAs = (contact?.sosial ?? [])
    .map((item) => item.url)
    .filter((url) => url.startsWith("http"));

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: identity?.nama ?? SITE_NAME,
    alternateName: "SMPN 3 Haurwangi",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/logo.png"),
      width: 512,
      height: 512,
    },
    image: absoluteUrl("/og/beranda.jpg"),
    ...(email ? { email } : {}),
    address: postalAddress(identity),
    geo: {
      "@type": "GeoCoordinates",
      latitude: identity?.lat ?? -6.8005,
      longitude: identity?.lng ?? 107.3064,
    },
    foundingDate: FOUNDING_DATE_ISO,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "NPSN",
      value: identity?.npsn ?? "20252209",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Situs sebagai entitas WebSite. */
export function websiteJsonLd({ identity }: { identity?: Identity }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: identity?.nama ?? SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Remah navigasi; halaman beranda tidak memerlukan item remah. */
export function breadcrumbJsonLd(route: SiteRoute) {
  const items = [
    { name: "Beranda", url: SITE_URL },
    ...(route.path === "/" ? [] : [{ name: route.label, url: absoluteUrl(route.path) }]),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function webPageBase(route: SiteRoute) {
  return {
    "@id": `${absoluteUrl(route.path)}#webpage`,
    url: absoluteUrl(route.path),
    name: route.path === "/" ? route.title : `${route.title} | ${SITE_NAME}`,
    description: route.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: SITE_LANGUAGE,
  };
}

/** Halaman beranda. */
export function webPageJsonLd(route: SiteRoute) {
  return { "@context": "https://schema.org", "@type": "WebPage", ...webPageBase(route) };
}

/** Halaman profil sekolah, termasuk daftar guru & staf yang dipublikasikan. */
export function aboutPageJsonLd(route: SiteRoute, teachers?: TeachersSection) {
  const people = (teachers?.items ?? []).map((guru) => ({
    "@type": "Person",
    name: guru.nama,
    jobTitle: guru.jabatan,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    ...(guru.foto ? { image: absoluteUrl(guru.foto) } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    ...webPageBase(route),
    ...(people.length ? { mentions: people } : {}),
  };
}

/** Halaman kontak & lokasi. */
export function contactPageJsonLd(route: SiteRoute, { contact }: { contact?: ContactSection; identity?: Identity }) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    ...webPageBase(route),
    ...(contact?.mapsLink ? { significantLink: contact.mapsLink } : {}),
    // Alamat dan jam layanan sudah ada di simpul organisasi (#organization).
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Halaman galeri sebagai kumpulan gambar kegiatan sekolah. */
export function imageGalleryJsonLd(route: SiteRoute, gallery?: GallerySection, limit = 16) {
  const images = (gallery?.items ?? []).slice(0, limit).map((item) => ({
    "@type": "ImageObject",
    contentUrl: absoluteUrl(item.src),
    name: item.judul,
    caption: item.judul,
    about: item.kategori,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    ...webPageBase(route),
    ...(images.length ? { image: images } : {}),
  };
}
