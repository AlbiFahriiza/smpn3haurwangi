# DESIGN.md — Redesign v2 "Kelas Biru" (total overhaul)

> Inkumben v1 (azure+navy+emas, Plus Jakarta Sans) dibuang SELURUHNYA sebagai arah visual:
> aksen emas dihapus (brief user: biru-putih saja), pola SaaS-card dan eyebrow-labeling
> dihapus (AI-tell), mekanisme data dipindah dari Prisma/SQLite ke Firestore-first + JSON.

## Design Read
"Reading this as: public middle school website for parents & community in Cianjur,
trust-first institutional language, cool blue-white palette from the school's azure
logo, leaning toward civic-portal clarity (GOV.UK spirit) with editorial school
photography."

## Dials (taste-skill)
- DESIGN_VARIANCE: 5 (asimetri terkontrol, bukan chaos — sekolah = trust)
- MOTION_INTENSITY: 3 (fade/slide halus sekali di hero + hover states, tanpa orkestrasi berat)
- VISUAL_DENSITY: 4 (breathing, mobile-first)

## Token System

### Warna (satu aksen: azure logo; NETRAL dingin; tanpa emas/kuning sama sekali)
- `--sm-marine: #0A5CA8` (azure logo yang dikecilkan saturasinya → primary action, link)
- `--sm-abyss: #0B2E52` (navy dalam → hero panel, footer, teks display kuat)
- `--sm-sky: #DFEDF9` (tint biru sangat muda → latar section selang-seling, hover state)
- `--sm-foam: #F7FAFD` (off-white kebiruan → latar halaman, BUKAN #fff murni)
- `--sm-ink: #16283C` (teks body, biru-hitam)
- `--sm-slate: #55708A` (teks sekunder/label, abu-biru)
- Kontras: marine pada foam = AA besar & komponen; ink pada foam = AAA; putih pada abyss = AAA.

### Tipografi (2 family, peran jelas)
- Display/UI: **Plus Jakarta Sans** (foundry Indonesia Tokotype — brand-fit sekolah RI; weights 400/500/600/700/800; tracking tight di display, negative -0.02em)
- Editorial accent: **Source Serif 4** italic — HANYA untuk: motto sekolah & kutipan sambutan kepsek (satu tempat keberanian, sisanya quiet)
- Skala: display 40/56, h2 30/38, h3 20/28, body 16/26 (leading longgar sekolah), small 14/20, tabular-nums untuk statistik.

### Layout & Struktur
- Masthead: bar identitas sekolah (abyss, nama + NPSN + jam layanan) → nav sticky putih, logo kiri, menu + CTA "Hubungi" kanan, tinggi 64-72px, satu baris.
- Hero: split asimetris 7/5 — kiri: pernyataan besar + subtext singkat + 2 CTA; kanan: foto gerbang dengan panel stat mengambang (foto asli sekolah, bukan ilustrasi). Grid halus latar sky sebagai tekstur institusional (garis tipil 1px, bukan dekorasi acak).
- Statistik: band horizontal abyss dengan angka tabular besar putih + label kecil, PEMISAH garis tipis bukan kartu.
- Denah sekolah: fitur khas → peta interaktif (denah asli) + legenda bangunan yang bisa diklik, panel detail. Ini elemen signature halaman Beranda.
- Rutinitas: linimasa vertikal dengan penanda waktu (jam sekolah nyata).
- Sambutan kepsek: split dengan foto + kutipan serif italic.
- Tentang: sejarah naratif (editorial, drop cap), identitas sebagai tabel definisi rapi, visi-misi dengan penanda default (badge "draf — edit via admin"), direktori guru & statistik siswa.
- Ekskul: kartu landscape dengan foto asli, bukan grid seragam — 1 baris lebar + scroll horizontal di mobile.
- Galeri: masonry 3 kolom + filter kategori + lightbox keyboard.
- Kontak: split peta (embed Google Maps koordinat resmi) + detail jam layanan & sosial.
- Footer: abyss penuh, 4 kolom (identitas + tautan + program + kontak), legal line.

### Motion (hemat, bermotivasi)
- Satu momen: hero foto fade-scale masuk saat load (400ms, cubic-bezier(0.16,1,0.3,1)).
- Hover: tombol marine → gelap + translateY(-1px); kartu ekskul/galeri → foto scale 1.03 dalam overflow-hidden.
- prefers-reduced-motion: semua transisi off.

### Soft Round (revisi 2026-10: sudut pelan, JANGAN terlalu bulat)
Skala radius dari token `--radius: 0.625rem` (10px) — pakai kelas Tailwind, jangan angka acak:
- Kecil (chip, tag, kotak input, blok hover nav): `rounded-md` (8px)
- Tombol & CTA: `rounded-lg` (10px)
- Kartu, panel, foto, lightbox, masonry item: `rounded-xl` (14px)
- LARANGAN: `rounded-2xl` ke atas (>= 16px) dan `rounded-full` (kecuali titik indikator <= 8px dan avatar)
- Setiap sudut membulat WAJIB dipasangkan `overflow-hidden` bila isinya bisa menyentuh sudut (foto, band warna); teks body tidak menempel sudut — padding cukup.
- Radius tidak mengubah watak flat: tetap tanpa shadow berlapis; bayangan maksimal satu hairline inset / outline 1px.

### Motion v2 (prinsip animasi, hemat tapi hidup)
- Shared element (FLIP): elemen yang "pindah" (thumbnail galeri → lightbox, blok hover nav, panel detail) bergerak dari posisi asalnya, bukan muncul dari kosong. Ukur rect awal → animasikan transform ke rect akhir (GSAP `flip` manual: getBoundingClientRect + `gsap.fromTo` x/y/scale).
- Overlapping action: masuknya elemen bertetangga MENUMPANG (elemen ke-2 mulai saat elemen ke-1 baru 60% selesai, stagger 0.05-0.09s), bukan menunggu bergiliran penuh.
- Follow-through & settle: gerakan berakhir dengan overshoot kecil (ease `back.out(1.4)` / `expo.out`), bukan berhenti kaku.
- Anticipation di tekan: tombol yang ditekan menurun 1px (`active:translate-y-px` / scale 0.98) sebelum aksinya jalan.
- Semua animasi gerak pakai transform/opacity/clip-path saja (tanpa animasi width/height/top/left) supaya tidak reflow.
- Anti-glitch wajib: (1) keadaan awal animasi diset sebelum paint (gsap.set / CSS awal di stylesheet, BUKAN useEffect yang menunggu JS — hindari FOUC flash); (2) konten yang dianimasikan masuk tetap ada di DOM untuk SEO + noscript (visibility/opacity, bukan display:none); (3) tinggi area terpasang tetap (reserve space) agar CLS = 0; (4) `prefers-reduced-motion` → sembunyikan gerak, tampilkan hasil akhir langsung; (5) fokus keyboard tetap terlihat (focus-visible) setelah animasi.

### Copywriting (bahasa Indonesia, tone wali kelas yang ramah & terpercaya)
- Kalimat aktif, angka nyata dari data resmi, TANPA em-dash (pakai kanda/titik), tanpa buzzword.
- Label tombol menyatakan aksi: "Lihat Denah Sekolah", "Hubungi Sekolah".
- Kosakata konsisten satu halaman (satu label per intent).

## Blacklist yang dijalankan (pre-flight)
- Tanpa em-dash/en-dash di semua teks tampilan (— dan – dilarang total; range pakai hyphen)
- Tanpa eyebrow ALL-CAPS bertracking lebar di atas heading (max 1 per 3 section, bentuk sentence-case label kecil slate)
- Tanpa kartu identik 3 kolom radius sama + shadow abu (pakai pembagian garis, asimetri, foto)
- Tanpa Inter/Roboto/Arial (Plus Jakarta Sans + Source Serif 4)
- Tanpa gradient ungu-biru, glow neon, pure #000/#fff
- Tanpa scroll cue, status dot dekoratif, strip locale/jam dekoratif di footer (jam layanan boleh — informasi nyata)
- Tanpa fake screenshot div; semua foto = foto asli sekolah (39 foto terverifikasi)
- Angka statistik HARUS dari data resmi Kemendikdasmen (tidak ada angka rekaan)

## Mekanisme (redesign arsitektur data)
- `src/lib/store/` — ContentStore interface; FirestoreStore (firebase-admin, service account via env/secret path, blind) + LocalJsonStore (data/content/*.json, atomic write + antrian tulis).
- Auto-deteksi per proses: coba Firestore (timeout 3s) → fallback lokal. Saat Firestore aktif & kosong → auto-seed dari JSON lokal. Cache in-memory 30s.
- Admin auth: scrypt + HttpOnly cookie sesi 24 jam; sesi disimpan di store (collection `sessions` / file sessions.json); login throttle.
- API: GET /api/content (publik, semua seksi), PUT /api/content (auth, validasi kunci + ukuran payload <= 256KB), POST /api/upload (auth, 5MB, JPG/PNG/WebP → public/uploads + optimasi).
- Prisma/SQLite dihapus seluruhnya dari runtime (folder prisma/, db/ tidak dipakai lagi; data sudah diekspor ke data/content/).
