"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";

interface PermitData {
  studentName: string;
  className: string;
  permitType: "KELUAR" | "MASUK" | "DISPENSASI";
  reason: string;
  date: string;
  time: string;
}

export default function PermitPrintClient() {
  const printRef = useRef<HTMLDivElement>(null);
  const [permit, setPermit] = useState<PermitData>({
    studentName: "",
    className: "",
    permitType: "KELUAR",
    reason: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=300,height=300");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Izin - ${permit.studentName}</title>
        <style>
          @page {
            size: 5cm 5cm;
            margin: 0;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 5cm;
            height: 5cm;
            font-family: 'Arial', sans-serif;
            padding: 3mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #fff;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 1.5mm;
            margin-bottom: 1.5mm;
          }
          .header h1 {
            font-size: 6pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header p {
            font-size: 5pt;
            color: #555;
          }
          .type-badge {
            text-align: center;
            font-size: 7pt;
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 1mm 0;
            margin-bottom: 1.5mm;
            letter-spacing: 1px;
          }
          .info {
            font-size: 5.5pt;
            line-height: 1.6;
            flex: 1;
          }
          .info div {
            display: flex;
            gap: 1mm;
          }
          .info .label {
            font-weight: bold;
            min-width: 10mm;
          }
          .footer {
            text-align: center;
            border-top: 1px dashed #999;
            padding-top: 1mm;
            margin-top: auto;
            font-size: 5pt;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SMA KOMPLEKS</h1>
          <p>Surat Izin Piket</p>
        </div>
        <div class="type-badge">${permit.permitType}</div>
        <div class="info">
          <div><span class="label">Nama</span>: ${permit.studentName}</div>
          <div><span class="label">Kelas</span>: ${permit.className}</div>
          <div><span class="label">Alasan</span>: ${permit.reason}</div>
          <div><span class="label">Tgl</span>: ${permit.date}</div>
          <div><span class="label">Jam</span>: ${permit.time}</div>
        </div>
        <div class="footer">Dicetak oleh Staf Piket</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
        <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center ring-4 ring-indigo-50 dark:ring-indigo-500/10 mr-1">
             <Printer className="w-5 h-5 flex-shrink-0" />
          </div>
          Cetak Surat Izin / Dispensasi (5cm × 5cm)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="dark:text-slate-300">Nama Siswa</Label>
            <Input
              placeholder="Nama siswa"
              value={permit.studentName}
              onChange={(e) => setPermit({ ...permit, studentName: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="dark:text-slate-300">Kelas</Label>
            <Input
              placeholder="X IPA 1"
              value={permit.className}
              onChange={(e) => setPermit({ ...permit, className: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="dark:text-slate-300">Jenis Izin</Label>
            <Select
              value={permit.permitType}
              onValueChange={(v) =>
                setPermit({ ...permit, permitType: v as "KELUAR" | "MASUK" | "DISPENSASI" })
              }
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10">
                <SelectItem value="KELUAR" className="focus:dark:bg-slate-800">Izin Keluar</SelectItem>
                <SelectItem value="MASUK" className="focus:dark:bg-slate-800">Izin Masuk</SelectItem>
                <SelectItem value="DISPENSASI" className="focus:dark:bg-slate-800">Dispensasi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-slate-300">Alasan</Label>
            <Input
              placeholder="Alasan izin..."
              value={permit.reason}
              onChange={(e) => setPermit({ ...permit, reason: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <Button onClick={handlePrint} className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">
            <Printer className="w-4 h-4 mr-2" /> Cetak Surat
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Preview Surat (5cm × 5cm)</h3>
        <div className="flex justify-center bg-slate-50 dark:bg-slate-950 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
          <div
            ref={printRef}
            className="border shadow-lg bg-white box-content text-black"
            style={{ width: "189px", height: "189px", padding: "8px", fontFamily: "Arial, sans-serif" }}
          >
            <div className="text-center border-b border-black pb-1 mb-1">
              <div className="text-[8px] font-bold uppercase tracking-wider text-black">SMA KOMPLEKS</div>
              <div className="text-[6px] text-gray-500">Surat Izin Piket</div>
            </div>
            <div className="text-center text-[8px] font-bold bg-black text-white py-[2px] mb-1 tracking-widest">
              {permit.permitType}
            </div>
            <div className="text-[7px] leading-[1.6] space-y-[1px] text-black">
              <div><b>Nama:</b> {permit.studentName || "—"}</div>
              <div><b>Kelas:</b> {permit.className || "—"}</div>
              <div><b>Alasan:</b> {permit.reason || "—"}</div>
              <div><b>Tgl:</b> {permit.date}</div>
              <div><b>Jam:</b> {permit.time}</div>
            </div>
            <div className="text-[6px] text-center text-gray-400 border-t border-dashed mt-auto pt-1" style={{ marginTop: "auto" }}>
              Dicetak oleh Staf Piket
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
