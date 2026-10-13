import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "SMP Negeri 3 Haurwangi | Kabupaten Cianjur",
  description:
    "Website resmi SMP Negeri 3 Haurwangi, Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi, Kab. Cianjur, Jawa Barat. NPSN 20252209. Profil sekolah, guru, siswa, ekstrakurikuler, galeri, dan denah sekolah.",
  keywords: [
    "SMPN 3 Haurwangi",
    "SMP Negeri 3 Haurwangi",
    "Cianjur",
    "Kertamukti",
    "sekolah",
    "website sekolah",
  ],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "SMP Negeri 3 Haurwangi",
    description:
      "Unggul dalam prestasi, santun dalam perilaku. Website resmi SMP Negeri 3 Haurwangi, Kabupaten Cianjur.",
    siteName: "SMP Negeri 3 Haurwangi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakartaSans.variable} ${sourceSerif.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
