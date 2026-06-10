"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { Printer, Search, User, X, CheckCircle, Loader2 } from "lucide-react";
import { searchStudents } from "@/actions/attendance";
import { getSchoolConfig } from "@/actions/schoolConfig";
import { createPiketPermit } from "@/actions/piket";

interface StudentResult {
  student_id: string;
  name: string;
  nisn: string;
  className: string;
  gender: string;
}

interface SelectedStudent {
  student_id: string;
  name: string;
  nisn: string;
  className: string;
}

interface SchoolInfo {
  name: string;
  npsn: string;
  contact_info: { address: string; phone: string };
  headmaster_name: string;
}

export default function PermitPrintClient() {
  const printRef = useRef<HTMLDivElement>(null);

  // School config
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: "SMA KOMPLEKS",
    npsn: "",
    contact_info: { address: "", phone: "" },
    headmaster_name: "",
  });

  // Student search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permit form
  const [permitType, setPermitType] = useState<"KELUAR" | "MASUK" | "DISPENSASI">("KELUAR");
  const [reason, setReason] = useState("");
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [time] = useState(
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );

  // Load school config once
  useEffect(() => {
    getSchoolConfig().then((cfg) => {
      if (cfg) setSchoolInfo(cfg as SchoolInfo);
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const results = await searchStudents(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectStudent = useCallback((student: StudentResult) => {
    setSelectedStudent({
      student_id: student.student_id,
      name: student.name,
      nisn: student.nisn,
      className: student.className,
    });
    setSearchQuery(student.name);
    setShowDropdown(false);
  }, []);

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const permitTypeLabel = {
    KELUAR: "Izin Keluar",
    MASUK: "Izin Masuk Terlambat",
    DISPENSASI: "Dispensasi",
  }[permitType];

  const handlePrint = async () => {
    if (!selectedStudent) return;

    try {
      await createPiketPermit({
        student_id: selectedStudent.student_id,
        permit_type: permitType,
        reason: reason || "-",
      });
    } catch(e) {
      console.error("Failed to save permit record", e);
    }

    const printWindow = window.open("", "_blank", "width=350,height=400");
    if (!printWindow) return;

    const dateFormatted = new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat ${permitTypeLabel} - ${selectedStudent.name}</title>
        <style>
          @page { size: 5cm 8cm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 5cm;
            min-height: 8cm;
            font-family: 'Arial', sans-serif;
            padding: 3mm;
            background: #fff;
            color: #000;
            display: flex;
            flex-direction: column;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 2mm;
            margin-bottom: 2mm;
          }
          .header .school-name {
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.3;
          }
          .header .school-npsn {
            font-size: 5pt;
            color: #444;
            margin-top: 0.5mm;
          }
          .header .school-addr {
            font-size: 4.5pt;
            color: #555;
            margin-top: 0.5mm;
          }
          .title-surat {
            text-align: center;
            font-size: 6.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 1mm;
          }
          .type-badge {
            text-align: center;
            font-size: 8pt;
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 1.5mm 2mm;
            margin-bottom: 2mm;
            letter-spacing: 1px;
            border-radius: 1mm;
          }
          .info-table {
            width: 100%;
            font-size: 5.5pt;
            line-height: 1.7;
            border-collapse: collapse;
          }
          .info-table td { vertical-align: top; }
          .info-table .lbl {
            font-weight: bold;
            width: 40%;
            padding-right: 1mm;
            white-space: nowrap;
          }
          .info-table .val { width: 60%; }
          .footer {
            text-align: center;
            border-top: 1px dashed #999;
            padding-top: 1.5mm;
            margin-top: auto;
            font-size: 5pt;
            color: #666;
          }
          .footer .ttd {
            margin-top: 6mm;
            font-size: 5.5pt;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${schoolInfo.name}</div>
          ${schoolInfo.npsn ? `<div class="school-npsn">NPSN: ${schoolInfo.npsn}</div>` : ""}
          ${schoolInfo.contact_info?.address ? `<div class="school-addr">${schoolInfo.contact_info.address}</div>` : ""}
        </div>

        <div class="title-surat">Surat Keterangan</div>
        <div class="type-badge">${permitTypeLabel.toUpperCase()}</div>

        <table class="info-table">
          <tr><td class="lbl">Nama</td><td class="val">: ${selectedStudent.name}</td></tr>
          <tr><td class="lbl">NISN</td><td class="val">: ${selectedStudent.nisn}</td></tr>
          <tr><td class="lbl">Kelas</td><td class="val">: ${selectedStudent.className}</td></tr>
          <tr><td class="lbl">Keperluan</td><td class="val">: ${reason || "-"}</td></tr>
          <tr><td class="lbl">Tanggal</td><td class="val">: ${dateFormatted}</td></tr>
          <tr><td class="lbl">Jam</td><td class="val">: ${time} WIB</td></tr>
        </table>

        <div class="footer">
          <div>Staf Piket</div>
          <div class="ttd">_________________________</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
        <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center ring-4 ring-indigo-50 dark:ring-indigo-500/10 mr-1">
            <Printer className="w-5 h-5 flex-shrink-0" />
          </div>
          Cetak Surat Izin / Dispensasi
        </h2>

        <div className="space-y-5">
          {/* Student Search */}
          <div className="space-y-2">
            <Label className="dark:text-slate-300 font-semibold">
              Cari Siswa <span className="text-red-500">*</span>
            </Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Ketik nama atau NISN siswa..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedStudent && e.target.value !== selectedStudent.name) {
                      setSelectedStudent(null);
                    }
                  }}
                  className="pl-9 pr-9 dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50"
                  autoComplete="off"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                )}
                {selectedStudent && !isSearching && (
                  <button
                    onClick={handleClearStudent}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown results */}
              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                  {searchResults.map((student) => (
                    <button
                      key={student.student_id}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors text-left border-b border-slate-100 dark:border-white/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          NISN: {student.nisn} &nbsp;·&nbsp; {student.className}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {showDropdown && searchResults.length === 0 && !isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-4 text-center text-sm text-slate-400 dark:text-slate-500">
                  Siswa tidak ditemukan
                </div>
              )}
            </div>

            {/* Selected student pill */}
            {selectedStudent && (
              <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-sm text-indigo-800 dark:text-indigo-300">
                    {selectedStudent.name}
                  </span>
                  <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70 ml-2">
                    {selectedStudent.className} · NISN {selectedStudent.nisn}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Permit type */}
            <div className="space-y-2">
              <Label className="dark:text-slate-300 font-semibold">Jenis Surat</Label>
              <Select
                value={permitType}
                onValueChange={(v) => setPermitType(v as "KELUAR" | "MASUK" | "DISPENSASI")}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 border-white/10">
                  <SelectItem value="KELUAR" className="focus:dark:bg-slate-800">
                    Izin Keluar
                  </SelectItem>
                  <SelectItem value="MASUK" className="focus:dark:bg-slate-800">
                    Izin Masuk Terlambat
                  </SelectItem>
                  <SelectItem value="DISPENSASI" className="focus:dark:bg-slate-800">
                    Dispensasi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="dark:text-slate-300 font-semibold">Keperluan / Alasan</Label>
              <Input
                placeholder="Keperluan izin..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="dark:bg-slate-800 dark:border-white/10 dark:text-white focus:dark:ring-indigo-500/50"
              />
            </div>
          </div>

          <Button
            onClick={handlePrint}
            disabled={!selectedStudent || !reason.trim()}
            className="w-full bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white disabled:opacity-40"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Surat {permitTypeLabel}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">
          Preview Surat (5cm × 8cm)
        </h3>
        <div className="flex justify-center bg-slate-50 dark:bg-slate-950 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
          <div
            ref={printRef}
            className="border border-slate-300 shadow-lg bg-white box-content text-black"
            style={{ width: "189px", minHeight: "264px", padding: "8px", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column" }}
          >
            {/* Header Preview */}
            <div className="text-center border-b-2 border-black pb-1 mb-1.5">
              <div className="text-[7.5pt] font-bold uppercase tracking-tight text-black leading-tight">
                {schoolInfo.name}
              </div>
              {schoolInfo.npsn && (
                <div className="text-[5pt] text-gray-500">NPSN: {schoolInfo.npsn}</div>
              )}
              {schoolInfo.contact_info?.address && (
                <div className="text-[4.5pt] text-gray-500 truncate">{schoolInfo.contact_info.address}</div>
              )}
            </div>

            <div className="text-[6pt] font-bold uppercase tracking-wider text-center mb-1">
              Surat Keterangan
            </div>
            <div className="text-center text-[7pt] font-bold bg-black text-white py-[3px] mb-2 tracking-widest rounded-sm">
              {permitTypeLabel.toUpperCase()}
            </div>

            <div className="text-[6pt] leading-[1.7] space-y-[0.5px] text-black flex-1">
              <div className="flex gap-1">
                <span className="font-bold w-[38%] shrink-0">Nama</span>
                <span>: {selectedStudent?.name || <span className="text-gray-400 italic">—</span>}</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold w-[38%] shrink-0">NISN</span>
                <span>: {selectedStudent?.nisn || <span className="text-gray-400 italic">—</span>}</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold w-[38%] shrink-0">Kelas</span>
                <span>: {selectedStudent?.className || <span className="text-gray-400 italic">—</span>}</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold w-[38%] shrink-0">Keperluan</span>
                <span>: {reason || <span className="text-gray-400 italic">—</span>}</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold w-[38%] shrink-0">Tanggal</span>
                <span>: {new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold w-[38%] shrink-0">Jam</span>
                <span>: {time} WIB</span>
              </div>
            </div>

            <div className="text-[5pt] text-center text-gray-400 border-t border-dashed mt-2 pt-1">
              <div>Staf Piket</div>
              <div className="mt-3 font-bold text-[5.5pt] text-black">___________________</div>
            </div>
          </div>
        </div>

        {!selectedStudent && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3 italic">
            Cari dan pilih siswa terlebih dahulu untuk melihat preview surat
          </p>
        )}
      </div>
    </div>
  );
}
