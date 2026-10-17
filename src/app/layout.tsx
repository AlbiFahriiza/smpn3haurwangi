import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getSiteContent } from "@/lib/content";
import { ROUTES, SITE_LOCALE, SITE_NAME, SITE_URL } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/school/json-ld";

const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic", "normal"],
  // Hanya halaman Tentang yang memakai serif; beranda tidak perlu memuatnya.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: ROUTES.beranda.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: ROUTES.beranda.description,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: SITE_URL,
    images: [
      {
        url: ROUTES.beranda.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0b2e52",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${grotesk.variable} ${sourceSerif.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* Data terstruktur tingkat situs: profil sekolah dan situs web. */}
        <JsonLd
          data={[
            organizationJsonLd({
              identity: content.identity,
              contact: content.contact,
              footer: content.footer,
            }),
            websiteJsonLd({ identity: content.identity }),
          ]}
        />
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster />
      </body>
    </html>
  );
}
