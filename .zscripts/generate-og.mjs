#!/usr/bin/env node
/**
 * Membuat aset SEO dari file asli di public/images:
 *   - public/og/*.jpg            gambar pratinjau sosial 1200x630 per halaman
 *   - public/icons/maskable-512.png  ikon maskable Android (adaptive icon)
 *
 * Favicon dan ikon aplikasi web memakai paket resmi sekolah (favicon_io) yang
 * sudah dipasang di src/app/{favicon.ico,icon.png,apple-icon.png} dan
 * public/icons/icon-{192,512}.png — tidak dibuat ulang di sini.
 *
 * Warna brand dibaca dari src/app/globals.css (token oklch) supaya tidak
 * menyimpang dari tema situs. Jalankan: node .zscripts/generate-og.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const abs = (p) => path.join(ROOT, p);

/* ---------------------------------------------------------------- warna --- */
function oklchToHex(l, c, h) {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  const lin = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];

  const channel = lin.map((v) => {
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, g)) * 255);
  });

  return `#${channel.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function readTokens() {
  const css = fs.readFileSync(abs("src/app/globals.css"), "utf8");
  const tokens = {};
  const re = /--([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  for (const [, name, l, c, h] of css.matchAll(re)) {
    tokens[name] = oklchToHex(Number(l), Number(c), Number(h));
  }
  return {
    abyss: tokens.abyss ?? "#16355c",
    abyssDeep: tokens["abyss-deep"] ?? "#102a4a",
    marine: tokens.marine ?? "#1d5da8",
    sky: tokens.sky ?? "#e8f0fa",
    foam: tokens.foam ?? "#f8fafc",
  };
}

/* ----------------------------------------------------------------- teks --- */
/** Perkiraan lebar teks Noto Sans Bold: rata-rata ~0.55em per karakter. */
function wrap(text, fontSize, maxWidth, bold = true) {
  const factor = bold ? 0.56 : 0.5;
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length * fontSize * factor > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Pilih ukuran font terbesar (<= max) yang membuat semua baris muat. */
function fitLines(text, maxWidth, max, min) {
  for (let size = max; size >= min; size -= 2) {
    const lines = wrap(text, size, maxWidth);
    if (lines.every((l) => l.length * size * 0.56 <= maxWidth)) return { size, lines };
  }
  return { size: min, lines: wrap(text, min, maxWidth) };
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* -------------------------------------------------------------- halaman --- */
const PAGES = [
  {
    file: "beranda",
    kicker: "WEBSITE RESMI",
    title: "SMP Negeri 3 Haurwangi",
    sub: "Kabupaten Cianjur · NPSN 20252209",
    photo: "public/images/hero/gerbang-utama.jpg",
  },
  {
    file: "tentang",
    kicker: "PROFIL SEKOLAH",
    title: "Tentang Sekolah",
    sub: "Sejarah, visi misi, guru, dan siswa",
    photo: "public/images/galeri/foto-bersama-guru-1.jpg",
  },
  {
    file: "ekstrakurikuler",
    kicker: "PENGEMBANGAN DIRI",
    title: "Ekstrakurikuler",
    sub: "Pramuka, Paskibra, voli, tari, dan PMR",
    photo: "public/images/galeri/kegiatan-siswa-1.jpg",
  },
  {
    file: "galeri",
    kicker: "DOKUMENTASI",
    title: "Galeri Kegiatan",
    sub: "Kegiatan belajar dan acara sekolah",
    photo: "public/images/galeri/kegiatan-belajar-2.jpg",
  },
  {
    file: "kontak",
    kicker: "HUBUNGI KAMI",
    title: "Kontak & Lokasi",
    sub: "Jalan Buniayu, Kertamukti, Haurwangi",
    photo: "public/images/galeri/apel-sekolah.jpg",
  },
];

const CANVAS = { width: 1200, height: 630 };
const COL = { width: 560, padding: 64 };
const PHOTO = { left: 600, width: 600, height: 630 };
const CONTENT_WIDTH = COL.width - COL.padding * 2;

async function buildOg(page, tokens, logoDataUri) {
  const { size, lines } = fitLines(page.title, CONTENT_WIDTH, 52, 34);
  const lineHeight = Math.round(size * 1.14);
  const titleTop = 246;
  const titleSvg = lines
    .map(
      (line, i) =>
        `<text x="${COL.padding}" y="${titleTop + i * lineHeight}" font-family="Noto Sans" font-weight="bold" font-size="${size}" fill="#ffffff">${esc(line)}</text>`,
    )
    .join("");

  const subTop = titleTop + (lines.length - 1) * lineHeight + 54;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}">
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="${tokens.abyss}"/>
  <rect x="0" y="0" width="${COL.width}" height="${CANVAS.height}" fill="${tokens.abyss}"/>
  <rect x="${COL.padding}" y="186" width="72" height="6" rx="3" fill="${tokens.marine}"/>
  <text x="${COL.padding + 116}" y="120" font-family="Noto Sans" font-weight="bold" font-size="20" letter-spacing="3" fill="${tokens.sky}" opacity="0.85">${esc(page.kicker)}</text>
  <rect x="${COL.padding}" y="64" width="96" height="96" rx="20" fill="#ffffff"/>
  <image x="${COL.padding + 12}" y="76" width="72" height="72" href="${logoDataUri}"/>
  ${titleSvg}
  <text x="${COL.padding}" y="${subTop}" font-family="Noto Sans" font-size="21" fill="${tokens.sky}" opacity="0.9">${esc(page.sub)}</text>
  <rect x="0" y="0" width="6" height="${CANVAS.height}" fill="${tokens.marine}"/>
</svg>`;

  const photo = await sharp(abs(page.photo))
    .resize(PHOTO.width, PHOTO.height, { fit: "cover", position: "center" })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: photo, left: PHOTO.left, top: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(abs(`public/og/${page.file}.jpg`));
}

/* ----------------------------------------------------------------- main --- */
async function main() {
  const tokens = readTokens();
  fs.mkdirSync(abs("public/og"), { recursive: true });
  fs.mkdirSync(abs("public/icons"), { recursive: true });

  const logoDataUri = `data:image/png;base64,${fs
    .readFileSync(abs("public/images/logo.png"))
    .toString("base64")}`;

  for (const page of PAGES) {
    if (!fs.existsSync(abs(page.photo))) throw new Error(`Foto tidak ada: ${page.photo}`);
    await buildOg(page, tokens, logoDataUri);
    console.log(`og  public/og/${page.file}.jpg`);
  }

  // Favicon & ikon web app memakai paket resmi dari sekolah (favicon_io):
  // src/app/{favicon.ico,icon.png,apple-icon.png} dan public/icons/icon-*.png.
  // Script ini hanya melengkapi varian maskable (Android adaptive icon) dan
  // gambar pratinjau sosial, tidak menimpa ikon resmi tersebut.
  const logoSquare = await sharp(abs("public/images/logo.png"))
    .resize(512, 512, { fit: "contain" })
    .png()
    .toBuffer();

  const maskableInner = await sharp(logoSquare).resize(410, 410).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: "#ffffff" } })
    .composite([{ input: maskableInner, top: 51, left: 51 }])
    .png({ compressionLevel: 9 })
    .toFile(abs("public/icons/maskable-512.png"));

  console.log("Ikon: public/icons/maskable-512.png");
  console.log("Warna brand:", JSON.stringify(tokens));
}

await main();
