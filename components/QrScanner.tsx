"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isScanning: boolean;
}

export default function QrScanner({ onScanSuccess, isScanning }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isScanning || !containerRef.current) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {
          // ignore errors during scanning
        }
      )
      .catch((err: Error) => {
        setError("Kamera tidak dapat diakses. Pastikan izin kamera diaktifkan.");
        console.error(err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        id="qr-reader"
        ref={containerRef}
        className="rounded-2xl overflow-hidden border-4 border-dashed border-slate-300 bg-black min-h-[300px]"
      />
      {error && (
        <p className="text-red-500 text-sm text-center mt-3 font-medium">{error}</p>
      )}
    </div>
  );
}
