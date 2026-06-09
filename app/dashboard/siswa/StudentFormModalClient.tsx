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
import { Plus, Loader2 } from "lucide-react";
import { createStudent, updateStudent } from "@/actions/student";

import { showAlert, showToast } from "@/lib/swal";

export default function StudentFormModalClient({
  classes,
  student,
}: {
  classes: any[];
  student?: any;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: student?.user_id?.name || "",
    nip_nisn: student?.user_id?.nip_nisn || "",
    email: student?.user_id?.email || "",
    password: "", 
    class_id: student?.class_id?._id || "",
    gender: student?.gender || "L",
    birth_date: student?.birth_date ? new Date(student.birth_date).toISOString().split("T")[0] : "",
    address: student?.address || "",
    father_name: student?.parent_info?.father_name || "",
    mother_name: student?.parent_info?.mother_name || "",
    parent_phone: student?.parent_info?.phone || "",
  });

  const isEditing = !!student;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = isEditing
        ? await updateStudent(student._id, formData)
        : await createStudent(formData);

      if (result.success) {
        setOpen(false);
        showToast(isEditing ? "Data siswa berhasil diperbarui!" : "Data siswa berhasil ditambahkan!", "success");
        // Reset form if creating
        if (!isEditing) {
          setFormData({
            name: "",
            nip_nisn: "",
            email: "",
            password: "",
            class_id: "",
            gender: "L",
            birth_date: "",
            address: "",
            father_name: "",
            mother_name: "",
            parent_phone: "",
          });
        }
      } else {
        showAlert({ title: "Terjadi Kesalahan", text: result.message || "Gagal menyimpan data", icon: "error" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="outline" size="sm" className="dark:border-white/10 dark:hover:bg-slate-800 dark:text-slate-300">
              Edit
            </Button>
          ) : (
            <Button className="bg-[var(--primary-color)] hover:bg-blue-700 dark:text-white">
              <Plus className="w-4 h-4 mr-2" /> Tambah Siswa
            </Button>
          )
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 border-white/10 text-slate-800 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Data Siswa" : "Tambah Data Siswa Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label>NISN <span className="text-red-500">*</span></Label>
              <Input
                required
                value={formData.nip_nisn}
                onChange={(e) => setFormData({ ...formData, nip_nisn: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 border-white/10">
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select
                value={formData.class_id}
                onValueChange={(v) => setFormData({ ...formData, class_id: v })}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-white/10">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 border-white/10">
                  {classes.map((cls) => (
                    <SelectItem key={cls._id.toString()} value={cls._id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Alamat Lengkap</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Ayah</Label>
              <Input
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Ibu</Label>
              <Input
                value={formData.mother_name}
                onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>No Telepon Orang Tua</Label>
              <Input
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
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
                placeholder={isEditing ? "Kosongkan jika tak diubah" : "Default: NISN"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>
            
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
              {isEditing ? "Simpan Perubahan" : "Simpan Data Siswa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
