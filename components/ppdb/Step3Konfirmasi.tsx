"use client";

import { useState } from "react";
import { submitFinalStep } from "@/actions/ppdb";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  User,
  MapPin,
  Shield,
  PartyPopper,
} from "lucide-react";

interface DataDiri {
  nama_lengkap?: string;
  nik?: string;
  no_peserta?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  agama?: string;
  alamat?: string;
  kota?: string;
  no_telp?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  no_telp_ortu?: string;
}

interface BerkasData {
  ijazah_url?: string;
  akte_kelahiran_url?: string;
  kartu_keluarga_url?: string;
  pas_foto_url?: string;
  [key: string]: string | undefined;
}

const BERKAS_LABELS: Record<string, string> = {
  ijazah_url: "Ijazah / STTB",
  skhun_url: "SKHUN",
  akte_kelahiran_url: "Akte Kelahiran",
  kartu_keluarga_url: "Kartu Keluarga",
  pas_foto_url: "Pas Foto",
  surat_domisili_url: "Surat Domisili",
  kartu_prestasi_url: "Sertifikat Prestasi",
};

interface Props {
  token: string;
  dataDiri?: DataDiri;
  berkas?: BerkasData;
  onComplete: () => void;
}

export function Step3Konfirmasi({ token, dataDiri, berkas, onComplete }: Props) {
  const [setuju, setSetuju] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!setuju) {
      setError("Anda harus mencentang pernyataan persetujuan untuk melanjutkan.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await submitFinalStep(token, setuju);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => onComplete(), 2000);
      } else {
        setError(res.message || "Terjadi kesalahan.");
      }
    } catch {
      setError("Terjadi kesalahan server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Daftar Ulang Berhasil Dikirim!
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          Formulir daftar ulang Anda telah kami terima. Tim admin akan memverifikasi berkas
          Anda dalam waktu 1–3 hari kerja. Pantau status Anda melalui halaman verifikasi.
        </p>
      </div>
    );
  }

  const uploadedBerkas = berkas
    ? Object.entries(berkas).filter(([, v]) => !!v)
    : [];

  return (
    <div className="space-y-6">
      {/* Preview Data Diri */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          Data Pribadi
        </h3>
        {dataDiri ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ["Nama Lengkap", dataDiri.nama_lengkap],
              ["NIK", dataDiri.nik],
              ["No. Peserta", dataDiri.no_peserta],
              ["Tempat Lahir", dataDiri.tempat_lahir],
              ["Tanggal Lahir", dataDiri.tanggal_lahir],
              ["Jenis Kelamin", dataDiri.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
              ["Agama", dataDiri.agama],
              ["No. Telepon", dataDiri.no_telp],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Data diri belum diisi.</p>
        )}
      </div>

      {/* Preview Alamat */}
      {dataDiri?.alamat && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Alamat
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{dataDiri.alamat}</p>
          {dataDiri.kota && <p className="text-xs text-slate-400 mt-1">{dataDiri.kota}</p>}
        </div>
      )}

      {/* Preview Data Orang Tua */}
      {(dataDiri?.nama_ayah || dataDiri?.nama_ibu) && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            Orang Tua / Wali
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ["Nama Ayah", dataDiri.nama_ayah],
              ["Nama Ibu", dataDiri.nama_ibu],
              ["No. Telp Ortu", dataDiri.no_telp_ortu],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Berkas */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-primary" />
          Berkas Terupload ({uploadedBerkas.length} file)
        </h3>
        {uploadedBerkas.length > 0 ? (
          <div className="space-y-2">
            {uploadedBerkas.map(([key, url]) => (
              <div key={key} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                  {BERKAS_LABELS[key] || key}
                </span>
                <a
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Lihat
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Belum ada berkas yang diupload.</p>
        )}
      </div>

      {/* Pernyataan */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">
              Pernyataan Orang Tua / Wali
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed mb-4">
              Saya selaku orang tua/wali menyatakan bahwa seluruh data dan dokumen yang
              diisikan dalam formulir ini adalah <strong>benar dan sah</strong>. Apabila
              dikemudian hari ditemukan ketidaksesuaian, saya bersedia menerima konsekuensi
              pembatalan penerimaan sesuai ketentuan yang berlaku.
            </p>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id="setuju"
                checked={setuju}
                onChange={(e) => setSetuju(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300 group-hover:text-amber-900 dark:group-hover:text-amber-200 transition-colors">
                Saya menyetujui pernyataan di atas dan data yang saya masukkan adalah benar.
              </span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!setuju || isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl
          hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 active:translate-y-0
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
        ) : (
          <><CheckCircle2 className="w-5 h-5" /> Kirim Formulir Daftar Ulang</>
        )}
      </button>
    </div>
  );
}
