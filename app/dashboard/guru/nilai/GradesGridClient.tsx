"use client";

import { showToast, showAlert } from "@/lib/swal";
import { useState, useTransition } from "react";
import { getGradesForClassAndSubject, saveBulkGrades } from "@/actions/grade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, FileText, Search } from "lucide-react";

export default function GradesGridClient({ filters }: { filters: { academicYears: any[], classes: any[], subjects: any[] } }) {
  const [isPending, startTransition] = useTransition();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [grades, setGrades] = useState<any[]>([]);
  const [hasQueried, setHasQueried] = useState(false);

  const fetchGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedYear) return;
    
    startTransition(async () => {
      try {
        const data = await getGradesForClassAndSubject(selectedClass, selectedSubject, selectedYear);
        setGrades(data);
        setHasQueried(true);
      } catch (err: any) {
        showAlert({ text: err.message, icon: "error" });
      }
    });
  };

  const updateGrade = (index: number, field: string, value: string) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setGrades(prev => {
      const newGrades = [...prev];
      newGrades[index][field] = num;
      // Auto logic final_score preview on client side
      const tugas = newGrades[index].tugas || 0;
      const uts = newGrades[index].uts || 0;
      const uas = newGrades[index].uas || 0;
      newGrades[index].final_score = Math.round(tugas * 0.3 + uts * 0.3 + uas * 0.4);
      return newGrades;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveBulkGrades(selectedClass, selectedSubject, selectedYear, grades);
      if (res.success) {
        showToast("Nilai berhasil disimpan!", "success");
        fetchGrades(); // Refresh data to get calculated descriptions from server
      } else {
        showAlert({ text: res.message, icon: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
        <div>
          <Label className="dark:text-slate-300">Tahun Ajaran</Label>
          <Select value={selectedYear} onValueChange={(v: string | null) => setSelectedYear(v || "")}>
            <SelectTrigger className="mt-1 dark:bg-slate-800 dark:border-white/10">
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              {filters.academicYears.map(y => (
                <SelectItem key={y._id} value={y._id}>{y.name} - {y.semester}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="dark:text-slate-300">Kelas</Label>
          <Select value={selectedClass} onValueChange={(v: string | null) => setSelectedClass(v || "")}>
            <SelectTrigger className="mt-1 dark:bg-slate-800 dark:border-white/10">
              <SelectValue placeholder="Pilih Kelas..." />
            </SelectTrigger>
            <SelectContent>
              {filters.classes.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="dark:text-slate-300">Mata Pelajaran</Label>
          <Select value={selectedSubject} onValueChange={(v: string | null) => setSelectedSubject(v || "")}>
            <SelectTrigger className="mt-1 dark:bg-slate-800 dark:border-white/10">
              <SelectValue placeholder="Pilih Mapel..." />
            </SelectTrigger>
            <SelectContent>
              {filters.subjects.map(s => (
                <SelectItem key={s._id} value={s._id}>{s.name} ({s.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchGrades} disabled={isPending || !selectedClass || !selectedSubject || !selectedYear} className="w-full bg-blue-600 hover:bg-blue-700">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Tampilkan Data
          </Button>
        </div>
      </div>

      {hasQueried && grades.length === 0 && (
        <div className="text-center p-8 text-slate-500">Tidak ada murid di kelas ini.</div>
      )}

      {hasQueried && grades.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                  <th className="px-4 py-3 font-semibold w-24">Tugas (30%)</th>
                  <th className="px-4 py-3 font-semibold w-24">UTS (30%)</th>
                  <th className="px-4 py-3 font-semibold w-24">UAS (40%)</th>
                  <th className="px-4 py-3 font-semibold w-24 text-center">Akhir</th>
                  <th className="px-4 py-3 font-semibold w-24 text-center">Grade</th>
                  <th className="px-4 py-3 font-semibold">Deskripsi Otomatis</th>
                  <th className="px-4 py-3 font-semibold text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={g.student_id} className="border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{g.student_name}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0" max="100"
                        value={g.tugas || ""}
                        onChange={(e) => updateGrade(i, "tugas", e.target.value)}
                        className="h-8 text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0" max="100"
                        value={g.uts || ""}
                        onChange={(e) => updateGrade(i, "uts", e.target.value)}
                        className="h-8 text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0" max="100"
                        value={g.uas || ""}
                        onChange={(e) => updateGrade(i, "uas", e.target.value)}
                        className="h-8 text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-white">
                      {g.final_score}
                      {g.final_score < g.kkm && <span className="ml-1 text-[10px] text-red-500 font-normal block tracking-tighter">(&lt; KKM {g.kkm})</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      <span className={`px-2 py-0.5 rounded text-xs ${g.grade_letter === 'A' ? 'bg-emerald-100 text-emerald-700' : g.grade_letter === 'B' ? 'bg-blue-100 text-blue-700' : g.grade_letter === 'C' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {g.grade_letter}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                      {g.description || <span className="italic text-slate-400">Deskripsi akan di-generate setelah simpan</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a href={`/api/export-rapor/${g.student_id}/${selectedYear}`} target="_blank" rel="noopener noreferrer" title="Cetak Rapor PDF" className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-medium shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors">
                        <FileText className="w-4 h-4 text-rose-500" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button disabled={isPending} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Permanen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
