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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Edit2 } from "lucide-react";
import { createTeacher, updateTeacher } from "@/actions/teacher";
import { showToast, showAlert } from "@/lib/swal";

export default function TeacherFormModalClient({
  subjects,
  teacher,
}: {
  subjects: any[];
  teacher?: any;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!teacher;

  const [formData, setFormData] = useState({
    name: teacher?.user_id?.name || "",
    nip_nisn: teacher?.user_id?.nip_nisn || "",
    email: teacher?.user_id?.email || "",
    password: "", 
    subject_id: teacher?.subject_id?._id || "none", // use "none" for empty
    employment_status: teacher?.employment_status || "PNS",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const dbData = {
        ...formData,
        subject_id: formData.subject_id === "none" ? undefined : formData.subject_id,
      };

      const result = isEditing
        ? await updateTeacher(teacher._id, dbData)
        : await createTeacher(dbData);

      if (result.success) {
        setOpen(false);
        showToast(isEditing ? "Data guru berhasil diperbarui!" : "Data guru berhasil ditambahkan!", "success");
        if (!isEditing) {
          setFormData({
            name: "",
            nip_nisn: "",
            email: "",
            password: "",
            subject_id: "none",
            employment_status: "PNS",
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
          <Button onClick={() => setOpen(true)} className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">
            <Plus className="w-4 h-4 mr-2" /> Tambah Guru
          </Button>
        )}
      </>
      <DialogContent className="max-w-md dark:bg-slate-900 border-white/10 text-slate-800 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Data Guru" : "Tambah Data Guru Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nama Lengkap (beserta gelar) <span className="text-red-500">*</span></Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
              placeholder="Dr. Budi Santoso, M.Pd"
            />
          </div>
          
          <div className="space-y-2">
            <Label>NIP / NUPTK <span className="text-red-500">*</span></Label>
            <Input
              required
              value={formData.nip_nisn}
              onChange={(e) => setFormData({ ...formData, nip_nisn: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label>Status Pegawai</Label>
            <Select
              value={formData.employment_status}
              onValueChange={(v) => setFormData({ ...formData, employment_status: v })}
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10">
                <SelectItem value="PNS">PNS</SelectItem>
                <SelectItem value="PPPK">PPPK</SelectItem>
                <SelectItem value="Honorer">Honorer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mata Pelajaran yang Diampu</Label>
            <Select
              value={formData.subject_id}
              onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
            >
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                <SelectValue>
                  {formData.subject_id === "none" || !formData.subject_id
                    ? <span className="text-slate-400">Pilih Mata Pelajaran</span>
                    : subjects.find((s) => s._id.toString() === formData.subject_id)?.name || "Belum Ditugaskan"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 border-white/10 max-h-64">
                <SelectItem value="none">Belum Ditugaskan</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub._id.toString()} value={sub._id.toString()}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Email (Opsional)</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label>Password {isEditing && "(Isi untuk mengubah)"}</Label>
            <Input
              type="password"
              placeholder={isEditing ? "Kosongkan jika tak diubah" : "Default: NIP / NUPTK"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
            />
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
              {isEditing ? "Simpan Perubahan" : "Simpan Data Guru"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
