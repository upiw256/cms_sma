import dbConnect from "@/lib/db";
import ClassGroup from "@/models/ClassGroup";
import Subject from "@/models/Subject";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import AcademicYear from "@/models/AcademicYear";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ClassFormModalClient from "./ClassFormModalClient";
import ClassDetailModalClient from "./ClassDetailModalClient";
import SubjectFormModalClient from "./SubjectFormModalClient";
import SubjectDeleteButtonClient from "./SubjectDeleteButtonClient";

export default async function DataKelasPage() {
  await dbConnect();

  // Ambil tahun ajaran yang sedang aktif langsung dari model AcademicYear
  const activeYear = await AcademicYear.findOne({ is_active: true }).lean();
  const activeAcademicYearId = (activeYear as any)?._id?.toString() || undefined;

  const classes = await ClassGroup.find()
    .populate({
      path: "homeroom_teacher_id",
      populate: { path: "user_id", select: "name" }
    })
    .lean();

  const subjects = await Subject.find().lean();

  const teachers = await Teacher.find()
    .populate("user_id", "name")
    .lean();

  const students = await Student.find()
    .populate("user_id", "name nip_nisn")
    .lean();

  // Group students by class
  const studentsByClass = students.reduce((acc: any, student: any) => {
    const classId = student.class_id?.toString();
    if (classId) {
      if (!acc[classId]) acc[classId] = [];
      acc[classId].push(student);
    }
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-slide-up pb-10">
      {/* Kolom Kelas */}
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Rombongan Belajar (Kelas)</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Penempatan siswa dan Wali Kelas</p>
          </div>
          <ClassFormModalClient 
            activeAcademicYearId={activeAcademicYearId} 
            teachers={JSON.parse(JSON.stringify(teachers))} 
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="dark:border-white/5">
                <TableHead className="dark:text-slate-300">Nama Kelas / Ruang</TableHead>
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
                classes.map((cls: any) => {
                  const classId = cls._id.toString();
                  const classStudents = studentsByClass[classId] || [];
                  const serializedCls = JSON.parse(JSON.stringify(cls));
                  return (
                    <TableRow key={classId} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="font-bold dark:text-white">{cls.name}</div>
                        {cls.room_name && <div className="text-xs text-slate-500">{cls.room_name}</div>}
                      </TableCell>
                      <TableCell className="dark:text-slate-300">{cls.grade_level}</TableCell>
                      <TableCell className="dark:text-slate-300">{cls.homeroom_teacher_id?.user_id?.name || "-"}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <ClassDetailModalClient 
                           classData={serializedCls} 
                           students={JSON.parse(JSON.stringify(classStudents))} 
                        />
                        <ClassFormModalClient 
                           activeAcademicYearId={activeAcademicYearId} 
                           teachers={JSON.parse(JSON.stringify(teachers))} 
                           classData={serializedCls}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
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
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Kurikulum Merdeka — Fase E (Kelas X) & Fase F (Kelas XI-XII)</p>
          </div>
          <SubjectFormModalClient />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="dark:border-white/5">
                <TableHead className="dark:text-slate-300 w-16">Kode</TableHead>
                <TableHead className="dark:text-slate-300">Nama Mata Pelajaran</TableHead>
                <TableHead className="dark:text-slate-300 hidden sm:table-cell">Fase</TableHead>
                <TableHead className="dark:text-slate-300 hidden md:table-cell">Tipe</TableHead>
                <TableHead className="dark:text-slate-300 hidden md:table-cell text-center">JP/Minggu</TableHead>
                <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow className="dark:border-white/5 hover:dark:bg-slate-800/30">
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400 italic">Kosong</TableCell>
                </TableRow>
              ) : (
                subjects.map((sub: any) => {
                  const serializedSub = JSON.parse(JSON.stringify(sub));
                  const typeBadge: Record<string, string> = {
                    Wajib: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
                    Pilihan: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20",
                    Kelompok_IPA: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
                    Kelompok_IPS: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
                    "Muatan Lokal": "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600",
                    Prakarya: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
                  };
                  const typeLabel: Record<string, string> = {
                    Kelompok_IPA: "Kel. IPA",
                    Kelompok_IPS: "Kel. IPS",
                    "Muatan Lokal": "Mulok",
                    Wajib: "Wajib",
                    Pilihan: "Pilihan",
                    Prakarya: "Prakarya",
                  };
                  return (
                    <TableRow key={sub._id.toString()} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{sub.code}</TableCell>
                      <TableCell className="font-semibold dark:text-slate-300">{sub.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-white/10">
                          Fase {sub.phase || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${typeBadge[sub.subject_type] || typeBadge["Wajib"]}`}>
                          {typeLabel[sub.subject_type] || sub.subject_type}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.jp_per_week ?? "—"}</span>
                        <span className="text-xs text-slate-400 ml-1">JP</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <SubjectFormModalClient subject={serializedSub} />
                          <SubjectDeleteButtonClient id={sub._id.toString()} />
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
    </div>
  );
}
