import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import ClassGroup from "@/models/ClassGroup";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StudentFormModalClient from "./StudentFormModalClient";

export default async function DataSiswaPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; page?: string }> 
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const query = resolvedParams.query || "";
  const limit = 10;
  const skip = (page - 1) * limit;

  await dbConnect();

  // Mongoose filter logic
  const filter = query ? { "parent_info.father_name": { $regex: query, $options: "i" } } : {}; 
  // Normally search via user_id -> name, but we don't have lookup easily in lean() without aggregate.
  
  const students = await Student.find(filter)
    .populate("user_id", "name nip_nisn email")
    .populate("class_id", "name")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Student.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const classes = JSON.parse(JSON.stringify(await ClassGroup.find().lean()));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Data Siswa</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Total {total} Siswa terdaftar pada basis data</p>
        </div>
        <StudentFormModalClient classes={classes} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="dark:border-white/5">
              <TableHead className="dark:text-slate-300">NISN</TableHead>
              <TableHead className="dark:text-slate-300">Nama Siswa</TableHead>
              <TableHead className="dark:text-slate-300">L/P</TableHead>
              <TableHead className="dark:text-slate-300">Kelas</TableHead>
              <TableHead className="text-right dark:text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow className="dark:border-white/5 hover:dark:bg-slate-800/30">
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400 italic">
                  Tidak ada data siswa ditemukan
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: any) => (
                <TableRow key={student._id.toString()} className="dark:border-white/5 hover:dark:bg-slate-800/30 transition-colors">
                  <TableCell className="font-mono text-slate-600 dark:text-slate-400">{student.user_id?.nip_nisn || "-"}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">{student.user_id?.name || "Unknown User"}</TableCell>
                  <TableCell className="dark:text-slate-300">{student.gender}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wider">
                      {student.class_id?.name || "BELUM ADA KELAS"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <StudentFormModalClient classes={classes} student={JSON.parse(JSON.stringify(student))} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */ }
        {totalPages > 1 && (
           <div className="p-4 border-t border-slate-100 dark:border-white/5 flex gap-4 md:justify-between items-center text-sm text-slate-500 dark:text-slate-400 flex-col md:flex-row">
             <span>Halaman {page} dari {totalPages}</span>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" disabled={page === 1} className="dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800">Sebelumnya</Button>
               <Button variant="outline" size="sm" disabled={page === totalPages} className="dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800">Selanjutnya</Button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
