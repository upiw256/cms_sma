"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyRegistrant } from "@/actions/ppdb";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

type VerifyResult =
  | { found: false; message: string }
  | {
      found: true;
      status: string;
      token?: string;
      nama?: string;
      no_peserta?: string;
      pilihan_kelas?: string;
      message: string;
    };

export default function VerifikasiPage() {
  const router = useRouter();
  const [noPeserta, setNoPeserta] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!noPeserta.trim() || !tanggalLahir) return;
    setIsLoading(true);
    setResult(null);
    try {
      const res = await verifyRegistrant({
        no_peserta: noPeserta.trim(),
        tanggal_lahir: tanggalLahir,
      });
      setResult(res as VerifyResult);
    } catch {
      setResult({ found: false, message: "Terjadi kesalahan server. Coba beberapa saat lagi." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    if (result?.found && result.token) {
      router.push(`/ppdb/daftar-ulang/${result.token}`);
    }
  }

  const statusColor = result?.found
    ? result.status === "ditolak"
      ? "red"
      : "green"
    : "amber";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Verifikasi Penerimaan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Masukkan data Anda untuk memeriksa status penerimaan dari sistem Dinas Pendidikan.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label
                htmlFor="no_peserta"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                Nomor Peserta PPDB
              </label>
              <input
                id="no_peserta"
                type="text"
                value={noPeserta}
                onChange={(e) => setNoPeserta(e.target.value)}
                placeholder="Contoh: 1234567890"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100
                  placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30
                  focus:border-primary transition-all duration-200 font-mono text-lg tracking-wider"
              />
            </div>

            <div>
              <label
                htmlFor="tanggal_lahir"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-slate-400" />
                Tanggal Lahir
              </label>
              <input
                id="tanggal_lahir"
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !noPeserta.trim() || !tanggalLahir}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl
                hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Cek Status Penerimaan
                </>
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div
              className={`mt-6 rounded-xl border p-5 ${
                !result.found
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700"
                  : result.status === "ditolak"
                  ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"
                  : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {!result.found ? (
                  <AlertCircle className={`w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5`} />
                ) : result.status === "ditolak" ? (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm ${
                      !result.found
                        ? "text-amber-800 dark:text-amber-300"
                        : result.status === "ditolak"
                        ? "text-red-800 dark:text-red-300"
                        : "text-green-800 dark:text-green-300"
                    }`}
                  >
                    {result.message}
                  </p>

                  {result.found && result.status !== "ditolak" && (
                    <div className="mt-3 space-y-1 text-sm">
                      {result.nama && (
                        <p className="text-green-700 dark:text-green-400">
                          <span className="font-medium">Nama:</span> {result.nama}
                        </p>
                      )}
                      {result.no_peserta && (
                        <p className="text-green-700 dark:text-green-400">
                          <span className="font-medium">No. Peserta:</span>{" "}
                          <span className="font-mono">{result.no_peserta}</span>
                        </p>
                      )}
                      {result.pilihan_kelas && (
                        <p className="text-green-700 dark:text-green-400">
                          <span className="font-medium">Kelas:</span> {result.pilihan_kelas}
                        </p>
                      )}
                      {result.status === "terverifikasi" && (
                        <p className="text-green-700 dark:text-green-400 font-semibold mt-2">
                          ✅ Daftar ulang Anda sudah terverifikasi oleh admin.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {result.found && result.status !== "ditolak" && result.status !== "terverifikasi" && result.token && (
                <button
                  onClick={handleContinue}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors duration-200"
                >
                  Lanjut Daftar Ulang
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Data penerimaan bersumber dari sistem Dinas Pendidikan setempat.
          Jika ada kendala, hubungi panitia PPDB sekolah.
        </p>
      </div>
    </div>
  );
}
