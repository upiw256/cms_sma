import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";
import Subject from "@/models/Subject";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TeacherFormModalClient from "./TeacherFormModalClient";

export default async function DataGuruPage() {
  await dbConnect();
  
  const teachers = await Teacher.find()
    .populate("user_id", "name nip_nisn email")
    .populate("subject_id", "name")
    .lean();

  const subjects = await Subject.find().lean();
  const serializedSubjects = JSON.parse(JSON.stringify(subjects));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Data Guru</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sistem Penugasan Pengajaran dan IKI</p>
        </div>
        <TeacherFormModalClient subjects={serializedSubjects} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="dark:border-white/5">
              <TableHead className="dark:text-slate-300">NIP / NUPTK</TableHead>
              <TableHead className="dark:text-slate-300">Nama Lengkap</TableHead>
              <TableHead className="dark:text-slate-300">Mata Pelajaran</TableHead>
              <TableHead className="dark:text-slate-300">Status Pegawai</TableHead>
              <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow className="dark:border-white/5 hover:dark:bg-slate-800/30">
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400 italic">
                  Tidak ada data guru ditemukan
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher: any) => {
                 const serializedTeacher = JSON.parse(JSON.stringify(teacher));
                 return (
                   <TableRow key={teacher._id.toString()} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                    <TableCell className="font-mono text-slate-600 dark:text-slate-400">{teacher.user_id?.nip_nisn || "-"}</TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">{teacher.user_id?.name || "Unknown User"}</TableCell>
                    <TableCell className="dark:text-slate-300">{teacher.subject_id?.name || "Belum Ditugaskan"}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-bold tracking-wider">
                        {teacher.employment_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2 flex items-center justify-end">
                      <Button variant="outline" size="sm" className="mr-2 dark:border-white/10 dark:hover:bg-slate-800 dark:text-slate-300">Tugas</Button>
                      <TeacherFormModalClient subjects={serializedSubjects} teacher={serializedTeacher} />
                    </TableCell>
                  </TableRow>
                 )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
