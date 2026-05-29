import dbConnect from "@/lib/db";
import ClassGroup from "@/models/ClassGroup";
import Subject from "@/models/Subject";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function DataKelasPage() {
  await dbConnect();
  
  const classes = await ClassGroup.find()
    .populate({
      path: "homeroom_teacher_id",
      populate: { path: "user_id", select: "name" }
    })
    .lean();

  const subjects = await Subject.find().lean();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-slide-up">
      {/* Kolom Kelas */}
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Rombongan Belajar (Kelas)</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Penempatan siswa dan Wali Kelas</p>
          </div>
          <Button size="sm" className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">Tambah Kelas</Button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="dark:border-white/5">
                <TableHead className="dark:text-slate-300">Nama Kelas</TableHead>
                <TableHead className="dark:text-slate-300">Tingkat</TableHead>
                <TableHead className="dark:text-slate-300">Wali Kelas</TableHead>
                <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow className="dark:border-white/5 hover:dark:bg-slate-800/30">
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400 italic">Kosong</TableCell>
                </TableRow>
              ) : (
                classes.map((cls: any) => (
                  <TableRow key={cls._id.toString()} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                    <TableCell className="font-bold dark:text-white">{cls.name}</TableCell>
                    <TableCell className="dark:text-slate-300">{cls.grade_level}</TableCell>
                    <TableCell className="dark:text-slate-300">{cls.homeroom_teacher_id?.user_id?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="dark:border-white/10 dark:hover:bg-slate-800 dark:text-slate-300">Siswa</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Kolom Mapel */}
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kurikulum (Mata Pelajaran)</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Kode dan Nama Mapel Nasional</p>
          </div>
          <Button size="sm" variant="secondary" className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Tambah Mapel</Button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="dark:border-white/5">
                <TableHead className="dark:text-slate-300">Kode</TableHead>
                <TableHead className="dark:text-slate-300">Nama Mata Pelajaran</TableHead>
                <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow className="dark:border-white/5 hover:dark:bg-slate-800/30">
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500 dark:text-slate-400 italic">Kosong</TableCell>
                </TableRow>
              ) : (
                subjects.map((sub: any) => (
                  <TableRow key={sub._id.toString()} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                    <TableCell className="font-mono text-slate-600 dark:text-slate-400">{sub.code}</TableCell>
                    <TableCell className="font-semibold dark:text-slate-300">{sub.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:border-white/10 dark:hover:bg-slate-800">Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
