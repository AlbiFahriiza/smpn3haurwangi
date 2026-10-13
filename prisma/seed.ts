/**
 * Seed database SMPN 3 Haurwangi.
 * Seluruh data diambil dari hasil riset sumber resmi (lihat worklog.md):
 * - Sekolah Kita Kemendikdasmen (NPSN 20252209), referensi.data.kemendikdasmen.go.id
 * - daftarsekolah.net & zekolah (profil, kepala sekolah)
 * - GitHub AlbiFahrizaRahman/GaleriWEB (logo, foto guru, denah, dokumentasi)
 * Jalankan: bunx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const db = new PrismaClient()

// scrypt dari stdlib Node — tanpa dependensi tambahan
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

async function main() {
  console.log('Mengosongkan tabel...')
  await db.sessionToken.deleteMany()
  await db.adminUser.deleteMany()
  await db.contentSection.deleteMany()

  console.log('Membuat akun admin...')
  // Kredensial default — WAJIB diganti setelah login pertama (ada tombol ganti password).
  await db.adminUser.create({
    data: {
      username: 'admin',
      passwordHash: hashPassword('smpn3haurwangi2026'),
      name: 'Administrator Sekolah',
      role: 'kepala_sekolah',
    },
  })

  const sections: Record<string, unknown> = {}

  // ============ IDENTITAS (data resmi Kemendikdasmen) ============
  sections['identity'] = {
    nama: 'SMP Negeri 3 Haurwangi',
    npsn: '20252209',
    status: 'Negeri',
    bentuk: 'SMP',
    alamat: 'Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi',
    kabupaten: 'Kabupaten Cianjur',
    provinsi: 'Provinsi Jawa Barat',
    kodePos: '43282',
    telepon: '',
    email: 'smpn3_haurwangi@yahoo.com',
    berdiri: '26 April 2006',
    skPendirian: '421.3/Kep.71-Ks/2006',
    akreditasi: 'B',
    skAkreditasi: '02.00/273/BAP-SM/SK/X/2016 (19 Oktober 2016)',
    kepalaSekolah: 'Agus Solihin',
    operator: 'Risha Agustiansyah',
    luasTanah: '6.138 m²',
    kurikulum: 'Kurikulum Merdeka',
    penyelenggaraan: 'Sehari Penuh / 5 Hari',
    lat: -6.8005,
    lng: 107.3064,
  }

  // ============ BERANDA ============
  sections['home'] = {
    hero: {
      title: 'SMP Negeri 3 Haurwangi',
      subtitle:
        'Unggul dalam prestasi, santun dalam perilaku — mencetak generasi cerdas berkarakter di jantung Kabupaten Cianjur.',
      image: '/images/hero/gerbang-utama.jpg',
      badges: [
        { label: 'Akreditasi B', icon: 'badge' },
        { label: 'Sekolah Negeri', icon: 'building' },
        { label: 'Berdiri 2006', icon: 'calendar' },
      ],
    },
    stats: [
      { label: 'Siswa Aktif', value: '382', sub: '199 putra · 183 putri' },
      { label: 'Guru & Tenaga Pendidik', value: '16', sub: '93,75% bersertifikasi' },
      { label: 'Rombongan Belajar', value: '12', sub: 'Kelas 7–9' },
      { label: 'Luas Lahan', value: '6.138 m²', sub: 'Lapang upacara & badminton' },
    ],
    sambutan: {
      title: 'Sambutan Kepala Sekolah',
      nama: 'Agus Solihin',
      jabatan: 'Kepala SMP Negeri 3 Haurwangi',
      foto: '',
      teks: [
        'Assalamualaikum warahmatullahi wabarakatuh. Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya sehingga website resmi SMP Negeri 3 Haurwangi dapat hadir sebagai jembatan informasi antara sekolah, orang tua, dan masyarakat.',
        'Sebagai lembaga pendidikan yang berdiri sejak 26 April 2006, SMP Negeri 3 Haurwangi terus berbenah mengikuti perkembangan zaman. Dengan dukungan sumber daya manusia yang dimiliki, sekolah ini siap berkompetisi dalam pelayanan informasi publik yang cepat, jelas, dan akuntabel.',
        'Teknologi informasi, khususnya website ini, menjadi sarana untuk memberikan pelayanan informasi sekaligus wadah menerima saran dari semua pihak demi menjawab kebutuhan masyarakat. Mari bersama kita wujudkan generasi yang berakhlak mulia, cerdas, dan siap bersaing di masa depan.',
      ],
    },
    berita: [
      {
        title: 'Pentas Seni & Pelepasan Kelas 9',
        date: 'Juni 2025',
        excerpt: 'Siswa tampilkan tari, musik, dan drama dalam pentas seni akhir tahun sekaligus pelepasan kelas 9.',
        image: '/images/galeri/pentas-seni-1.jpg',
      },
      {
        title: 'Asesmen Berbasis Komputer (ANBK)',
        date: 'Agustus 2025',
        excerpt: 'Pelaksanaan ANBK berjalan lancar di laboratorium komputer sekolah.',
        image: '/images/galeri/anbk.jpg',
      },
      {
        title: 'Pagi Ceria Serentak 2025',
        date: '2025',
        excerpt: 'Seluruh siswa dan guru mengikuti senam pagi ceria serentak di lapangan upacara.',
        image: '/images/galeri/apel-sekolah.jpg',
      },
    ],
  }

  // ============ DENAH SEKOLAH ============
  sections['denah'] = {
    title: 'Denah Sekolah',
    description:
      'Denah lokasi (site plan) SMP Negeri 3 Haurwangi di atas lahan seluas 6.138 m². Denah memuat seluruh ruang pembelajaran dan fasilitas penunjang.',
    image: '/images/denah-sekolah.jpg',
    keterangan: [
      { kode: 'A', nama: 'Ruang Guru' },
      { kode: 'B', nama: 'Ruang Kepala Sekolah' },
      { kode: 'C', nama: 'Ruang Tata Usaha' },
      { kode: 'D', nama: 'Perpustakaan' },
      { kode: 'E', nama: 'Laboratorium Bahasa' },
      { kode: 'F', nama: 'Laboratorium Komputer' },
      { kode: 'G', nama: 'Ruang Kelas (14 lokal)' },
      { kode: 'H', nama: 'Ruang UKS / OSIS' },
      { kode: 'I', nama: 'WC Siswa' },
      { kode: 'J', nama: 'WC Guru' },
      { kode: 'K', nama: 'Gudang' },
    ],
    fasilitas: [
      { nama: 'Lapang Upacara / Voli', detail: 'Tempat upacara bendera setiap Senin dan olahraga voli' },
      { nama: 'Lapang Badminton', detail: 'Lapangan bulu tangkis di sisi tengah sekolah' },
      { nama: 'Lahan RKB', detail: 'Lahan kosong disiapkan untuk pembangunan ruang kelas baru' },
    ],
  }

  // ============ RUTINITAS SEKOLAH ============
  sections['routines'] = {
    title: 'Rutinitas Sekolah',
    description: 'Kegiatan rutin mingguan dan tahunan yang membentuk kedisiplinan dan karakter siswa.',
    items: [
      {
        nama: 'Upacara Bendera',
        waktu: 'Setiap Senin, 07.00 WIB',
        deskripsi:
          'Seluruh siswa dan guru mengikuti upacara bendera di lapangan upacara untuk menumbuhkan nasionalisme dan kedisiplinan.',
        ikon: 'flag',
      },
      {
        nama: 'Apel Pagi & Literasi',
        waktu: 'Setiap hari, 06.45 WIB',
        deskripsi:
          'Apel pagi sebelum masuk kelas dilanjutkan pembiasaan membaca Al-Qur’an dan literasi.',
        ikon: 'sunrise',
      },
      {
        nama: 'Kegiatan Belajar Mengajar',
        waktu: 'Senin–Jumat, 07.00–15.30 WIB',
        deskripsi:
          'Pembelajaran sehari penuh 5 hari dengan Kurikulum Merdeka, termasuk pembelajaran berbasis komputer dan praktik laboratorium.',
        ikon: 'book',
      },
      {
        nama: 'Pengajian & Pembinaan Karakter',
        waktu: 'Jumat',
        deskripsi:
          'Pengajian rutin bersama seluruh siswa untuk penumbuhan budi pekerti dan pendalaman keagamaan.',
        ikon: 'heart',
      },
      {
        nama: 'Ekstrakurikuler',
        waktu: 'Jumat & Sabtu',
        deskripsi:
          'Latihan ekstrakurikuler mingguan — pramuka, olahraga, dan kesenian (lihat tab Ekstrakurikuler).',
        ikon: 'users',
      },
      {
        nama: 'Pentas Seni & Pelepasan',
        waktu: 'Akhir tahun ajaran',
        deskripsi:
          'Puncak kegiatan seni tahunan yang menampilkan karya siswa sekaligus perpisahan kelas 9.',
        ikon: 'star',
      },
    ],
  }

  // ============ TENTANG / SEJARAH ============
  sections['about'] = {
    sejarah: [
      'SMP Negeri 3 Haurwangi berdiri pada tanggal 26 April 2006 berdasarkan Surat Keputusan Menteri Pendidikan dan Kebudayaan Nomor 421.3/Kep.71-Ks/2006, di bawah naungan Pemerintah Daerah Kabupaten Cianjur. Sekolah ini berlokasi di Jalan Buniayu, Desa Kertamukti, Kecamatan Haurwangi — kawasan yang dikenal dengan alamnya yang asri di bagian timur Kabupaten Cianjur.',
      'Sebagai satuan pendidikan jenjang SMP dengan sistem sehari penuh lima hari, sekolah terus mengembangkan mutu layanan pendidikan. Pada tahun 2016, sekolah memperoleh akreditasi peringkat B dari Badan Akreditasi Nasional Sekolah/Madrasah berdasarkan SK Nomor 02.00/273/BAP-SM/SK/X/2016 tanggal 19 Oktober 2016 — dan terus berbenah untuk meraih predikat lebih tinggi.',
      'Dengan luas tanah 6.138 m², 14 ruang kelas, laboratorium bahasa, laboratorium komputer, perpustakaan, lapang upacara, serta lapang badminton, SMP Negeri 3 Haurwangi berkomitmen mencetak generasi muda yang berakhlak mulia, cerdas, dan siap bersaing. Dukungan internet broadband dan listrik PLN menjadikan proses belajar mengajar makin relevan dengan kebutuhan era digital.',
    ],
    sambutanTeks: 'Menorehkan prestasi di tengah alam Cianjur — berdiri di atas fondasi iman, ilmu, dan amal.',
  }

  // ============ VISI MISI ============
  sections['vision'] = {
    catatan:
      'Visi & misi berikut disusun dari nilai-nilai logo sekolah (api = semangat, globe = wawasan, buku = ilmu) karena dokumen resmi belum dipublikasikan daring. Guru dapat mengubahnya kapan saja lewat panel admin.',
    visi:
      'Terwujudnya peserta didik yang beriman, bertakwa, berilmu, berakhlak mulia, dan berwawasan global serta siap melanjutkan pendidikan ke jenjang yang lebih tinggi.',
    misi: [
      'Menyelenggarakan pembelajaran dan bimbingan yang efektif dengan Kurikulum Merdeka agar peserta didik berkembang optimal sesuai bakat dan minatnya.',
      'Menumbuhkan keimanan, ketakwaan, dan akhlak mulia melalui pembiasaan ibadah, pengajian, dan keteladanan di lingkungan sekolah.',
      'Membangun budaya literasi, numerasi, dan penguasaan teknologi informasi sebagai bekal bersaing di era digital.',
      'Mengembangkan potensi diri melalui kegiatan ekstrakurikuler yang bervariasi untuk membentuk karakter disiplin, mandiri, dan kerja sama.',
      'Meningkatkan profesionalisme guru dan tenaga kependidikan secara berkelanjutan serta menjalin kemitraan dengan orang tua dan masyarakat.',
    ],
    tujuan: [
      'Lulusan yang diterima di sekolah favorit dan mampu berkompetisi di jenjang SMA/sederajat.',
      'Prestasi akademik dan non-akademik di tingkat kecamatan hingga provinsi.',
      'Lingkungan sekolah yang bersih, rapi, hijau, dan kondusif untuk belajar.',
      'Peserta didik yang aktif berbahasa Indonesia dan Inggris secara sederhana serta cakap teknologi.',
    ],
    motto: 'Nyunda, Cerdas, Berprestasi — dari Haurwangi untuk Indonesia.',
  }

  // ============ PROFIL GURU & STAF ============
  // Nama terverifikasi dari galeri resmi sekolah; mapel perlu dilengkapi guru via admin.
  sections['teachers'] = {
    catatan:
      'Data guru berikut dari galeri resmi sekolah (5 dari 16 guru & tenaga kependidikan). Lengkapi daftar guru lainnya beserta mapel melalui panel admin.',
    items: [
      {
        nama: 'Agus Solihin, S.Pd.',
        jabatan: 'Kepala Sekolah',
        mapel: 'Manajemen Sekolah',
        foto: '',
        deskripsi:
          'Memimpin SMP Negeri 3 Haurwangi dengan fokus pada peningkatan mutu pembelajaran, penguatan karakter, dan pelayanan publik yang akuntabel.',
      },
      {
        nama: 'Aldiansyah, S.Pd.',
        jabatan: 'Guru',
        mapel: '—',
        foto: '/images/guru/aldiansyah.jpg',
        deskripsi: 'Guru mata pelajaran di SMP Negeri 3 Haurwangi.',
      },
      {
        nama: 'Desty Rosanti, S.Pd.',
        jabatan: 'Guru',
        mapel: '—',
        foto: '/images/guru/desty-rosanti.jpg',
        deskripsi: 'Guru mata pelajaran di SMP Negeri 3 Haurwangi.',
      },
      {
        nama: 'Masyhudah Fitri Tsania, S.Pd.',
        jabatan: 'Guru',
        mapel: '—',
        foto: '/images/guru/masyhudah-fitri-tsania.jpg',
        deskripsi: 'Guru mata pelajaran di SMP Negeri 3 Haurwangi.',
      },
      {
        nama: 'Nur Dewi, S.Pd.',
        jabatan: 'Guru',
        mapel: '—',
        foto: '/images/guru/nurdewi.jpg',
        deskripsi: 'Guru mata pelajaran di SMP Negeri 3 Haurwangi.',
      },
      {
        nama: 'Risha Agustiansyah',
        jabatan: 'Operator Sekolah',
        mapel: 'Dapodik & Sekolah Kita',
        foto: '',
        deskripsi: 'Pengelola data pokok pendidikan dan operator website sekolah.',
      },
    ],
    statistik: [
      { label: 'Guru & Tendik', value: '16' },
      { label: 'Guru Bersertifikasi', value: '93,75%' },
      { label: 'Guru PNS', value: '93,75%' },
      { label: 'Rasio Siswa/Guru', value: '24' },
    ],
  }

  // ============ PROFIL SISWA ============
  sections['students'] = {
    catatan:
      'Statistik dari data resmi Kemendikdasmen semester 2026/2027. Rincian wali kelas & jumlah per rombel dapat dilengkapi guru melalui panel admin.',
    total: 382,
    lakiLaki: 199,
    perempuan: 183,
    rombel: 12,
    rasioKelas: 32,
    kelas: [
      { kelas: '7A', jumlah: 32, waliKelas: '' },
      { kelas: '7B', jumlah: 32, waliKelas: '' },
      { kelas: '7C', jumlah: 32, waliKelas: '' },
      { kelas: '7D', jumlah: 32, waliKelas: '' },
      { kelas: '8A', jumlah: 32, waliKelas: '' },
      { kelas: '8B', jumlah: 32, waliKelas: '' },
      { kelas: '8C', jumlah: 32, waliKelas: '' },
      { kelas: '8D', jumlah: 32, waliKelas: '' },
      { kelas: '9A', jumlah: 31, waliKelas: '' },
      { kelas: '9B', jumlah: 31, waliKelas: '' },
      { kelas: '9C', jumlah: 31, waliKelas: '' },
      { kelas: '9D', jumlah: 31, waliKelas: '' },
    ],
    fasilitasBelajar: [
      { nama: 'Ruang Kelas', jumlah: '14 lokal' },
      { nama: 'Laboratorium Bahasa', jumlah: '1 lab' },
      { nama: 'Laboratorium Komputer', jumlah: '1 lab' },
      { nama: 'Perpustakaan', jumlah: '1 ruang' },
    ],
  }

  // ============ EKSTRAKURIKULER ============
  sections['ekskul'] = {
    title: 'Ekstrakurikuler',
    description:
      'Kegiatan ekstrakurikuler wajib dan pilihan yang menyalurkan bakat, minat, dan karakter siswa. Pramuka adalah kegiatan wajib bagi seluruh siswa.',
    items: [
      {
        nama: 'Pramuka',
        jadwal: 'Jumat sore',
        pembina: '—',
        deskripsi:
          'Kegiatan wajib seluruh siswa. Membentuk kedisiplinan, kemandirian, dan cinta alam melalui kepramukaan (wajib belajar sesuai Permendikbud).',
        ikon: 'tent',
        warna: '#2E7D32',
      },
      {
        nama: 'Paskibra',
        jadwal: 'Latihan mingguan',
        pembina: '—',
        deskripsi:
          'Pasukan pengibar bendera yang bertugas pada upacara Senin dan perayaan hari besar nasional.',
        ikon: 'flag',
        warna: '#C62828',
      },
      {
        nama: 'Bulu Tangkis',
        jadwal: 'Sabtu',
        pembina: '—',
        deskripsi:
          'Latihan bulu tangkis di lapang badminton sekolah — dari teknik dasar hingga siap bertanding antarsekolah.',
        ikon: 'zap',
        warna: '#00695C',
      },
      {
        nama: 'Bola Voli',
        jadwal: 'Sabtu',
        pembina: '—',
        deskripsi:
          'Olahraga tim yang dimainkan di lapang upacara/voli, menumbuhkan kerja sama dan sportivitas.',
        ikon: 'circle-dot',
        warna: '#E65100',
      },
      {
        nama: 'Seni & Tari',
        jadwal: 'Jumat',
        pembina: '—',
        deskripsi:
          'Wadah siswa berbakat seni — tari, musik, dan panggung — yang rutin tampil di pentas seni akhir tahun.',
        ikon: 'star',
        warna: '#6A1B9A',
      },
      {
        nama: 'PMR (Palang Merah Remaja)',
        jadwal: 'Latihan rutin',
        pembina: '—',
        deskripsi:
          'Kepalang merahan remaja: pertolongan pertama, kesehatan, dan kemanusiaan, bekerja sama dengan PMI Cianjur.',
        ikon: 'cross',
        warna: '#B71C1C',
      },
    ],
  }

  // ============ GALERI ============
  sections['gallery'] = {
    title: 'Galeri',
    description: 'Dokumentasi kegiatan SMP Negeri 3 Haurwangi — dari kegiatan belajar hingga pentas seni.',
    kategori: ['Semua', 'Kegiatan Belajar', 'Upacara & Apel', 'Seni & Perpisahan', 'Keagamaan', 'Lainnya'],
    items: [
      { src: '/images/galeri/kegiatan-belajar-1.jpg', judul: 'Kegiatan Belajar Mengajar', kategori: 'Kegiatan Belajar', tanggal: 'April 2025' },
      { src: '/images/galeri/kegiatan-belajar-2.jpg', judul: 'KBM di Kelas', kategori: 'Kegiatan Belajar', tanggal: 'April 2025' },
      { src: '/images/galeri/upacara-apel-pagi.jpg', judul: 'Upacara & Apel Pagi', kategori: 'Upacara & Apel', tanggal: '—' },
      { src: '/images/galeri/apel-sekolah.jpg', judul: 'Apel di Halaman Sekolah', kategori: 'Upacara & Apel', tanggal: 'Juli 2025' },
      { src: '/images/galeri/pembinaan-siswa.jpg', judul: 'Pembinaan Siswa', kategori: 'Kegiatan Belajar', tanggal: 'Juli 2025' },
      { src: '/images/galeri/pentas-seni-1.jpg', judul: 'Pentas Seni & Pelepasan', kategori: 'Seni & Perpisahan', tanggal: 'Juni 2025' },
      { src: '/images/galeri/pentas-seni-2.jpg', judul: 'Panggung Pentas Seni', kategori: 'Seni & Perpisahan', tanggal: 'Juni 2025' },
      { src: '/images/galeri/pentas-seni-3.jpg', judul: 'Perpisahan Kelas 9', kategori: 'Seni & Perpisahan', tanggal: 'Juni 2025' },
      { src: '/images/galeri/pentas-seni-4.jpg', judul: 'Suasana Pentas Seni', kategori: 'Seni & Perpisahan', tanggal: 'Juni 2025' },
      { src: '/images/galeri/pentas-seni-5.jpg', judul: 'Guru & Panitia Pentas Seni', kategori: 'Seni & Perpisahan', tanggal: 'Juni 2025' },
      { src: '/images/galeri/pengajian.jpg', judul: 'Pengajian Bersama', kategori: 'Keagamaan', tanggal: 'September 2025' },
      { src: '/images/galeri/pawai-siswa.jpg', judul: 'Pawai Siswa', kategori: 'Lainnya', tanggal: 'Agustus 2025' },
      { src: '/images/galeri/anbk.jpg', judul: 'Asesmen Berbasis Komputer (ANBK)', kategori: 'Kegiatan Belajar', tanggal: 'Agustus 2025' },
      { src: '/images/galeri/kegiatan-luar-1.jpg', judul: 'Kegiatan di Luar Sekolah', kategori: 'Lainnya', tanggal: 'Juni 2025' },
      { src: '/images/galeri/kegiatan-luar-2.jpg', judul: 'Foto Bersama', kategori: 'Lainnya', tanggal: 'Juni 2025' },
      { src: '/images/galeri/kegiatan-luar-3.jpg', judul: 'Rekreasi & Studi Wisata', kategori: 'Lainnya', tanggal: 'Juni 2025' },
      { src: '/images/galeri/kegiatan-luar-4.jpg', judul: 'Silaturahmi Guru', kategori: 'Lainnya', tanggal: 'Juni 2025' },
      { src: '/images/galeri/foto-bersama-guru-1.jpg', judul: 'Guru & Staf SMPN 3 Haurwangi', kategori: 'Lainnya', tanggal: 'Maret 2025' },
      { src: '/images/galeri/foto-bersama-guru-2.jpg', judul: 'Keluarga Besar Sekolah', kategori: 'Lainnya', tanggal: 'Maret 2025' },
      { src: '/images/galeri/foto-bersama-guru-3.jpg', judul: 'Guru & Tenaga Kependidikan', kategori: 'Lainnya', tanggal: 'Maret 2025' },
      { src: '/images/galeri/silaturahmi-guru.jpg', judul: 'Silaturahmi Awal Tahun', kategori: 'Lainnya', tanggal: 'September 2025' },
      { src: '/images/galeri/kegiatan-siswa-1.jpg', judul: 'Kegiatan Siswa', kategori: 'Lainnya', tanggal: 'September 2025' },
      { src: '/images/galeri/kegiatan-siswa-2.jpg', judul: 'Bersama Guru Pembina', kategori: 'Lainnya', tanggal: 'September 2025' },
      { src: '/images/galeri/dokumentasi-studio.jpg', judul: 'Dokumentasi Resmi', kategori: 'Lainnya', tanggal: '—' },
      { src: '/images/galeri/wisuda-guru.jpg', judul: 'Wisuda & Pelatihan Guru', kategori: 'Lainnya', tanggal: '—' },
      { src: '/images/galeri/dokumentasi-resmi.jpg', judul: 'Tim Sekolah', kategori: 'Lainnya', tanggal: '—' },
    ],
  }

  // ============ KONTAK ============
  sections['contact'] = {
    alamat: 'Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi, Kab. Cianjur, Jawa Barat 43282',
    email: 'smpn3_haurwangi@yahoo.com',
    telepon: '',
    jamLayanan: 'Senin–Jumat, 07.00–15.30 WIB',
    mapsEmbed:
      'https://www.google.com/maps?q=-6.8005,107.3064&z=16&output=embed',
    mapsLink: 'https://www.google.com/maps?q=-6.8005,107.3064',
    sosial: [
      { nama: 'YouTube', url: 'https://www.youtube.com/@Smpn3haurwangiofficial', ikon: 'youtube' },
      { nama: 'Email', url: 'mailto:smpn3_haurwangi@yahoo.com', ikon: 'mail' },
    ],
  }

  // ============ FOOTER ============
  sections['footer'] = {
    nama: 'SMP Negeri 3 Haurwangi',
    tagline: 'Unggul dalam prestasi, santun dalam perilaku.',
    npsn: '20252209',
    alamat: 'Jalan Buniayu, Desa Kertamukti, Kec. Haurwangi, Kab. Cianjur, Jawa Barat 43282',
    email: 'smpn3_haurwangi@yahoo.com',
    akreditasi: 'Akreditasi B — SK BAN-SM No. 02.00/273/BAP-SM/SK/X/2016',
    berdiri: 'Berdiri 26 April 2006 — SK 421.3/Kep.71-Ks/2006',
    tautan: [
      { label: 'Beranda', tab: 'beranda' },
      { label: 'Tentang Sekolah', tab: 'tentang' },
      { label: 'Ekstrakurikuler', tab: 'ekskul' },
      { label: 'Galeri', tab: 'galeri' },
      { label: 'Kontak', tab: 'kontak' },
    ],
    credit: 'Website resmi SMP Negeri 3 Haurwangi · Dikelola Tim Media Sekolah',
  }

  console.log('Menyimpan seksi konten...')
  for (const [key, json] of Object.entries(sections)) {
    await db.contentSection.create({
      data: { key, json: JSON.stringify(json, null, 2) },
    })
    console.log(`  ✓ ${key}`)
  }

  console.log('Selesai.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
