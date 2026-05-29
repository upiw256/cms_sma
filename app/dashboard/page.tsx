import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import ClassGroup from "@/models/ClassGroup";
import { Users, UserCog, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardMainPage() {
  const session = await auth();
  await dbConnect();

  const totalSiswa = await Student.countDocuments();
  const totalGuru = await Teacher.countDocuments();
  const totalKelas = await ClassGroup.countDocuments();

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Utama</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
            Selamat datang kembali, <span className="font-semibold text-slate-700 dark:text-slate-300">{session?.user?.name}</span>. 
            Berikut adalah ringkasan eksekutif Sistem Informasi Akademik.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl shadow-blue-900/5 dark:shadow-black/20 rounded-2xl overflow-hidden relative group bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center ring-4 ring-blue-50 dark:ring-blue-500/10">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                <TrendingUp className="w-3 h-3" /> +2.5%
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs mb-1">Total Siswa Aktif</h3>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalSiswa || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-violet-900/5 dark:shadow-black/20 rounded-2xl overflow-hidden relative group bg-white dark:bg-slate-900">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center ring-4 ring-violet-50 dark:ring-violet-500/10">
                <UserCog className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs mb-1">Total Tenaga Pendidik</h3>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalGuru || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-amber-900/5 dark:shadow-black/20 rounded-2xl overflow-hidden relative group bg-white dark:bg-slate-900">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center ring-4 ring-amber-50 dark:ring-amber-500/10">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs mb-1">Rombongan Belajar</h3>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalKelas || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-white/5 p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Aktivitas Terkini</h3>
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Lihat Semua</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm italic">Belum ada aktivitas yang direkam hari ini.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-white/5 p-6 min-h-[400px]">
           <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6">Tugas & Approval</h3>
           <div className="space-y-4">
             {/* Empty state for tasks */}
             <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
               <p className="text-xs text-slate-500 py-4">Semua tugas sudah diselesaikan! 🎉</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
