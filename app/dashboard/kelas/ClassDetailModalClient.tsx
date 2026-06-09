"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";

export default function ClassDetailModalClient({
  classData,
  students
}: {
  classData: any;
  students: any[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="dark:border-white/10 dark:hover:bg-slate-800 dark:text-slate-300">
         <Users className="w-4 h-4 mr-2" /> Detail Siswa ({students.length})
      </Button>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col dark:bg-slate-900 border-white/10 text-slate-800 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl">
             Detail Kelas {classData.name} 
             {classData.room_name && <span className="text-sm ml-2 text-slate-500 font-normal border-l border-slate-300 dark:border-slate-700 pl-2">Ruangan: {classData.room_name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-2 mb-2">
           <div className="flex justify-between text-sm">
             <span className="text-slate-500">Wali Kelas:</span>
             <span className="font-semibold">{classData.homeroom_teacher_id?.user_id?.name || "Belum ditentukan"}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-slate-500">Tingkat:</span>
             <span className="font-semibold">{classData.grade_level}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-slate-500">Total Siswa:</span>
             <span className="font-semibold">{students.length} Siswa</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
           {students.length === 0 ? (
             <div className="text-center py-10 text-slate-500 italic">Belum ada siswa yang ditempatkan di kelas ini.</div>
           ) : (
             <div className="space-y-2 mt-2">
               {students.map((student, idx) => (
                 <div key={student._id.toString()} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-bold rounded-lg shrink-0 text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{student.user_id?.name || "Unknown"}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{student.user_id?.nip_nisn || "-"}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                      {student.gender}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
