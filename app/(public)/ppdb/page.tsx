import { getPpdbSettings } from "@/actions/ppdb";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Ulang PPDB",
  description:
    "Informasi dan panduan daftar ulang PPDB bagi calon siswa yang telah dinyatakan diterima.",
};

function CountdownTimer({ targetDate }: { targetDate: string }) {
  // Will be replaced by client component countdown
  return (
    <div
      id="ppdb-countdown"
      data-target={targetDate}
      className="grid grid-cols-4 gap-3 max-w-sm mx-auto"
    >
      {["--", "--", "--", "--"].map((val, i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20"
        >
          <div className="text-3xl font-bold font-mono text-white">{val}</div>
          <div className="text-xs text-white/60 mt-1">
            {["Hari", "Jam", "Menit", "Detik"][i]}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PpdbPage() {
  const settings = await getPpdbSettings();

  const now = new Date();
  const buka = settings ? new Date(settings.tanggal_buka) : null;
  const tutup = settings ? new Date(settings.tanggal_tutup) : null;

  const isOpen = settings?.is_open && buka && tutup && now >= buka && now <= tutup;
  const isBelumBuka = buka && now < buka;
  const isSudahTutup = tutup && now > tutup;

  const defaultBerkas = [
    { id: "ijazah", label: "Ijazah / STTB asli dan fotokopi", is_required: true },
    { id: "akte", label: "Akte Kelahiran asli dan fotokopi", is_required: true },
    { id: "kk", label: "Kartu Keluarga (KK) fotokopi", is_required: true },
    { id: "foto", label: "Pas foto 3×4 (5 lembar, background merah)", is_required: true },
    { id: "domisili", label: "Surat Keterangan Domisili (jika berbeda KTP)", is_required: false },
    { id: "prestasi", label: "Sertifikat / Piagam Prestasi (jika ada)", is_required: false },
  ];

  const berkas = settings?.syarat_berkas?.length ? settings.syarat_berkas : defaultBerkas;

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary/90 via-primary to-primary/70 text-white py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/10 blur-3xl" />
          {/* Dotted pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <ClipboardList className="w-4 h-4" />
              PPDB {new Date().getFullYear()}/{new Date().getFullYear() + 1}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Daftar Ulang <span className="text-yellow-300">Calon Siswa Baru</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Selamat! Anda telah dinyatakan{" "}
              <strong className="text-yellow-300">DITERIMA</strong>. Lengkapi
              proses daftar ulang untuk mengonfirmasi keikutsertaan Anda.
            </p>

            {/* Status indicator */}
            {isOpen ? (
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full px-5 py-2 text-sm font-semibold mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Daftar Ulang Sedang Dibuka
              </div>
            ) : isBelumBuka ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                <p className="text-white/70 text-sm mb-4 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Daftar ulang dibuka dalam:
                </p>
                <CountdownTimer targetDate={buka!.toISOString()} />
              </div>
            ) : isSudahTutup ? (
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-full px-5 py-2 text-sm font-semibold mb-8">
                <AlertCircle className="w-4 h-4" />
                Periode Daftar Ulang Telah Berakhir
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/ppdb/verifikasi"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl
                  hover:bg-yellow-50 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5
                  active:translate-y-0 transition-all duration-200"
              >
                <CheckCircle2 className="w-5 h-5" />
                Cek Status &amp; Daftar Ulang
              </Link>
              <a
                href="#panduan"
                className="inline-flex items-center justify-center gap-2 border border-white/30 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl
                  hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              >
                Lihat Panduan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal */}
      {settings && (
        <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-1">
                  Tanggal Buka
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                  {new Date(settings.tanggal_buka).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-1">
                  Batas Akhir
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                  {new Date(settings.tanggal_tutup).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-1">
                  Kuota Tersedia
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                  {settings.kuota_total} Kursi
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Panduan */}
      <section id="panduan" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                Langkah Daftar Ulang
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Ikuti 3 langkah mudah berikut untuk menyelesaikan daftar ulang
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: CheckCircle2,
                  color: "blue",
                  title: "Verifikasi Penerimaan",
                  desc: "Masukkan Nomor Peserta PPDB dan Tanggal Lahir untuk memverifikasi status penerimaan Anda dari sistem Dinas.",
                },
                {
                  step: "02",
                  icon: FileText,
                  color: "purple",
                  title: "Isi Formulir & Upload Berkas",
                  desc: "Lengkapi data diri, data orang tua, dan unggah seluruh berkas persyaratan yang diperlukan dalam format digital.",
                },
                {
                  step: "03",
                  icon: ClipboardList,
                  color: "green",
                  title: "Konfirmasi & Tunggu Verifikasi",
                  desc: "Tinjau kembali semua data, beri pernyataan persetujuan, dan kirim formulir. Admin akan memverifikasi berkas Anda.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center mb-4`}
                  >
                    <item.icon
                      className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`}
                    />
                  </div>
                  <div className="absolute top-4 right-4 text-5xl font-black text-slate-100 dark:text-slate-700 select-none">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Syarat Berkas */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                Berkas Persyaratan
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Siapkan berkas berikut sebelum memulai proses daftar ulang
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 shadow-sm">
              {berkas.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.is_required
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}
                  >
                    <FileText
                      className={`w-4 h-4 ${
                        item.is_required
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {item.label}
                    </p>
                    {(item as any).keterangan && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(item as any).keterangan}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      item.is_required
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {item.is_required ? "Wajib" : "Opsional"}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-slate-400 mt-4">
              * File yang diunggah akan dikonversi ke format WebP secara otomatis. Ukuran maks. 5MB per file.
            </p>
          </div>
        </div>
      </section>

      {/* Info Kontak */}
      {settings?.contact_info && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-2xl p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
                Butuh Bantuan?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {settings.contact_info}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Bottom */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            Siap Memulai Daftar Ulang?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Klik tombol di bawah dan masukkan Nomor Peserta serta Tanggal Lahir Anda.
          </p>
          <Link
            href="/ppdb/verifikasi"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-xl
              hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Mulai Daftar Ulang
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
