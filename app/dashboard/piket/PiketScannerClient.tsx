"use client";

import { useState, useCallback, useRef } from "react";
import QrScanner from "@/components/QrScanner";
import { scanAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, XCircle, Volume2 } from "lucide-react";

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  timestamp: Date;
}

export default function PiketScannerClient({ userId }: { userId: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const processingRef = useRef(false);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const result = await scanAttendance(decodedText.trim(), userId);
        const scanResult: ScanResult = {
          ...result,
          timestamp: new Date(),
        };
        setLastResult(scanResult);
        setHistory((prev) => [scanResult, ...prev].slice(0, 50));

        // Visual + Audio feedback
        if (result.success) {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 880;
            osc.type = "sine";
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), 150);
          } catch {}
        } else {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 300;
            osc.type = "square";
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), 300);
          } catch {}
        }
      } catch (err) {
        setLastResult({
          success: false,
          message: "Terjadi kesalahan sistem.",
          timestamp: new Date(),
        });
      } finally {
        setTimeout(() => {
          processingRef.current = false;
        }, 2000);
      }
    },
    [userId]
  );

  return (
    <div className="space-y-6">
      {/* Scanner Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center ring-4 ring-blue-50 dark:ring-blue-500/10">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg dark:text-white">Scanner QR Kartu Pelajar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Arahkan kartu pelajar ke kamera untuk absensi</p>
            </div>
          </div>
          <Button
            onClick={() => setIsScanning(!isScanning)}
            variant={isScanning ? "destructive" : "default"}
            className={!isScanning ? "bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white" : ""}
          >
            {isScanning ? "Hentikan Scanner" : "Mulai Scan"}
          </Button>
        </div>

        {isScanning && <QrScanner onScanSuccess={handleScan} isScanning={isScanning} />}

        {!isScanning && !lastResult && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
            <QrCode className="w-20 h-20 mb-4 opacity-30" />
            <p className="text-lg font-medium">Klik "Mulai Scan" untuk mengaktifkan kamera.</p>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {lastResult && (
        <div
          className={`rounded-2xl p-6 flex items-center gap-4 shadow-sm border animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors ${
            lastResult.success
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400"
          }`}
        >
          {lastResult.success ? (
            <CheckCircle className="w-10 h-10 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-10 h-10 text-red-500 shrink-0" />
          )}
          <div>
            <p className="font-bold text-lg">{lastResult.message}</p>
            <p className="text-xs opacity-70 mt-1 dark:text-current">
              {lastResult.timestamp.toLocaleTimeString("id-ID")}
            </p>
          </div>
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Riwayat Scan Hari Ini</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {history.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${
                  item.success 
                    ? "bg-emerald-50 dark:bg-emerald-500/5 text-slate-700 dark:text-emerald-300" 
                    : "bg-red-50 dark:bg-red-500/5 text-slate-700 dark:text-red-300"
                }`}
              >
                {item.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                )}
                <span className="flex-1 font-medium">{item.message}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                  {item.timestamp.toLocaleTimeString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
