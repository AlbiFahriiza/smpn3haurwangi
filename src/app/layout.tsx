import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SMP Negeri 3 Haurwangi — Kabupaten Cianjur",
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
      "Unggul dalam prestasi, santun dalam perilaku — website resmi SMP Negeri 3 Haurwangi, Kabupaten Cianjur.",
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
        className={`${jakartaSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
