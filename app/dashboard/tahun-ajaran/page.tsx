import dbConnect from "@/lib/db";
import AcademicYear from "@/models/AcademicYear";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CheckCircle2, Archive } from "lucide-react";
import AcademicYearFormModalClient from "./AcademicYearFormModalClient";
import { SetActiveButton, DeleteAcademicYearButton } from "./AcademicYearActionsClient";

export default async function DataTahunAjaranPage() {
  await dbConnect();

  const years = await AcademicYear.find().sort({ start_date: -1 }).lean();
  const activeYear = years.find((y: any) => y.is_active);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up pb-10">

      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tahun Ajaran & Semester</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Konfigurasi periode akademik aktif</p>
        </div>
        <AcademicYearFormModalClient />
      </div>

      {/* Active Year Card */}
      {activeYear ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">Periode Aktif Saat Ini</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{(activeYear as any).name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date((activeYear as any).start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              &nbsp;—&nbsp;
              {new Date((activeYear as any).end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
            Aktif
          </span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-3">
          <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            Belum ada Tahun Ajaran yang diaktifkan. Tambah dan set aktif agar sistem berjalan dengan benar.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="dark:border-white/5">
              <TableHead className="dark:text-slate-300">Nama Periode</TableHead>
              <TableHead className="dark:text-slate-300">Tanggal Mulai</TableHead>
              <TableHead className="dark:text-slate-300">Tanggal Selesai</TableHead>
              <TableHead className="dark:text-slate-300">Durasi</TableHead>
              <TableHead className="dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.length === 0 ? (
              <TableRow className="dark:border-white/5">
                <TableCell colSpan={6} className="text-center py-14 text-slate-500 dark:text-slate-400 italic">
                  Belum ada tahun ajaran yang ditambahkan.
                </TableCell>
              </TableRow>
            ) : (
              years.map((y: any) => {
                const serialized = JSON.parse(JSON.stringify(y));
                const start = new Date(y.start_date);
                const end = new Date(y.end_date);
                const durationMonths = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
                return (
                  <TableRow key={y._id.toString()} className={`dark:border-white/5 transition-colors ${y.is_active ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "hover:dark:bg-slate-800/30"}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {y.is_active && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        <span className={`font-bold ${y.is_active ? "text-emerald-700 dark:text-emerald-400" : "dark:text-white"}`}>
                          {y.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-slate-300 text-sm">
                      {start.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="dark:text-slate-300 text-sm">
                      {end.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="dark:text-slate-400 text-sm">
                      ~{durationMonths} bulan
                    </TableCell>
                    <TableCell>
                      {y.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold uppercase">
                          Arsip
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AcademicYearFormModalClient year={serialized} />
                        {!y.is_active && <SetActiveButton id={y._id.toString()} />}
                        {!y.is_active && <DeleteAcademicYearButton id={y._id.toString()} />}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
