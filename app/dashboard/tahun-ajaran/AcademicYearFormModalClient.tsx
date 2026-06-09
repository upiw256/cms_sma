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
import { Plus, Loader2, Edit2 } from "lucide-react";
import { createAcademicYear, updateAcademicYear } from "@/actions/academicYear";
import { showToast, showAlert } from "@/lib/swal";

// Helper: format Date ke yyyy-MM-dd untuk input[type=date]
function toDateInput(d?: string | Date): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

// Helper: generate name otomatis dari tanggal
function generateName(start: string): string {
  if (!start) return "";
  const d = new Date(start);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  // Ganjil: Juli–Des (Bulan 6–11), Genap: Jan–Jun (0–5)
  const semester = month >= 6 ? "Ganjil" : "Genap";
  const yearStr = semester === "Ganjil" ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  return `${yearStr} — Semester ${semester}`;
}

export default function AcademicYearFormModalClient({
  year,
}: {
  year?: any;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!year;

  const [formData, setFormData] = useState({
    name: year?.name || "",
    start_date: toDateInput(year?.start_date),
    end_date: toDateInput(year?.end_date),
    is_active: year?.is_active || false,
  });

  const handleStartDateChange = (v: string) => {
    const autoName = generateName(v);
    setFormData((f) => ({ ...f, start_date: v, name: autoName || f.name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      showAlert({ title: "Data Tidak Lengkap", text: "Isi tanggal mulai dan selesai!", icon: "warning" });
      return;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      showAlert({ title: "Tanggal Tidak Valid", text: "Tanggal mulai harus sebelum tanggal selesai!", icon: "warning" });
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateAcademicYear(year._id, formData)
        : await createAcademicYear(formData);

      if (result.success) {
        setOpen(false);
        showToast(
          isEditing ? "Tahun ajaran berhasil diperbarui!" : "Tahun ajaran berhasil ditambahkan!",
          "success"
        );
        if (!isEditing) {
          setFormData({ name: "", start_date: "", end_date: "", is_active: false });
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
            <Plus className="w-4 h-4 mr-2" /> Tambah Tahun Ajaran
          </Button>
        )}
      </>

      <DialogContent className="max-w-md dark:bg-slate-900 border-white/10 text-slate-800 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="dark:bg-slate-800 dark:border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nama Periode <span className="text-red-500">*</span></Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dark:bg-slate-800 dark:border-white/10"
              placeholder="Contoh: 2025/2026 — Semester Ganjil"
            />
            <p className="text-xs text-slate-400">Nama diisi otomatis dari tanggal mulai.</p>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 accent-emerald-500"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                Jadikan Tahun Ajaran Aktif saat ini
              </Label>
            </div>
          )}

          <div className="flex justify-end pt-2">
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
              {isEditing ? "Simpan Perubahan" : "Tambah Tahun Ajaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
