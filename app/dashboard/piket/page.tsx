import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAttendanceSummaryToday, getRecentAttendance } from "@/actions/attendance";
import { getRecentPermits } from "@/actions/piket";
import PiketScannerClient from "./PiketScannerClient";
import PermitPrintClient from "./PermitPrintClient";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Clock, AlertTriangle, Thermometer } from "lucide-react";

export default async function PiketDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const summary = await getAttendanceSummaryToday();
  const recentRecords = await getRecentAttendance();
  const recentPermits = await getRecentPermits();

  const percentage = summary.total > 0 
    ? Math.round((summary.hadir / summary.total) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Staf Piket</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Rekapitulasi kehadiran harian &mdash; {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Statistik Kehadiran */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-900 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{summary.total}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-900 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{summary.hadir}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Hadir</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-900 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{summary.izin}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Izin</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-900 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{summary.sakit}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Sakit</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-900 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{summary.alfa}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Alfa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-slate-800 dark:text-white">Persentase Kehadiran</span>
          <span className="text-2xl font-extrabold text-[var(--primary-color)] dark:text-blue-400">{percentage}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {summary.hadir} dari {summary.total} siswa sudah terekam hadir hari ini. Belum scan: {summary.belum}.
        </p>
      </div>

      {/* Fitur Client Components (Scanner, Cetak) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PiketScannerClient userId={session.user.id} />
        <PermitPrintClient />
      </div>

      {/* Laporan Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Records */}
        {recentRecords.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">20 Scan Kehadiran Terakhir</h3>
            <div className="space-y-2">
              {recentRecords.map((rec: any) => (
                <div key={rec._id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center text-xs font-bold">
                    {rec.status?.[0] || "H"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate dark:text-slate-200">
                      {rec.student_id?.user_id?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      NISN: {rec.student_id?.user_id?.nip_nisn || "-"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {new Date(rec.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Permits */}
        {recentPermits.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Izin & Dispensasi Terakhir</h3>
            <div className="space-y-2">
              {recentPermits.map((permit: any) => (
                <div key={permit._id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    permit.permit_type === "KELUAR" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" :
                    permit.permit_type === "MASUK" ? "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" :
                    "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                  }`}>
                    {permit.permit_type === "KELUAR" ? "K" : permit.permit_type === "MASUK" ? "M" : "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate dark:text-slate-200">
                      {permit.student_id?.user_id?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {permit.student_id?.class_id?.name || "-"} &middot; {permit.reason}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {new Date(permit.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
