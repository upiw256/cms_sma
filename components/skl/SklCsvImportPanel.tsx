"use client";

import { useState } from "react";
import { Upload, FileDown, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { importSklStudentsFromCsv } from "@/actions/skl";

export function SklCsvImportPanel({ onImported }: { onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResult(null);
    
    try {
      const text = await file.text();
      // Simple CSV parser
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) throw new Error("File CSV kosong atau tidak valid.");

      const headers = lines[0].toLowerCase().split(",");
      const reqHeaders = ["no_ujian", "nisn", "nama", "kelas", "status_lulus"];
      
      const missing = reqHeaders.filter(h => !headers.some(hw => hw.includes(h)));
      if (missing.length > 0) {
        throw new Error(`Format kolom tidak sesuai. Kolom wajib: ${reqHeaders.join(", ")}`);
      }

      // Map indices
      const idx = reqHeaders.map(h => headers.findIndex(hw => hw.includes(h)));

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Handle basic quotes parsing if needed, or stick to simple split
        const cols = lines[i].split(",").map(c => c.replace(/^"|"$/g, "").trim());
        if (cols.length < headers.length) continue; // Skip malformed rows
        
        rows.push({
          no_ujian: cols[idx[0]],
          nisn: cols[idx[1]],
          nama: cols[idx[2]],
          kelas: cols[idx[3]],
          status_lulus: cols[idx[4]],
        });
      }

      if (rows.length === 0) throw new Error("Tidak ada data valid yang bisa diproses.");

      const res = await importSklStudentsFromCsv(rows);
      setResult(res);
      if (res.inserted > 0) {
        onImported();
      }
    } catch (err: any) {
      setResult({ inserted: 0, skipped: 0, errors: [err.message] });
    } finally {
      setIsUploading(false);
    }
  };

  const dlTemplate = () => {
    const csv = "no_ujian,nisn,nama,kelas,status_lulus\nU-001,0012345678,Budi Santoso,XII IPA 1,lulus\nU-002,0012345679,Siti Aminah,XII IPS 1,tidak lulus";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_skl.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Upload File CSV
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 dark:text-slate-400
                file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Pastikan file berformat .csv dan kolom sesuai dengan template.
          </p>
        </div>
        <div className="flex items-end shrink-0">
          <button
            onClick={dlTemplate}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-xl mb-6 border ${result.inserted > 0 ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300"}`}>
          <div className="flex items-center gap-2 mb-2 font-bold">
            {result.inserted > 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            Hasil Import
          </div>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Berhasil Ditambahkan: <strong>{result.inserted}</strong> data</li>
            <li>Dilewati (Duplikat/Sudah Ada): <strong>{result.skipped}</strong> data</li>
            {result.errors.length > 0 && (
              <li className="text-red-600 dark:text-red-400 mt-2">
                <strong>Error Baris:</strong>
                <ul className="pl-5 mt-1 max-h-32 overflow-y-auto list-decimal text-xs space-y-1">
                  {result.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {result.errors.length > 50 && <li>...dan {result.errors.length - 50} error lainnya.</li>}
                </ul>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-xl
            hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Memproses...</>
          ) : (
            <><Upload className="w-4 h-4" /> Mulai Import</>
          )}
        </button>
      </div>
    </div>
  );
}
