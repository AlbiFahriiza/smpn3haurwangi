import gsap from "gsap";

/**
 * Mesin pegas multi-kanal untuk animasi "settle" yang mewarisi kecepatan jari
 * dan bisa dicegat pada bingkai mana pun. Integratornya semi-implisit, digerakkan
 * lewat gsap.ticker supaya berbagi satu jam dengan animasi GSAP lain dan ikut
 * rehat saat tab tidak aktif. Tween biasa tidak dipakai di sini karena titik
 * awalnya selalu dari nilai target, bukan nilai tampilan, dan tidak bisa menerima
 * kecepatan awal; pegas ini keduanya.
 */
interface KanalPegas {
  posisi: number;
  kecepatan: number;
  sasaran: number;
  /** Toleransi snap ke sasaran; kanal piksel 0.35, kanal skala 0.0025. */
  eps: number;
  tulis: (nilai: number) => void;
}

export interface ParamPegas {
  /** Respons (detik): makin kecil makin cepat merespons gerakan. */
  respons: number;
  /** Rasio redaman: 1 kritis (tanpa pantulan), di bawah 1 sedikit memantul. */
  redaman: number;
}

export interface KanalBaru {
  posisi: number;
  kecepatan?: number;
  sasaran: number;
  tulis: (nilai: number) => void;
  eps?: number;
}

export class Pegas {
  private kanal: Record<string, KanalPegas> = {};
  private param: ParamPegas = { respons: 0.35, redaman: 1 };
  private hidup = false;
  private saatSelesai: (() => void) | null = null;
  private langkah: (waktu: number, deltaMs: number) => void;

  constructor() {
    this.langkah = (_waktu, deltaMs) => this.maju(Math.min(deltaMs / 1000, 0.064));
  }

  /** Mulai pegas dari nilai tampilan sekarang; kecepatan awal boleh diisi dari
   *  kecepatan jari supaya lepasan tidak "menabrak dinding". */
  mulai(kanalBaru: Record<string, KanalBaru>, param: ParamPegas, saatSelesai?: () => void) {
    this.berhenti();
    this.param = param;
    this.saatSelesai = saatSelesai ?? null;
    for (const nama of Object.keys(kanalBaru)) {
      const k = kanalBaru[nama];
      this.kanal[nama] = {
        posisi: k.posisi,
        kecepatan: k.kecepatan ?? 0,
        sasaran: k.sasaran,
        eps: k.eps ?? 0.35,
        tulis: k.tulis,
      };
      k.tulis(k.posisi);
    }
    this.hidup = true;
    gsap.ticker.add(this.langkah);
  }

  berhenti() {
    if (!this.hidup) return;
    this.hidup = false;
    gsap.ticker.remove(this.langkah);
    this.saatSelesai = null;
    this.kanal = {};
  }

  /** Kecepatan kanal saat ini, untuk diwariskan saat pegas diganti di tengah jalan. */
  kecepatan(nama: string): number {
    return this.kanal[nama]?.kecepatan ?? 0;
  }

  private maju(dt: number) {
    const omega = (Math.PI * 2) / this.param.respons;
    const redam = 2 * this.param.redaman * omega;
    let mantap = true;
    for (const nama of Object.keys(this.kanal)) {
      const k = this.kanal[nama];
      const percepatan = omega * omega * (k.sasaran - k.posisi) - redam * k.kecepatan;
      k.kecepatan += percepatan * dt;
      k.posisi += k.kecepatan * dt;
      k.tulis(k.posisi);
      // Selesai bila sisa jarak dan kecepatan sama-sama di bawah ambang yang
      // tak terlihat mata; kecepatan ikut diuji supaya pantulan underdamped
      // tidak dipotong di tengah lintasan.
      if (Math.abs(k.sasaran - k.posisi) > k.eps || Math.abs(k.kecepatan) > omega * k.eps) {
        mantap = false;
      }
    }
    if (mantap) {
      for (const nama of Object.keys(this.kanal)) {
        this.kanal[nama].tulis(this.kanal[nama].sasaran);
      }
      const selesai = this.saatSelesai;
      this.berhenti();
      selesai?.();
    }
  }
}

/** Proyeksi momentum gaya Apple: seberapa jauh gerak masih meluncur setelah
 *  jari lepas, dipakai untuk memilih foto tetangga sebelum pegas jalan. */
export function proyeksiMomentum(kecepatan: number, lajuPerlambatan = 0.998): number {
  return ((kecepatan / 1000) * lajuPerlambatan) / (1 - lajuPerlambatan);
}

/** Resistensi karet melewati batas: makin jauh dari batas makin berat ditarik,
 *  sehingga terbaca "ada respons tapi tidak ada lagi konten", bukan berhenti kaku. */
export function tahanKaret(kelebihan: number, dimensi: number, konstanta = 0.55): number {
  return (kelebihan * dimensi * konstanta) / (dimensi + konstanta * Math.abs(kelebihan));
}

/** Jejak sampel pointer terakhir; kecepatan lepas dihitung dari jendela ±100 ms
 *  supaya satu-dua kejadian pointermove yang melompat tidak menghasilkan
 *  kecepatan semu. */
export class JejakPointer {
  private sampel: Array<{ t: number; x: number; y: number }> = [];

  catat(x: number, y: number) {
    this.sampel.push({ t: performance.now(), x, y });
    if (this.sampel.length > 6) this.sampel.shift();
  }

  reset() {
    this.sampel = [];
  }

  kecepatan(): { vx: number; vy: number } {
    const n = this.sampel.length;
    if (n < 2) return { vx: 0, vy: 0 };
    const akhir = this.sampel[n - 1];
    let awal = this.sampel[n - 2];
    for (let i = n - 2; i >= 0; i--) {
      if (akhir.t - this.sampel[i].t <= 100) awal = this.sampel[i];
      else break;
    }
    const dt = (akhir.t - awal.t) / 1000;
    if (dt <= 0.005) return { vx: 0, vy: 0 };
    return { vx: (akhir.x - awal.x) / dt, vy: (akhir.y - awal.y) / dt };
  }
}
