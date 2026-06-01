"use client";

import { useState, useRef } from "react";
import { importRegistrantsFromCsv } from "@/actions/ppdb";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  X,
  Download,
} from "lucide-react";

interface Props {
  onImported?: () => void;
}

interface ParsedRow {
  no_peserta: string;
  nama: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  asal_sekolah: string;
  pilihan_kelas?: string;
  jalur_daftar?: string;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row as unknown as ParsedRow;
  }).filter((r) => r.no_peserta);
}

function downloadTemplate() {
  const headers = ["no_peserta", "nama", "tanggal_lahir", "jenis_kelamin", "asal_sekolah", "pilihan_kelas", "jalur_daftar"];
  const examples = [
    ["2024-001", "Ahmad Fauzi", "2009-05-14", "L", "SMP Negeri 1 Contoh", "IPA 1", "Zonasi"],
    ["2024-002", "Siti Rahayu", "2009-08-22", "P", "SMP Negeri 2 Contoh", "IPS 2", "Prestasi"],
  ];
  const csv = [headers, ...examples]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_ppdb_daftar_ulang.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportPanel({ onImported }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      alert("Hanya file CSV yang diterima.");
      return;
    }
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(parseCsv(text).slice(0, 5));
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!fileRef.current?.files?.[0]) return;
    setIsImporting(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = parseCsv(text);
      try {
        const res = await importRegistrantsFromCsv(rows);
        setResult(res);
        setPreview([]);
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
        onImported?.();
      } catch {
        setResult({ inserted: 0, skipped: 0, errors: ["Gagal memproses import."] });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(fileRef.current.files[0], "UTF-8");
  }

  function handleReset() {
    setPreview([]);
    setFileName("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Format info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-1">Format CSV yang diperlukan:</p>
          <p className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 rounded px-2 py-1 mt-1">
            no_peserta, nama, tanggal_lahir, jenis_kelamin, asal_sekolah, pilihan_kelas, jalur_daftar
          </p>
          <p className="mt-1.5 text-xs opacity-80">
            tanggal_lahir format: YYYY-MM-DD &nbsp;|&nbsp; jenis_kelamin: L atau P
          </p>
          <button
            type="button"
            onClick={downloadTemplate}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700
              text-white text-xs font-semibold transition-colors shadow-sm hover:shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Download Template CSV
          </button>
        </div>
      </div>

      {/* Drop zone */}
      {!fileName ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Drag &amp; drop file CSV di sini
          </p>
          <p className="text-sm text-slate-400 mt-1">atau klik untuk memilih file</p>
        </label>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fileName}</p>
                <p className="text-xs text-slate-400">{preview.length > 0 ? `${preview.length}+ baris terdeteksi` : "Memuat..."}</p>
              </div>
            </div>
            <button onClick={handleReset} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  <tr>
                    {["No. Peserta", "Nama", "Tgl Lahir", "JK", "Asal Sekolah", "Kelas"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-3 py-2 font-mono">{row.no_peserta}</td>
                      <td className="px-3 py-2">{row.nama}</td>
                      <td className="px-3 py-2">{row.tanggal_lahir}</td>
                      <td className="px-3 py-2">{row.jenis_kelamin}</td>
                      <td className="px-3 py-2 truncate max-w-[120px]">{row.asal_sekolah}</td>
                      <td className="px-3 py-2">{row.pilihan_kelas || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 px-3 py-2">* Menampilkan 5 baris pertama sebagai preview</p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl
              hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed
              hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            {isImporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</>
            ) : (
              <><Upload className="w-4 h-4" /> Mulai Import Data</>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-4 ${
          result.errors.length === 0
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        }`}>
          <div className="flex items-start gap-3">
            {result.errors.length === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Hasil Import</p>
              <p className="text-green-700 dark:text-green-400">✓ Berhasil ditambahkan: <strong>{result.inserted}</strong> data</p>
              <p className="text-slate-500">⟳ Dilewati (duplikat): <strong>{result.skipped}</strong> data</p>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-red-700 dark:text-red-400 font-medium">✗ Error ({result.errors.length}):</p>
                  <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
