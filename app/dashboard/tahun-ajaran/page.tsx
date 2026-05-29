import dbConnect from "@/lib/db";
import AcademicYear from "@/models/AcademicYear";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function DataTahunAjaranPage() {
  await dbConnect();
  
  const years = await AcademicYear.find().sort({ start_date: -1 }).lean();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tahun Ajaran & Semester</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Konfigurasi cut-off data akademik aktif</p>
        </div>
        <Button className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">
          Tambah Resolusi Tahun
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="dark:border-white/5">
              <TableHead className="dark:text-slate-300">Nama Periode</TableHead>
              <TableHead className="dark:text-slate-300">Mulai</TableHead>
              <TableHead className="dark:text-slate-300">Selesai</TableHead>
              <TableHead className="dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.length === 0 ? (
              <TableRow className="dark:border-white/5 hover:dark:bg-slate-800/30">
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400 italic">
                  Belum ada tahun ajaran.
                </TableCell>
              </TableRow>
            ) : (
              years.map((y: any) => (
                <TableRow key={y._id.toString()} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                  <TableCell className="font-bold dark:text-white">{y.name}</TableCell>
                  <TableCell className="dark:text-slate-300">{new Date(y.start_date).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="dark:text-slate-300">{new Date(y.end_date).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    {y.is_active ? (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase">Aktif</span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold uppercase">Arsip</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!y.is_active && <Button variant="outline" size="sm" className="dark:border-white/10 dark:hover:bg-slate-800 dark:text-slate-300">Set Aktif</Button>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
