import { getStore } from "@/lib/store";

/**
 * Tipe konten website SMPN 3 Haurwangi.
 * Seluruh konten disimpan per-seksi sebagai dokumen JSON via ContentStore
 * (Firestore cloud saat aktif, file JSON lokal sebagai fallback).
 */

export interface Identity {
  nama: string;
  npsn: string;
  status: string;
  bentuk: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  berdiri: string;
  skPendirian: string;
  akreditasi: string;
  skAkreditasi: string;
  kepalaSekolah: string;
  operator: string;
  luasTanah: string;
  kurikulum: string;
  penyelenggaraan: string;
  lat: number;
  lng: number;
}

export interface HeroBadge {
  label: string;
  icon: string;
}

export interface HomeStat {
  label: string;
  value: string;
  sub: string;
}

export interface BeritaItem {
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

export interface HomeSection {
  hero: {
    title: string;
    subtitle: string;
    image: string;
    badges: HeroBadge[];
  };
  stats: HomeStat[];
  sambutan: {
    title: string;
    nama: string;
    jabatan: string;
    foto: string;
    teks: string[];
  };
  berita: BeritaItem[];
}

export interface DenahKeterangan {
  kode: string;
  nama: string;
}

export interface DenahFasilitas {
  nama: string;
  detail: string;
}

export interface DenahSection {
  title: string;
  description: string;
  image: string;
  keterangan: DenahKeterangan[];
  fasilitas: DenahFasilitas[];
}

export interface RoutineItem {
  nama: string;
  waktu: string;
  deskripsi: string;
  ikon: string;
}

export interface RoutinesSection {
  title: string;
  description: string;
  items: RoutineItem[];
}

export interface AboutSection {
  sejarah: string[];
  sambutanTeks: string;
}

export interface VisionSection {
  catatan: string;
  visi: string;
  misi: string[];
  tujuan: string[];
  motto: string;
}

export interface TeacherItem {
  nama: string;
  jabatan: string;
  mapel: string;
  foto: string;
  deskripsi: string;
}

export interface TeacherStat {
  label: string;
  value: string;
}

export interface TeachersSection {
  catatan: string;
  items: TeacherItem[];
  statistik: TeacherStat[];
}

export interface KelasItem {
  kelas: string;
  jumlah: number;
  waliKelas: string;
}

export interface FasilitasItem {
  nama: string;
  jumlah: string;
}

export interface StudentsSection {
  catatan: string;
  total: number;
  lakiLaki: number;
  perempuan: number;
  rombel: number;
  rasioKelas: number;
  kelas: KelasItem[];
  fasilitasBelajar: FasilitasItem[];
}

export interface EkskulItem {
  nama: string;
  jadwal: string;
  pembina: string;
  deskripsi: string;
  ikon: string;
  warna: string;
}

export interface EkskulSection {
  title: string;
  description: string;
  items: EkskulItem[];
}

export interface GalleryItem {
  src: string;
  judul: string;
  kategori: string;
  tanggal: string;
}

export interface GallerySection {
  title: string;
  description: string;
  kategori: string[];
  items: GalleryItem[];
}

export interface ContactSection {
  alamat: string;
  email: string;
  telepon: string;
  jamLayanan: string;
  mapsEmbed: string;
  mapsLink: string;
  sosial: { nama: string; url: string; ikon: string }[];
}

export interface FooterLink {
  label: string;
  tab: string;
}

export interface FooterSection {
  nama: string;
  tagline: string;
  npsn: string;
  alamat: string;
  email: string;
  akreditasi: string;
  berdiri: string;
  tautan: FooterLink[];
  credit: string;
}

export interface SiteContent {
  identity: Identity;
  home: HomeSection;
  denah: DenahSection;
  routines: RoutinesSection;
  about: AboutSection;
  vision: VisionSection;
  teachers: TeachersSection;
  students: StudentsSection;
  ekskul: EkskulSection;
  gallery: GallerySection;
  contact: ContactSection;
  footer: FooterSection;
}

export const SECTION_KEYS = [
  "identity",
  "home",
  "denah",
  "routines",
  "about",
  "vision",
  "teachers",
  "students",
  "ekskul",
  "gallery",
  "contact",
  "footer",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Ambil seluruh konten dari store; seksi yang hilang menghasilkan null. */
export async function getSiteContent(): Promise<Partial<SiteContent>> {
  const store = await getStore();
  const raw = await store.getContentSections(SECTION_KEYS);
  const content: Record<string, unknown> = {};
  for (const key of SECTION_KEYS) {
    content[key] = raw[key] ?? null;
  }
  return content as Partial<SiteContent>;
}
