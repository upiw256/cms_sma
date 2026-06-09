"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Edit2 } from "lucide-react";
import { createClass, updateClass } from "@/actions/class";
import { showToast, showAlert } from "@/lib/swal";

export default function ClassFormModalClient({
  activeAcademicYearId,
  teachers,
  classData,
}: {
  activeAcademicYearId?: string;
  teachers: any[];
  classData?: any;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!classData;

  const [formData, setFormData] = useState({
    name: classData?.name || "",
    room_name: classData?.room_name || "",
    grade_level: classData?.grade_level || 10,
    homeroom_teacher_id: classData?.homeroom_teacher_id?._id || "",
    academic_year_id: classData?.academic_year_id || activeAcademicYearId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.academic_year_id) {
       showAlert({ text: "Tahun Ajaran Aktif belum diatur!", icon: "error" });
       return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateClass(classData._id, formData)
        : await createClass(formData);

      if (result.success) {
        setOpen(false);
        showToast(isEditing ? "Kelas berhasil diperbarui!" : "Kelas berhasil ditambahkan!", "success");
        if (!isEditing) {
          setFormData({
            ...formData,
            name: "",
            room_name: "",
            grade_level: 10,
            homeroom_teacher_id: "",
          });
        }
      } else {
        showAlert({ title: "Terjadi Kesalahan", text: result.message || "Gagal menyimpan data", icon: "error" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <>
        {isEditing ? (
          <Button onClick={() => setOpen(true)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500">
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={() => setOpen(true)} size="sm" className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">
            <Plus className="w-4 h-4 mr-2" /> Tambah Kelas
          </Button>
        )}
      </>
      <DialogContent className="max-w-md dark:bg-slate-900 border-white/10 text-slate-800 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Data Kelas" : "Tambah Data Kelas Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nama Kelas <span className="text-red-500">*</span></Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
              placeholder="Contoh: X IPA 1"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Nama Ruangan</Label>
            <Input
              value={formData.room_name}
              onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
              placeholder="Contoh: Gedung A Lt 1 (R.103)"
            />
          </div>

          <div className="space-y-2">
            <Label>Tingkat (Grade Level) <span className="text-red-500">*</span></Label>
            <Select
              value={formData.grade_level.toString()}
              onValueChange={(v) => setFormData({ ...formData, grade_level: parseInt(v) })}
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                <SelectValue placeholder="Pilih Tingkat" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10">
                <SelectItem value="10">Kelas 10 (X)</SelectItem>
                <SelectItem value="11">Kelas 11 (XI)</SelectItem>
                <SelectItem value="12">Kelas 12 (XII)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wali Kelas</Label>
            <Select
              value={formData.homeroom_teacher_id}
              onValueChange={(v) => setFormData({ ...formData, homeroom_teacher_id: v })}
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                <SelectValue>
                  {formData.homeroom_teacher_id
                    ? teachers.find((t) => t._id.toString() === formData.homeroom_teacher_id)?.user_id?.name || "Guru"
                    : <span className="text-slate-400">Pilih Guru Wali Kelas</span>
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10 max-h-64">
                {teachers.map((t) => (
                  <SelectItem key={t._id.toString()} value={t._id.toString()}>
                    {t.user_id?.name || "Guru"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="mr-3 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Simpan Data Kelas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
