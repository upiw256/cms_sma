"use client";

import { useState, useEffect } from "react";
import { verifySkl } from "@/actions/skl";
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle, Clock, FileText, ChevronLeft, Download } from "lucide-react";

export default function SklClient({ settings }: { settings: any }) {
  const [noUjian, setNoUjian] = useState("");
  const [nisn, setNisn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [result, setResult] = useState<any>(null);
  
  // Waiting Room state
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (!settings?.is_published) {
      setIsWaiting(true);
      return;
    }

    if (settings?.tanggal_pengumuman) {
      const targetTime = new Date(settings.tanggal_pengumuman).getTime();
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
          setIsWaiting(false);
          setTimeLeft(null);
          clearInterval(timer);
        } else {
          setIsWaiting(true);
          setTimeLeft({
            d: Math.floor(diff / (1000 * 60 * 60 * 24)),
            h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            s: Math.floor((diff % (1000 * 60)) / 1000),
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [settings]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noUjian || !nisn) {
      setErrorMsg("Harap isi Nomor Ujian dan NISN");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await verifySkl({ no_ujian: noUjian, nisn });
      if (!res.found) {
        setErrorMsg(res.message || "Data tidak ditemukan.");
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem, silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings?.is_published) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-xl border border-slate-100 dark:border-white/5 animate-scale-in">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Belum Dibuka</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Mohon maaf, pengumuman kelulusan saat ini sedang ditutup atau belum dipublikasikan oleh panitia sekolah.
        </p>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        {/* Waiting Room Animation Background */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse delay-75" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6">
            <Clock className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Antrean Virtual SKL</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Halaman ini akan otomatis memuat formulir pencarian segera setelah waktu pengumuman tiba. Harap jangan merefresh halaman.
          </p>

          <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-md mx-auto">
            {[
              { label: "HARI", val: timeLeft?.d ?? 0 },
              { label: "JAM", val: timeLeft?.h ?? 0 },
              { label: "MENIT", val: timeLeft?.m ?? 0 },
              { label: "DETIK", val: timeLeft?.s ?? 0 },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 flex flex-col items-center shadow-inner">
                <span className="text-3xl font-black font-mono text-slate-800 dark:text-white mb-1">
                  {t.val.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const student = result.student;
    const isLulus = student.status_lulus === "lulus";
    const isTidakLulus = student.status_lulus === "tidak_lulus";
    const isDitunda = student.status_lulus === "ditunda";

    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-700 animate-slide-up">
        {/* Print wrapper to hide non-print elements */}
        <div id="skl-print-area">
          <div className="text-center mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
            {isLulus ? (
              <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-full mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            ) : isTidakLulus ? (
              <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4">
                <Clock className="w-16 h-16 text-amber-500" />
              </div>
            )}
            
            <h2 className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-2">Berdasarkan hasil rapat Pleno, Saudara/i:</h2>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{student.nama}</h3>
            <p className="text-slate-500 mt-2 font-medium">No. Ujian: <span className="font-mono text-slate-900 dark:text-white px-2">{student.no_ujian}</span> | NISN: <span className="font-mono text-slate-900 dark:text-white px-2">{student.nisn}</span></p>
          </div>

          <div className="text-center mb-8">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-widest block mb-4">Dinyatakan</span>
            <div className={`
              inline-block px-12 py-4 rounded-full border-2 text-4xl font-black uppercase tracking-widest
              ${isLulus ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10' : 
                isTidakLulus ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-500/10' : 
                'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-500/10'}
            `}>
              {isLulus ? "LULUS" : isTidakLulus ? "TIDAK LULUS" : "DITUNDA"}
            </div>
            
            {(isLulus && settings?.pesan_lulus) && (
              <div className="mt-8 prose prose-slate dark:prose-invert max-w-none text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl mx-auto border border-slate-100 dark:border-slate-700" 
                   dangerouslySetInnerHTML={{ __html: settings.pesan_lulus }} />
            )}
            
            {((isTidakLulus || isDitunda) && settings?.pesan_tidak_lulus) && (
              <div className="mt-8 prose prose-slate dark:prose-invert max-w-none text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl mx-auto border border-slate-100 dark:border-slate-700"
                   dangerouslySetInnerHTML={{ __html: settings.pesan_tidak_lulus }} />
            )}

            {student.catatan && (
              <div className="mt-6 inline-flex items-start text-left gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800/30">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">Catatan Tambahan:</p>
                  <p className="text-sm leading-relaxed">{student.catatan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-700 justify-center">
          <button 
            onClick={() => window.print()} 
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl transition"
          >
            <Download className="w-5 h-5" /> Cetak / PDF
          </button>
          <button 
            onClick={() => setResult(null)} 
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <form onSubmit={handleVerify} className="relative z-10 space-y-6">
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-900/30">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nomor Peserta Ujian</label>
            <input
              type="text"
              value={noUjian}
              onChange={(e) => setNoUjian(e.target.value)}
              placeholder="Contoh: 01-123-456-7"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono tracking-wider font-semibold placeholder:font-sans placeholder:font-normal placeholder:tracking-normal text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">NISN (10 Digit)</label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Contoh: 0012345678"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono tracking-wider font-semibold placeholder:font-sans placeholder:font-normal placeholder:tracking-normal text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-primary text-white font-bold text-lg py-5 rounded-2xl hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
        >
          {isLoading ? (
             <><Loader2 className="w-6 h-6 animate-spin" /> Sedang Memeriksa...</>
          ) : (
             <><Search className="w-6 h-6" /> CEK HASIL KELULUSAN</>
          )}
        </button>
      </form>
    </div>
  );
}
