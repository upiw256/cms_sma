"use client";

import { useState, useRef, ChangeEvent } from "react";
import { saveStep2 } from "@/actions/ppdb";
import { uploadFile } from "@/actions/upload";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X,
  ImageIcon,
} from "lucide-react";

interface BerkasField {
  key: keyof BerkasState;
  label: string;
  required: boolean;
  keterangan?: string;
}

interface BerkasState {
  ijazah_url: string;
  skhun_url: string;
  akte_kelahiran_url: string;
  kartu_keluarga_url: string;
  pas_foto_url: string;
  surat_domisili_url: string;
  kartu_prestasi_url: string;
}

const DEFAULT_FIELDS: BerkasField[] = [
  { key: "ijazah_url", label: "Ijazah / STTB", required: true, keterangan: "Scan seluruh halaman ijazah" },
  { key: "skhun_url", label: "SKHUN", required: false, keterangan: "Surat Keterangan Hasil Ujian Nasional" },
  { key: "akte_kelahiran_url", label: "Akte Kelahiran", required: true },
  { key: "kartu_keluarga_url", label: "Kartu Keluarga (KK)", required: true },
  { key: "pas_foto_url", label: "Pas Foto 3×4", required: true, keterangan: "Background merah, JPG/PNG" },
  { key: "surat_domisili_url", label: "Surat Domisili", required: false, keterangan: "Jika berbeda dengan KTP" },
  { key: "kartu_prestasi_url", label: "Sertifikat Prestasi", required: false, keterangan: "Jika ada" },
];

// Convert file to WebP using canvas
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX) { height = (height * MAX) / width; width = MAX; }
        if (height > MAX) { width = (width * MAX) / height; height = MAX; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/webp", 0.85);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  token: string;
  existingBerkas?: Partial<BerkasState>;
  berkasRequirements?: BerkasField[];
  onComplete: () => void;
}

export function Step2Berkas({ token, existingBerkas, berkasRequirements, onComplete }: Props) {
  const fields = berkasRequirements || DEFAULT_FIELDS;
  const [berkas, setBerkas] = useState<BerkasState>({
    ijazah_url: existingBerkas?.ijazah_url || "",
    skhun_url: existingBerkas?.skhun_url || "",
    akte_kelahiran_url: existingBerkas?.akte_kelahiran_url || "",
    kartu_keluarga_url: existingBerkas?.kartu_keluarga_url || "",
    pas_foto_url: existingBerkas?.pas_foto_url || "",
    surat_domisili_url: existingBerkas?.surat_domisili_url || "",
    kartu_prestasi_url: existingBerkas?.kartu_prestasi_url || "",
  });
  const [uploading, setUploading] = useState<Partial<Record<keyof BerkasState, boolean>>>({});
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<keyof BerkasState, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleFileChange(fieldKey: keyof BerkasState, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({ ...prev, [fieldKey]: "Ukuran file maksimal 5MB" }));
      return;
    }

    setUploading((prev) => ({ ...prev, [fieldKey]: true }));
    setUploadErrors((prev) => ({ ...prev, [fieldKey]: "" }));

    try {
      let blob: Blob = file;
      if (file.type.startsWith("image/") && file.type !== "image/webp") {
        blob = await convertToWebP(file);
      }
      const fd = new FormData();
      fd.append("file", blob, file.name.replace(/\.[^.]+$/, ".webp"));
      const result = await uploadFile(fd);
      if (result.url) {
        setBerkas((prev) => ({ ...prev, [fieldKey]: result.url }));
      }
    } catch {
      setUploadErrors((prev) => ({ ...prev, [fieldKey]: "Gagal mengupload file" }));
    } finally {
      setUploading((prev) => ({ ...prev, [fieldKey]: false }));
      if (inputRefs.current[fieldKey]) {
        inputRefs.current[fieldKey]!.value = "";
      }
    }
  }

  async function handleSubmit() {
    // Check required fields
    const missing = fields.filter((f) => f.required && !berkas[f.key]);
    if (missing.length > 0) {
      setErrorMsg(`Berkas wajib belum diupload: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setIsSaving(true);
    setErrorMsg("");
    try {
      const res = await saveStep2(token, berkas);
      if (res.success) {
        onComplete();
      } else {
        setErrorMsg(res.message || "Terjadi kesalahan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const url = berkas[field.key];
        const isUploading = uploading[field.key];
        const err = uploadErrors[field.key];

        return (
          <div
            key={field.key}
            className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </p>
                {field.keterangan && (
                  <p className="text-xs text-slate-400 mt-0.5">{field.keterangan}</p>
                )}
              </div>
              {url && (
                <button
                  onClick={() => setBerkas((prev) => ({ ...prev, [field.key]: "" }))}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Hapus file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {url ? (
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                {url.endsWith(".webp") || url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={url} alt={field.label} className="w-16 h-12 object-cover rounded-lg border border-green-200" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-green-500" />
                )}
                <div>
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Berhasil diupload
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 underline"
                  >
                    Lihat file
                  </a>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group">
                <input
                  ref={(el) => { inputRefs.current[field.key] = el; }}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(field.key, e)}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary/60 transition-colors mb-2" />
                )}
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isUploading ? "Mengupload..." : "Klik untuk pilih file"}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">JPG, PNG, PDF — maks. 5MB</span>
              </label>
            )}

            {err && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {err}
              </p>
            )}
          </div>
        );
      })}

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSaving || Object.values(uploading).some(Boolean)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl
          hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
      >
        {isSaving ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
        ) : (
          "Simpan & Lanjut ke Konfirmasi →"
        )}
      </button>
    </div>
  );
}
