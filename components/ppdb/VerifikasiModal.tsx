"use client";

import { useState } from "react";
import { updateRegistrantStatus } from "@/actions/ppdb";
import {
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  User,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  registrant: any;
  submission: any | null;
  adminId: string;
  onClose: () => void;
  onUpdated: () => void;
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

const STATUS_CONFIG = {
  diterima: { label: "Diterima", color: "blue" },
  daftar_ulang: { label: "Daftar Ulang", color: "amber" },
  terverifikasi: { label: "Terverifikasi", color: "green" },
  ditolak: { label: "Ditolak", color: "red" },
};

export function VerifikasiModal({ registrant, submission, adminId, onClose, onUpdated }: Props) {
  const [catatan, setCatatan] = useState(submission?.catatan_verifikasi || "");
  const [isActing, setIsActing] = useState<"terverifikasi" | "ditolak" | null>(null);
  const [berkasOpen, setBerkasOpen] = useState(true);
  const [dataDiriOpen, setDataDiriOpen] = useState(false);

  async function handleAction(newStatus: "terverifikasi" | "ditolak") {
    setIsActing(newStatus);
    try {
      await updateRegistrantStatus(registrant._id, newStatus, catatan, adminId);
      onUpdated();
      onClose();
    } catch (e) {
      alert("Terjadi kesalahan.");
    } finally {
      setIsActing(null);
    }
  }

  const berkas = submission?.step_berkas || {};
  const dataDiri = submission?.step_data_diri || {};
  const uploadedBerkas = Object.entries(berkas).filter(([, v]) => !!v) as [string, string][];

  const cfg = STATUS_CONFIG[registrant.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{registrant.nama}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">No. Peserta: {registrant.no_peserta}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
              registrant.status === "terverifikasi" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : registrant.status === "ditolak" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : registrant.status === "daftar_ulang" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}>
              {cfg?.label || registrant.status}
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Berkas Section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setBerkasOpen(!berkasOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Berkas Terupload ({uploadedBerkas.length} file)
                </span>
              </div>
              {berkasOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {berkasOpen && (
              <div className="p-4">
                {uploadedBerkas.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedBerkas.map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                      >
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                            {BERKAS_LABELS[key] || key}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Belum ada berkas yang diupload.</p>
                )}
              </div>
            )}
          </div>

          {/* Data Diri Section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setDataDiriOpen(!dataDiriOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Data Diri &amp; Orang Tua</span>
              </div>
              {dataDiriOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {dataDiriOpen && (
              <div className="p-4">
                {submission?.step_data_diri ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {[
                      ["Nama Lengkap", dataDiri.nama_lengkap],
                      ["NIK", dataDiri.nik],
                      ["Tempat Lahir", dataDiri.tempat_lahir],
                      ["Tanggal Lahir", dataDiri.tanggal_lahir],
                      ["Jenis Kelamin", dataDiri.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
                      ["Agama", dataDiri.agama],
                      ["No. Telepon", dataDiri.no_telp],
                      ["Alamat", dataDiri.alamat],
                      ["Nama Ayah", dataDiri.nama_ayah],
                      ["Nama Ibu", dataDiri.nama_ibu],
                      ["Pekerjaan Ayah", dataDiri.pekerjaan_ayah],
                      ["Pekerjaan Ibu", dataDiri.pekerjaan_ibu],
                      ["No. Telp Ortu", dataDiri.no_telp_ortu],
                    ].map(([l, v]) => (
                      <div key={l as string}>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{l}</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200 break-words">{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Data diri belum diisi.</p>
                )}
              </div>
            )}
          </div>

          {/* Catatan Admin */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Catatan Verifikasi (opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Tuliskan catatan untuk peserta jika diperlukan..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900
                text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              disabled={registrant.status === "terverifikasi"}
            />
          </div>
        </div>

        {/* Footer Action */}
        {registrant.status !== "terverifikasi" && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3 shrink-0">
            <button
              onClick={() => handleAction("ditolak")}
              disabled={!!isActing || registrant.status === "ditolak"}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl
                hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isActing === "ditolak" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Tolak Berkas
            </button>
            <button
              onClick={() => handleAction("terverifikasi")}
              disabled={!!isActing || !submission?.is_submitted}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl
                disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/25
                hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              {isActing === "terverifikasi" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Verifikasi &amp; Terima
            </button>
          </div>
        )}
        {registrant.status === "terverifikasi" && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">Berkas telah diverifikasi.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
